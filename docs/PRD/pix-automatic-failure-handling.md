# PRD: Tratamento de Falhas em Pagamentos PIX Automático

**Data de Criação:** 2026-04-15  
**Versão:** 1.0  
**Status:** Draft  
**Prioridade:** Alta  

---

## 1. Visão Geral

Atualmente, quando um pagamento PIX automático falha (recusa de débito, autorização expirada, saldo insuficiente, etc), o sistema marca a subscription como `CANCELED` mas **não notifica o usuário** e **não oferece forma de reativar**.

Este PRD define o tratamento completo de falhas em PIX automático, incluindo notificações, tentativas de retry, reativação e visibilidade para o usuário.

---

## 2. Problema

### 2.1 Situação Atual
- ❌ Usuário não sabe que perdeu acesso (sem email)
- ❌ Sem forma de reativar a subscription
- ❌ Sem visibilidade do status de subscription no dashboard
- ❌ Sem diferenciação entre tipos de falha
- ❌ Sem retry automático de cobrança (além do que Asaas faz)

### 2.2 Impacto
- Churn aumenta (usuário pensa que está pagando, descobre acesso suspenso dias depois)
- Suporte recebe tickets desnecessários ("Por que perdi acesso?")
- Receita perdida por falta de reativação simples
- Experiência de usuário ruim

---

## 3. Objetivos

1. **Notificar** usuário quando PIX automático falha
2. **Rastrear** razão da falha (saldo insuficiente, autorização expirada, etc)
3. **Oferecer reativação** fácil (tentar cobrar de novo)
4. **Exibir status** de subscription no dashboard
5. **Log audit completo** de todas as tentativas

---

## 4. Escopo

### 4.1 Eventos Tratados (Webhooks Asaas)

| Evento | Situação | Ação |
|--------|----------|------|
| `PIX_AUTOMATIC_AUTHORIZATION_EXPIRED` | QR Code PIX expirou (não escaneado) | Mark EXPIRED |
| `PIX_AUTOMATIC_AUTHORIZATION_DENIED` | Banco recusou autorização | Mark DENIED |
| `PIX_AUTOMATIC_AUTHORIZATION_CANCELED` | Usuário cancelou no app do banco | Mark CANCELED_BY_USER |
| `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED` | Cobrança recorrente recusada (saldo insuficiente, etc) | Mark FAILED_DEBIT |
| `PAYMENT_RECEIVED` (após falha anterior) | Cobrança foi bem-sucedida | Reativar se estava FAILED |

### 4.2 Fora do Escopo
- Cobranças manuais de cartão
- Refunds/reembolsos
- Mudança de plano

---

## 5. Solução Proposta

### 5.1 Banco de Dados

Alterar `Subscription` para incluir:

```typescript
enum SubscriptionFailureReason {
  NONE = 'NONE'                    // Sem falha
  EXPIRED = 'EXPIRED'              // QR Code expirou
  DENIED = 'DENIED'                // Autorização negada
  CANCELED_BY_USER = 'CANCELED_BY_USER'
  FAILED_DEBIT = 'FAILED_DEBIT'    // Saldo insuficiente
  OTHER = 'OTHER'
}

model Subscription {
  // ... campos existentes ...
  
  // Novo: rastreamento de falhas
  status: 'INACTIVE' | 'ACTIVE' | 'FAILED' | 'CANCELED'  // Novo: FAILED
  failureReason: SubscriptionFailureReason?
  failureCount: Int @default(0)           // Quantas vezes falhou
  lastFailureAt: DateTime?                 // Última falha
  lastFailureMessage: String?              // Mensagem de erro do Asaas
  
  // Retry logic
  nextRetryAt: DateTime?                   // Quando tentar cobrar novamente
  lastRetryAt: DateTime?                   // Última tentativa de retry
  
  // Comunicação
  failureNotificationSentAt: DateTime?     // Quando enviou email
}
```

### 5.2 Estados de Subscription

```
INACTIVE (estado inicial)
    ↓
ACTIVE (após primeira cobrança bem-sucedida)
    ↓
FAILED (se cobrança recorrente falhar)
    ├→ ACTIVE (se cobrar de novo com sucesso)
    └→ CANCELED (se usuário não reativar em 30 dias)
    
CANCELED (terminal - não recoverable)
```

### 5.3 Fluxo de Falha

```
1. Webhook PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED
   ↓
2. handlePixAutomaticFailed() 
   - Marca como FAILED
   - Armazena failureReason
   - Incrementa failureCount
   - Agenda retry em 3 dias
   ↓
3. Envia email ao usuário
   - Explica por que falhou
   - CTA: "Reativar agora" (link para retry)
   ↓
4. Se usuário não reativa:
   - Tentar automaticamente em 3, 7, 14 dias (Asaas tenta, mas também tentamos)
   - Se falhar 3x, marcar como CANCELED
   ↓
5. Dashboard mostra status
   - "Seu pagamento foi recusado"
   - Botão "Tentar novamente"
   - Modo leitura degradado (sem acesso completo)
```

### 5.4 Endpoints Novos

#### **POST /api/v1/billing/subscription/{id}/retry**
```
Request: { }

Response: {
  success: boolean
  message: string
  nextRetryAt?: string
}
```

Retenta cobrança imediatamente.

#### **GET /api/v1/billing/subscription/status**
```
Response: {
  subscription: {
    id: string
    status: 'ACTIVE' | 'FAILED' | 'CANCELED'
    failureReason?: string
    failureMessage?: string
    nextRetryAt?: string
    failureCount: number
  }
}
```

---

## 6. User Experience

### 6.1 Email de Falha

**Assunto:** ⚠️ Seu pagamento PIX foi recusado - Kadernim Pro

**Corpo:**
```
Oi {nome},

Tentamos cobrar sua assinatura Kadernim Pro no PIX automático, 
mas a transação foi recusada pelo seu banco.

Razão: {failureReason em português}

O que fazer?
1. Verifique se você tem saldo na conta
2. Clique no botão abaixo para tentar novamente
3. Seu acesso continuará ativado enquanto isso

[TENTAR NOVAMENTE] (link com token temporário)

Tentaremos automaticamente em 3 dias.
Se precisar de ajuda: suporte@kadernim.com.br

---
Kadernim Pro
```

### 6.2 Dashboard - Card de Status

Se `subscription.status === FAILED`:

```
┌─────────────────────────────────────┐
│ ⚠️ PAGAMENTO RECUSADO               │
├─────────────────────────────────────┤
│ Tentativa falhou: saldo insuficiente│
│ Tentaremos novamente em 3 dias      │
│                                     │
│ [TENTAR AGORA] [DETALHES]          │
└─────────────────────────────────────┘
```

Se falhou 3x:
```
┌─────────────────────────────────────┐
│ ❌ ACESSO SUSPENSO                  │
├─────────────────────────────────────┤
│ Não conseguimos cobrar sua         │
│ assinatura. Seu acesso foi         │
│ temporariamente suspenso.           │
│                                     │
│ [REATIVAR AGORA] [FALAR COM SUPORTE]
└─────────────────────────────────────┘
```

### 6.3 Acesso Degradado

Quando `subscription.status === FAILED`:
- ✅ Pode continuar usando (não perde acesso imediatamente)
- ✅ Vê aviso no topo de cada página
- ❌ Não pode fazer uploads/downloads por 5 dias
- ❌ Sem acesso a novos materiais

Quando falhou 3x ou passaram 30 dias:
- ❌ Acesso completamente bloqueado
- ✅ Pode reativar em 1 clique (tenta cobrar de novo)

---

## 6.4 Estratégia de Notificação (Email + WhatsApp)

Você já tem uma infraestrutura robusta em `src/services/delivery/`:

```typescript
// Padrão existente (para autenticação)
const result = await authDeliveryService.send({
  email: user.email,
  type: 'otp',
  data: { otp: '123456' },
  channels: ['email', 'whatsapp']  // Ambos canais
})
```

**Para PIX Failure, seguir o mesmo padrão:**

1. **Estender tipos** em `src/services/delivery/types.ts`:
   ```typescript
   export type DeliveryType = 
     | 'magic-link' 
     | 'otp' 
     | 'password-reset' 
     | 'email-verification'
     | 'pix-failure'  // ← Novo
   ```

2. **Criar templates**:
   - Email: `src/services/mail/templates/pix-failure-email.tsx`
   - WhatsApp: `src/services/whatsapp/template/pix-failure.ts`

3. **Estender getters**:
   - `src/services/delivery/get-email.ts` (add case para pix-failure)
   - `src/services/delivery/get-whatsapp.ts` (add case para pix-failure)

4. **Usar no webhook**:
   ```typescript
   // Em webhook.handler.ts
   await authDeliveryService.send({
     email: user.email,
     type: 'pix-failure',
     data: {
       failureReason: 'FAILED_DEBIT',
       failureMessage: 'Saldo insuficiente na conta',
       retryUrl: `${baseUrl}/account/subscription/retry?id=${subscription.id}`
     },
     channels: ['email', 'whatsapp']
   })
   ```

**Benefícios desta abordagem:**
- ✅ Reutiliza infraestrutura existente
- ✅ Logging automático de timings
- ✅ Tratamento de erros unificado
- ✅ Máscara de email para privacidade
- ✅ Suporte redundante (se email falhar, WhatsApp tenta)

---

## 7. Implementação

### 7.1 Ordem de Prioridade

**Fase 1 (MVP):**
1. Alterar schema do Prisma (adicionar campos)
2. Alterar webhook handler para distinguir falhas
3. Enviar email básico
4. Endpoint de retry manual

**Fase 2 (Retry Automático):**
1. Job/cron para tentar cobrar novamente (em 3, 7, 14 dias)
2. Lógica de limite de tentativas (máx 3x)

**Fase 3 (UX Dashboard):**
1. Componente de aviso de pagamento
2. Card de status de subscription
3. Botão de reativação

### 7.2 Arquivos a Alterar / Criar

**Alterações:**
```
prisma/schema.prisma
  └─ Subscription model (adicionar campos)

src/lib/billing/services/webhook.handler.ts
  └─ handlePixAutomaticFailed() (refatorar)
```

**Arquivos Novos:**
```
src/lib/billing/services/subscription.service.ts
  └─ Classe com lógica de reativação e notificação

src/app/api/v1/billing/subscription/[id]/retry/route.ts
  └─ Endpoint POST para reativar assinatura

src/services/whatsapp/template/pix-failure.ts
  └─ Template WhatsApp para falha de PIX

src/services/mail/templates/pix-failure-email.tsx
  └─ Template Email (React Email) para falha de PIX

src/components/dashboard/billing/subscription-status.tsx
  └─ Componente de aviso de status (Fase 3)
```

**Reutilizar (já existe):**
```
✅ src/services/delivery/auth-delivery.ts
   └─ Infraestrutura de envio (email + WhatsApp)
   └─ Já envia via Email (Resend) + WhatsApp (UAZAPI)
   └─ Apenas estender com novo tipo de delivery

✅ src/services/mail/resend.ts
   └─ Provedor de email (Resend)

✅ src/services/whatsapp/uazapi/send-message.ts
   └─ Envio de mensagens WhatsApp (UAZAPI)

✅ src/services/whatsapp/template/auth-otp.ts
   └─ Builders de templates WhatsApp
```

### 7.3 Implementação Detalhada - Fase 1 (MVP)

#### **Passo 1: Alterar Schema Prisma**

```prisma
model Subscription {
  // ... campos existentes ...
  
  // Novo: tracking de falhas
  status: String @default("INACTIVE") // INACTIVE | ACTIVE | FAILED | CANCELED
  failureReason: String? // EXPIRED | DENIED | CANCELED_BY_USER | FAILED_DEBIT | OTHER
  failureCount: Int @default(0)
  lastFailureAt: DateTime?
  lastFailureMessage: String?
  
  // Retry
  nextRetryAt: DateTime?
  lastRetryAt: DateTime?
  
  // Comunicação
  failureNotificationSentAt: DateTime?
}
```

Gerar migration: `npx prisma migrate dev --name add_subscription_failure_tracking`

#### **Passo 2: Estender tipos de Delivery**

**`src/services/delivery/types.ts`:**
```typescript
export type DeliveryType = 
  | 'magic-link' 
  | 'otp' 
  | 'password-reset' 
  | 'email-verification'
  | 'pix-failure'  // ← Novo

export interface DeliveryData {
  url?: string
  otp?: string
  name?: string
  expiresIn?: number
  failureReason?: string      // ← Novo
  failureMessage?: string     // ← Novo
  retryUrl?: string          // ← Novo
  subscriptionId?: string    // ← Novo
}
```

#### **Passo 3: Criar Templates WhatsApp**

**`src/services/whatsapp/template/pix-failure.ts`:**
```typescript
export function buildPixFailureWhatsappMessage({
  name,
  failureReason,
  retryUrl,
}: {
  name: string
  failureReason: string
  retryUrl: string
}): string {
  const firstName = capitalizeFirstName(name)
  const reasons: Record<string, string> = {
    FAILED_DEBIT: 'Saldo insuficiente',
    EXPIRED: 'Código expirou',
    DENIED: 'Autorização negada',
    CANCELED_BY_USER: 'Cancelada no app do seu banco',
    OTHER: 'Erro desconhecido'
  }
  
  return (
    `Olá ${firstName}! ⚠️\n\n` +
    `Não conseguimos cobrar sua assinatura Kadernim Pro.\n\n` +
    `📌 *Motivo:* ${reasons[failureReason] || 'Erro na transação'}\n\n` +
    `💡 *O que fazer:*\n` +
    `1️⃣ Verifique o saldo da sua conta\n` +
    `2️⃣ Clique no link abaixo para tentar novamente\n` +
    `3️⃣ Seu acesso continua ativado enquanto isso!\n\n` +
    `${retryUrl}\n\n` +
    `Tentaremos automaticamente em 3 dias. 🔄`
  )
}
```

#### **Passo 4: Criar Template Email**

**`src/services/mail/templates/pix-failure-email.tsx`:**
```typescript
// Usar como base: src/services/mail/templates/otp-email.tsx
// Cores: import { colors } from './email-colors.ts'

interface PixFailureEmailProps {
  name: string
  failureReason: string
  retryUrl: string
  nextRetryDate: string
}

export const PixFailureEmail = ({
  name,
  failureReason,
  retryUrl,
  nextRetryDate,
}: PixFailureEmailProps) => {
  const reasons: Record<string, { title: string; description: string }> = {
    FAILED_DEBIT: {
      title: 'Saldo Insuficiente',
      description: 'Verifique se tem saldo para pagar sua assinatura mensal.'
    },
    // ... outros
  }
  
  const reason = reasons[failureReason] || { title: 'Erro', description: 'Ocorreu um erro.' }
  
  return (
    <Html>
      {/* ... estrutura similar ao OtpEmail ... */}
      <Body>
        <Container>
          <Section>
            <Text>Oi {name},</Text>
            <Text>Tentamos cobrar sua assinatura Kadernim Pro no PIX automático, mas a transação foi recusada.</Text>
            
            <Section style={{ backgroundColor: '#FEF3C7', padding: '20px' }}>
              <Text><strong>Motivo:</strong> {reason.title}</Text>
              <Text>{reason.description}</Text>
            </Section>
            
            <Text>O que fazer?</Text>
            <ul>
              <li>Verifique o saldo na sua conta</li>
              <li>Clique no botão abaixo para tentar novamente</li>
              <li>Seu acesso continua ativado enquanto isso!</li>
            </ul>
            
            <Button href={retryUrl}>TENTAR NOVAMENTE</Button>
            
            <Text>Tentaremos automaticamente em {nextRetryDate}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

#### **Passo 5: Estender Getters**

**`src/services/delivery/get-email.ts`:**
```typescript
case 'pix-failure':
  return {
    subject: '⚠️ Seu pagamento PIX foi recusado - Kadernim Pro',
    ...renderEmailTemplate(PixFailureEmail, {
      name: displayName,
      failureReason: data.failureReason || 'OTHER',
      retryUrl: data.retryUrl || '',
      nextRetryDate: '3 dias',
    })
  }
```

**`src/services/delivery/get-whatsapp.ts`:**
```typescript
case 'pix-failure':
  return buildPixFailureWhatsappMessage({
    name,
    failureReason: data.failureReason || 'OTHER',
    retryUrl: data.retryUrl || '',
  })
```

#### **Passo 6: Refatorar Webhook Handler**

**`src/lib/billing/services/webhook.handler.ts`:**
```typescript
private static async handlePixAutomaticFailed(payload: any) {
  const authorization = this.getPixAutomaticAuthorization(payload)
  if (!authorization?.id) {
    throw new Error('Invalid Pix Automático authorization payload')
  }

  billingLog('warn', 'Pix Automático Authorization Failed', {
    authorizationId: authorization.id,
    event: payload.event
  })

  // Mapear tipo de falha
  const failureReason = this.mapPixAutomaticFailureReason(payload.event)
  const nextRetry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias

  // Atualizar subscription
  const subscription = await prisma.subscription.updateMany({
    where: { asaasId: authorization.id },
    data: {
      status: 'FAILED',           // ← Novo estado
      failureReason,
      failureCount: { increment: 1 },
      lastFailureAt: new Date(),
      nextRetryAt: nextRetry,
    }
  })

  // Enviar notificação
  const user = await prisma.user.findFirst({
    where: { subscription: { some: { asaasId: authorization.id } } },
    select: { email: true, name: true, phone: true }
  })

  if (user) {
    // Reutilizar infraestrutura de delivery
    await authDeliveryService.send({
      email: user.email,
      type: 'pix-failure',
      data: {
        failureReason,
        retryUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription/retry?id=${subscription.id}`,
      },
      channels: ['email', 'whatsapp']
    })

    // Registrar que enviou notificação
    await prisma.subscription.update({
      where: { asaasId: authorization.id },
      data: { failureNotificationSentAt: new Date() }
    })
  }

  // Log audit
  await BillingAuditService.log({
    actor: AuditActor.SYSTEM,
    action: payload.event,
    entity: 'Subscription',
    entityId: authorization.id,
    asaasEventId: payload.id,
    metadata: {
      failureReason,
      userNotified: !!user,
      nextRetryAt: nextRetry.toISOString(),
    }
  })
}

private static mapPixAutomaticFailureReason(event: string): string {
  switch(event) {
    case 'PIX_AUTOMATIC_AUTHORIZATION_EXPIRED':
      return 'EXPIRED'
    case 'PIX_AUTOMATIC_AUTHORIZATION_DENIED':
      return 'DENIED'
    case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELED':
      return 'CANCELED_BY_USER'
    case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED':
      return 'FAILED_DEBIT'
    default:
      return 'OTHER'
  }
}
```

#### **Passo 7: Criar Endpoint de Retry**

**`src/app/api/v1/billing/subscription/[id]/retry/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'
import { SubscriptionService } from '@/lib/billing/services/subscription.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Tentar cobrar novamente via Asaas
    const result = await SubscriptionService.retryPixAutomaticPayment(subscription.id)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error retrying subscription:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### 7.4 Checklist

- [ ] Schema Prisma atualizado e migration criada
- [ ] Tipos de Delivery estendidos
- [ ] Template WhatsApp criado (`pix-failure.ts`)
- [ ] Template Email criado (`pix-failure-email.tsx`)
- [ ] Getters estendidos (email e WhatsApp)
- [ ] Webhook handler refatorado
- [ ] SubscriptionService criado com lógica de retry
- [ ] Endpoint de retry criado
- [ ] Testes unitários (templates, webhook)
- [ ] Testes manuais (simular falha no Asaas sandbox)
- [ ] Documentação atualizada

---

## 8. Critério de Aceitação

### Quando DONE?

1. **Notificação:** Usuário recebe email em < 5 min após falha
2. **Retry Manual:** Usuário consegue reativar em 1 clique
3. **Dashboard:** Status de subscription visível e atualizado
4. **Logging:** Todas as tentativas registradas em audit log
5. **Testes:** Cobertura >80% de cenários de falha
6. **Performance:** Webhook é processado em <2s

---

## 9. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Email rejeitado | Usuário não avisa | Webhook do Asaas já avisa, usar también SMS no futuro |
| Retry loop infinito | Custos altos | Limitar a 3 tentativas |
| Data inconsistente | Auditoria quebrada | Usar serverTimestamp do Prisma |
| Usuário nunca vê aviso | Churn | Banner no dashboard + email redundante |

---

## 10. Métricas de Sucesso

Após implementação, esperamos:

- ⬇️ **Churn -40%** em falhas de PIX (reativação simples)
- ⬆️ **Reativação 60%** de subscriptions que falharam
- ⬇️ **Tickets de suporte -50%** ("Por que perdi acesso?")
- ✅ **Audit completo** de 100% das falhas

---

## 11. Timeline Estimada

| Fase | Estimativa | Sprint |
|------|-----------|--------|
| Fase 1 (MVP) | 8h | Sprint atual |
| Fase 2 (Retry) | 12h | Sprint +1 |
| Fase 3 (UX) | 10h | Sprint +2 |
| **Total** | **30h** | |

---

## 12. Referências

- [Asaas - PIX Automático](https://docs.asaas.com/reference/criar-autorizacao-pix-automatico)
- [Asaas - Webhooks](https://docs.asaas.com/reference/listar-webhooks)
- Código atual: `src/lib/billing/services/webhook.handler.ts`

---

## Aprovação

- [ ] Product Owner
- [ ] Tech Lead
- [ ] Stakeholder
