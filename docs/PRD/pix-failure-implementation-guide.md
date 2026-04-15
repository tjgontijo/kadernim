# Guia de Implementação - PIX Automatic Failure Handling

**Documento de Referência Técnica para Desenvolvimento**

---

## 1. Estrutura de Dados

### 1.1 Nova Migration Prisma

```sql
-- Adicionar colunas à tabela subscription
ALTER TABLE "Subscription" ADD COLUMN "status" VARCHAR(50) DEFAULT 'INACTIVE';
ALTER TABLE "Subscription" ADD COLUMN "failureReason" VARCHAR(50);
ALTER TABLE "Subscription" ADD COLUMN "failureCount" INTEGER DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN "lastFailureAt" TIMESTAMP;
ALTER TABLE "Subscription" ADD COLUMN "lastFailureMessage" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "nextRetryAt" TIMESTAMP;
ALTER TABLE "Subscription" ADD COLUMN "lastRetryAt" TIMESTAMP;
ALTER TABLE "Subscription" ADD COLUMN "failureNotificationSentAt" TIMESTAMP;

-- Criar índices para performance
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_nextRetryAt_idx" ON "Subscription"("nextRetryAt");
```

### 1.2 Enums para Banco de Dados

```typescript
// prisma/schema.prisma

enum SubscriptionStatus {
  INACTIVE     // Ainda não pagou primeira vez
  ACTIVE       // Pagou, está ativo
  FAILED       // Cobrança falhou, aguardando retry
  CANCELED     // Cancelado permanentemente
}

enum SubscriptionFailureReason {
  EXPIRED         // PIX QR Code expirou
  DENIED          // Banco/instituição negou
  CANCELED_BY_USER // Usuário cancelou no app do banco
  FAILED_DEBIT    // Falha no débito automático
  OTHER           // Outro erro
}

model Subscription {
  // ... campos existentes ...
  status SubscriptionStatus @default(INACTIVE)
  failureReason SubscriptionFailureReason?
  failureCount Int @default(0)
  lastFailureAt DateTime?
  lastFailureMessage String?
  nextRetryAt DateTime?
  lastRetryAt DateTime?
  failureNotificationSentAt DateTime?
}
```

---

## 2. Payloads de Webhook Asaas

### 2.1 Evento: PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED

**Quando:** Cobrança automática foi recusada (saldo insuficiente, conta fechada, etc)

```json
{
  "id": "evt_12345",
  "event": "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED",
  "timestamp": "2026-04-15T14:30:00.000Z",
  "pixAutomaticAuthorization": {
    "id": "auth_67890",
    "status": "REFUSED",
    "refusalReason": "insufficient_funds",
    "refusalMessage": "Saldo insuficiente na conta do pagador",
    "customerId": "cus_000171375728",
    "contractId": "KADERNIM-SUB-6120-123456",
    "frequency": "MONTHLY",
    "value": 99.90,
    "nextChargingDate": "2026-05-15",
    "createdAt": "2026-04-15T14:00:00.000Z"
  }
}
```

### 2.2 Evento: PIX_AUTOMATIC_AUTHORIZATION_EXPIRED

**Quando:** QR Code PIX expirou (usuário não escaneou)

```json
{
  "id": "evt_12346",
  "event": "PIX_AUTOMATIC_AUTHORIZATION_EXPIRED",
  "timestamp": "2026-04-15T22:00:00.000Z",
  "pixAutomaticAuthorization": {
    "id": "auth_67891",
    "status": "EXPIRED",
    "customerId": "cus_000171375728",
    "contractId": "KADERNIM-SUB-6120-123457",
    "expirationDate": "2026-04-15T20:00:00.000Z",
    "createdAt": "2026-04-15T10:00:00.000Z"
  }
}
```

### 2.3 Evento: PIX_AUTOMATIC_AUTHORIZATION_DENIED

**Quando:** Banco rejeitou a autorização PIX

```json
{
  "id": "evt_12347",
  "event": "PIX_AUTOMATIC_AUTHORIZATION_DENIED",
  "timestamp": "2026-04-15T15:00:00.000Z",
  "pixAutomaticAuthorization": {
    "id": "auth_67892",
    "status": "DENIED",
    "denialReason": "bank_rejection",
    "denialMessage": "Instituição financeira recusou a autorização",
    "customerId": "cus_000171375728",
    "contractId": "KADERNIM-SUB-6120-123458",
    "createdAt": "2026-04-15T14:30:00.000Z"
  }
}
```

---

## 3. Fluxo de Processamento

### 3.1 Timeline de Execução

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Webhook chega: PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED
│ └─ Validar token Asaas
│ └─ Verificar idempotência (BillingAuditService)
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. handlePixAutomaticFailed()
│ └─ Mapear failureReason (FAILED_DEBIT)
│ └─ Calcular nextRetryAt (now + 3 days)
│ └─ Incrementar failureCount
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Atualizar Subscription no banco
│ └─ status: FAILED
│ └─ failureReason: FAILED_DEBIT
│ └─ nextRetryAt: 2026-04-18T14:30:00Z
│ └─ lastFailureAt: now
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Enviar notificação (Email + WhatsApp)
│ └─ authDeliveryService.send({
│     email: user.email,
│     type: 'pix-failure',
│     data: {
│       failureReason: 'FAILED_DEBIT',
│       retryUrl: '...',
│     },
│     channels: ['email', 'whatsapp']
│   })
│ └─ Aguarda 15s, envia WhatsApp em background
│ └─ Email é síncrono (< 2s)
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Registrar failureNotificationSentAt
│ └─ Para auditoria (se email/whatsapp foi enviado)
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Log no BillingAuditService
│ └─ action: PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED
│ └─ metadata: { failureReason, nextRetryAt, userNotified }
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Exemplos de Código

### 4.1 Serviço de Subscription (Novo)

**Arquivo:** `src/lib/billing/services/subscription.service.ts`

```typescript
import { prisma } from '@/lib/db'
import { authDeliveryService } from '@/services/delivery'
import { AsaasClient } from './asaas-client'

export class SubscriptionService {
  /**
   * Reativa subscription com falha tentando cobrar novamente
   */
  static async retryPixAutomaticPayment(subscriptionId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true }
    })

    if (!subscription || !subscription.asaasId) {
      throw new Error('Subscription not found or invalid')
    }

    // Verificar se não tentou muitas vezes
    if ((subscription.failureCount ?? 0) >= 3) {
      throw new Error('Maximum retry attempts reached')
    }

    try {
      // Tentar cobrar novamente via Asaas
      // (Asaas já tem retry automático, mas oferecemos retry manual também)
      
      // Atualizar tentativa
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          lastRetryAt: new Date(),
          // failureReason será atualizado quando webhook chegar
        }
      })

      return {
        success: true,
        message: 'Retry scheduled. You will receive a notification soon.',
        nextRetryAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    } catch (error) {
      throw new Error(`Failed to retry: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Marca subscription como CANCELED se falhou 3x em 30 dias
   */
  static async checkAndCancelFailedSubscriptions() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const failed = await prisma.subscription.findMany({
      where: {
        status: 'FAILED',
        failureCount: { gte: 3 },
        lastFailureAt: { lt: thirtyDaysAgo }
      }
    })

    for (const subscription of failed) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELED',
          isActive: false
        }
      })

      // Enviar notificação final
      // TODO: implementar notification de "acesso suspenso"
    }

    return failed.length
  }
}
```

### 4.2 Template WhatsApp

**Arquivo:** `src/services/whatsapp/template/pix-failure.ts`

```typescript
function capitalizeFirstName(fullName: string): string {
  const [firstName] = fullName.trim().split(/\s+/)
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

export type PixFailureParams = {
  name: string
  failureReason: 'EXPIRED' | 'DENIED' | 'CANCELED_BY_USER' | 'FAILED_DEBIT' | 'OTHER'
  retryUrl: string
}

export function buildPixFailureWhatsappMessage({
  name,
  failureReason,
  retryUrl,
}: PixFailureParams): string {
  const firstName = capitalizeFirstName(name)

  const reasons: Record<PixFailureParams['failureReason'], string> = {
    FAILED_DEBIT: 'Saldo insuficiente ou conta inativa',
    EXPIRED: 'Código QR expirou (não foi escaneado)',
    DENIED: 'Sua instituição bancária recusou',
    CANCELED_BY_USER: 'Você cancelou no app do banco',
    OTHER: 'Erro desconhecido na transação'
  }

  return (
    `Olá ${firstName}! ⚠️\n\n` +
    `Não conseguimos cobrar sua assinatura Kadernim Pro.\n\n` +
    `📌 *Motivo:* ${reasons[failureReason]}\n\n` +
    `💡 *O que fazer?*\n` +
    `1️⃣ Verifique o saldo da sua conta\n` +
    `2️⃣ Clique para tentar novamente:\n` +
    `${retryUrl}\n\n` +
    `3️⃣ Seu acesso continua ativado! ✅\n\n` +
    `🔄 Tentaremos automaticamente em 3 dias.\n` +
    `❓ Dúvidas? Responda este chat!`
  )
}
```

### 4.3 Extensão do Webhook Handler

**Arquivo:** `src/lib/billing/services/webhook.handler.ts`

```typescript
// Adicionar método auxiliar
private static mapPixAutomaticFailureReason(
  event: string
): 'EXPIRED' | 'DENIED' | 'CANCELED_BY_USER' | 'FAILED_DEBIT' | 'OTHER' {
  const mapping: Record<string, any> = {
    'PIX_AUTOMATIC_AUTHORIZATION_EXPIRED': 'EXPIRED',
    'PIX_AUTOMATIC_AUTHORIZATION_DENIED': 'DENIED',
    'PIX_AUTOMATIC_AUTHORIZATION_CANCELED': 'CANCELED_BY_USER',
    'PIX_AUTOMATIC_AUTHORIZATION_CANCELLED': 'CANCELED_BY_USER',
    'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED': 'FAILED_DEBIT',
    'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED': 'CANCELED_BY_USER',
    'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED': 'EXPIRED',
  }
  
  return mapping[event] || 'OTHER'
}

// Refatorar handlePixAutomaticFailed
private static async handlePixAutomaticFailed(payload: any) {
  const authorization = this.getPixAutomaticAuthorization(payload)
  if (!authorization?.id) {
    throw new Error('Invalid Pix Automático authorization payload')
  }

  const failureReason = this.mapPixAutomaticFailureReason(payload.event)
  const nextRetryAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  billingLog('warn', 'Pix Automático Failed', {
    authorizationId: authorization.id,
    event: payload.event,
    failureReason,
  })

  // Encontrar subscription
  const subscription = await prisma.subscription.findFirst({
    where: { asaasId: authorization.id },
    include: { user: { select: { id: true, email: true, name: true, phone: true } } }
  })

  if (!subscription) {
    billingLog('error', 'Subscription not found for failed Pix', {
      asaasId: authorization.id
    })
    return
  }

  // Atualizar com nova falha
  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'FAILED',
      failureReason,
      failureCount: { increment: 1 },
      lastFailureAt: new Date(),
      nextRetryAt,
      lastFailureMessage: authorization.refusalMessage || payload.event,
    }
  })

  // Enviar notificação
  if (subscription.user) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const retryUrl = `${baseUrl}/account/subscription/retry?id=${subscription.id}&token=${generateRetryToken(subscription.id)}`

    void authDeliveryService.send({
      email: subscription.user.email,
      type: 'pix-failure',
      data: {
        failureReason,
        retryUrl,
      },
      channels: ['email', 'whatsapp']
    }).then(() => {
      // Registrar que notificação foi enviada
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { failureNotificationSentAt: new Date() }
      })
    })
  }

  // Audit log
  await BillingAuditService.log({
    actor: AuditActor.SYSTEM,
    action: payload.event,
    entity: 'Subscription',
    entityId: subscription.id,
    asaasEventId: payload.id,
    metadata: {
      failureReason,
      failureCount: updated.failureCount,
      nextRetryAt: nextRetryAt.toISOString(),
      userNotified: !!subscription.user,
    }
  })
}
```

---

## 5. Testes

### 5.1 Teste do Webhook (Sandbox Asaas)

```bash
# 1. Simular falha no Asaas Sandbox
curl -X POST https://sandbox.asaas.com/api/v3/webhooks/simulate \
  -H "Authorization: Bearer your_sandbox_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED",
    "pixAutomaticAuthorization": {
      "id": "auth_test_123",
      "status": "REFUSED",
      "customerId": "cus_test_123",
      "frequency": "MONTHLY",
      "value": 99.90
    }
  }'

# 2. Verificar logs
tail -f logs/billing.log | grep "PIX_AUTOMATIC"

# 3. Verificar email enviado
# Usar console do Resend ou email temporário para testes
```

### 5.2 Teste do Retry Endpoint

```bash
# POST /api/v1/billing/subscription/{id}/retry
curl -X POST http://localhost:3000/api/v1/billing/subscription/sub_123/retry \
  -H "Cookie: better-auth.session_token=your_token" \
  -H "Content-Type: application/json" \
  -d '{}'

# Response:
# {
#   "success": true,
#   "message": "Retry scheduled. You will receive a notification soon.",
#   "nextRetryAt": "2026-04-18T14:30:00.000Z"
# }
```

---

## 6. Troubleshooting

### Problema: Email não é enviado após falha

**Causa Provável:** `authDeliveryService.send()` falha silenciosamente

**Solução:**
1. Verificar logs de `[auth_delivery]`
2. Confirmar `RESEND_API_KEY` está configurada
3. Testar template diretamente: `getEmailTemplate({ type: 'pix-failure', ... })`

### Problema: WhatsApp não chega

**Causa Provável:** 
- Número de telefone inválido (falta +55 ou dígitos incorretos)
- UAZAPI_TOKEN expirado ou inválido

**Solução:**
1. Validar formato do phone: `normalizarPhone(phone)` → deve retornar `55XXXXXXXXXXX`
2. Testar diretamente: `sendTextMessage({ phone: '5511999999999', message: '...' })`
3. Verificar dashboard UAZAPI para status da API

### Problema: Webhook é processado 2x

**Causa:** Asaas enviou webhook 2x (timeout da primeira requisição)

**Solução:** Já tratado por `BillingAuditService.isDuplicate()` 
- Verifica idempotência por `eventId`
- Retorna 200 na segunda vez sem processar

---

## 7. Dúvidas Frequentes

**P: Por que nexRetryAt é 3 dias?**  
R: Asaas tenta 5x em 9 dias. Nós oferecemos retry manual imediato + automático em 3 dias para dar tempo do usuário resolver.

**P: E se usuário não tiver phone no banco de dados?**  
R: Apenas email será enviado. `authDeliveryService` valida `user.phone` antes de enviar WhatsApp.

**P: Qual o status final quando falha 3x?**  
R: Muda para `CANCELED`. Usuário perde acesso e precisa reativar manualmente.

**P: Pode reativar infinitas vezes?**  
R: Sim, mas encorajamos via UI a ver status real (se ainda não tem saldo, não vai adiantar).
