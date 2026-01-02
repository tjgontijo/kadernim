# PRD: Sistema de Billing MVP

## Overview

Sistema simplificado de pagamentos para o Kadernim SaaS, focado em **pagamentos únicos por período** (trimestral, semestral, anual) via **PIX** usando **Mercado Pago Checkout Pro**.

### Por que Checkout Pro?
- **Zero UI de pagamento** - Redirect para página do Mercado Pago
- **PIX + Cartão + Boleto** - Automaticamente disponíveis
- **1 dia de integração** - Extremamente simples
- **Segurança** - Mercado Pago cuida de tudo

### Modelo Mental

```
Usuário seleciona Plano + Período
        ↓
Gera "Preferência" no Mercado Pago
        ↓
Redirect para checkout.mercadopago.com
        ↓
Usuário paga (PIX, cartão, boleto)
        ↓
Webhook IPN confirma pagamento
        ↓
Atualiza Subscription.expiresAt
        ↓
Acesso liberado
```

---

## Core Features (MVP)

### 1. Planos com Preços por Período
- 3 planos: Starter, Pro, Business
- 3 períodos: Trimestral (3m), Semestral (6m), Anual (12m)
- Desconto progressivo: 0%, 10%, 20%

### 2. Checkout via Mercado Pago
- Botão "Assinar" gera preferência
- Redirect para checkout do MP
- Retorno para `/billing/success` ou `/billing/failure`

### 3. Webhook de Confirmação
- Endpoint `/api/webhooks/mercadopago`
- Processa `payment.approved`
- Atualiza subscription no banco

### 4. Gestão de Expiração
- Cron job diário verifica expirações
- Email 7 dias antes
- Email no dia da expiração
- Status muda para `expired` após prazo

### 5. Página de Billing
- Mostra plano atual e data de expiração
- Botão para renovar/fazer upgrade
- Histórico simples de pagamentos

---

## Data Models (Prisma)

```prisma
// Adicionar aos enums existentes
enum PlanInterval {
  quarterly     // 3 meses
  semiannual    // 6 meses
  yearly        // 12 meses
}

enum SubscriptionStatus {
  active        // Dentro do período pago
  expired       // Período expirou
  canceled      // Cancelado pelo usuário
}

enum PaymentStatus {
  pending       // Aguardando pagamento
  approved      // Pago com sucesso
  rejected      // Recusado
  refunded      // Estornado
}

// === MODELS ===

model Plan {
  id          String   @id @default(cuid())
  name        String                          // "Starter", "Pro", "Business"
  slug        String   @unique                // "starter", "pro", "business"
  description String?
  
  // Preços em centavos (base trimestral)
  priceQuarterlyCents  Int                    // Ex: 29100 = R$ 291,00
  priceSemiannualCents Int                    // Ex: 52380 = R$ 523,80 (10% off)
  priceYearlyCents     Int                    // Ex: 93120 = R$ 931,20 (20% off)
  
  // Limites do plano
  maxMetaProfiles      Int      @default(1)
  maxMetaAdAccounts    Int      @default(2)
  maxWhatsappInstances Int      @default(1)
  maxMembers           Int      @default(3)
  maxLeadsPerMonth     Int?
  
  // Features extras como JSON
  features             Json?                  // { "advancedReports": true, ... }
  
  active      Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt
  
  subscriptions Subscription[]
  
  @@map("plans")
}

model Subscription {
  id             String             @id @default(cuid())
  
  organizationId String             @unique
  organization   Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  planId         String
  plan           Plan               @relation(fields: [planId], references: [id])
  
  status         SubscriptionStatus @default(expired)
  
  // Período atual
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?      // Data de expiração
  
  // Último intervalo comprado
  lastInterval   PlanInterval?
  
  // Cancelamento
  canceledAt     DateTime?
  cancelReason   String?
  
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @default(now()) @updatedAt
  
  payments       Payment[]
  
  @@index([status])
  @@index([currentPeriodEnd])
  @@map("subscriptions")
}

model Payment {
  id             String        @id @default(cuid())
  
  subscriptionId String
  subscription   Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  // Dados do pagamento
  amountCents    Int
  interval       PlanInterval
  
  status         PaymentStatus @default(pending)
  
  // Mercado Pago
  mpPreferenceId String?       // ID da preferência criada
  mpPaymentId    String?       // ID do pagamento confirmado
  mpPaymentType  String?       // "pix", "credit_card", "ticket"
  
  // Período que este pagamento libera
  periodStart    DateTime?
  periodEnd      DateTime?
  
  paidAt         DateTime?
  
  // Metadata do webhook
  webhookPayload Json?
  
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @default(now()) @updatedAt
  
  @@unique([mpPreferenceId])
  @@unique([mpPaymentId])
  @@index([subscriptionId])
  @@index([status])
  @@map("payments")
}
```

### Atualizar Organization

```prisma
model Organization {
  // ... campos existentes ...
  
  subscription Subscription?
  
  // ... resto ...
}
```

---

## API Routes

```
# Planos
GET    /api/plans                    # Lista planos ativos com preços

# Checkout
POST   /api/billing/checkout         # Cria preferência MP, retorna URL
       Body: { planId, interval }
       Response: { checkoutUrl, paymentId }

# Subscription
GET    /api/billing/subscription     # Status atual da subscription
POST   /api/billing/cancel           # Cancela (não renova)

# Pagamentos
GET    /api/billing/payments         # Histórico de pagamentos

# Webhook
POST   /api/webhooks/mercadopago     # Recebe IPNs do Mercado Pago
```

---

## Fluxos Detalhados

### Flow 1: Primeira Assinatura

```
1. GET /api/plans
   → Retorna lista de planos com preços

2. Usuário seleciona: Plano "Pro" + "Semestral"

3. POST /api/billing/checkout
   Body: { planId: "pro", interval: "semiannual" }
   
   Backend:
   a) Cria/busca Subscription para a Organization
   b) Cria Payment com status pending
   c) Calcula período: now → now + 6 meses
   d) Cria Preferência no Mercado Pago:
      - title: "Kadernim Pro - 6 meses"
      - unit_price: 523.80
      - external_reference: payment.id
      - back_urls: { success, failure, pending }
      - notification_url: webhook
   e) Retorna { checkoutUrl, paymentId }

4. Frontend redireciona para checkoutUrl

5. Usuário paga (PIX, cartão, boleto)

6. Mercado Pago redireciona para /billing/success?payment_id=xxx

7. Webhook POST /api/webhooks/mercadopago
   Body: { action: "payment.updated", data: { id: "xxx" } }
   
   Backend:
   a) Busca payment pelo external_reference
   b) Consulta status no MP: GET /v1/payments/{id}
   c) Se approved:
      - Payment.status = approved
      - Payment.paidAt = now
      - Payment.mpPaymentId = id
      - Subscription.status = active
      - Subscription.currentPeriodStart = now
      - Subscription.currentPeriodEnd = now + 6 meses
   d) Envia email de confirmação

8. Usuário tem acesso às features do plano
```

### Flow 2: Renovação

```
1. Usuário acessa /settings/billing
2. Vê: "Seu plano expira em 15 dias"
3. Clica "Renovar"
4. Mesmo fluxo do checkout
5. Período é EXTENDIDO (não sobreposto):
   - Se faltam 15 dias, novo período = hoje + 6m + 15d
```

### Flow 3: Expiração

```
1. Cron job roda diariamente às 00:00

2. Busca subscriptions onde:
   - status = active
   - currentPeriodEnd < now

3. Para cada uma:
   - status = expired
   - Envia email "Sua assinatura expirou"

4. Busca subscriptions onde:
   - status = active
   - currentPeriodEnd BETWEEN now AND now + 7 days

5. Para cada uma:
   - Envia email "Sua assinatura expira em X dias"
```

---

## Mercado Pago Integration

### Instalação

```bash
npm install mercadopago
```

### Configuração

```typescript
// src/lib/mercadopago.ts
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export const preferenceClient = new Preference(client)
export const paymentClient = new Payment(client)
```

### Criar Preferência

```typescript
// src/services/billing/create-checkout.ts
import { preferenceClient } from '@/lib/mercadopago'

export async function createCheckout(params: {
  paymentId: string
  planName: string
  intervalLabel: string
  amountCents: number
  organizationId: string
}) {
  const preference = await preferenceClient.create({
    body: {
      items: [{
        id: params.paymentId,
        title: `Kadernim ${params.planName} - ${params.intervalLabel}`,
        quantity: 1,
        unit_price: params.amountCents / 100,
        currency_id: 'BRL',
      }],
      external_reference: params.paymentId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/billing/failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/billing/pending`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      metadata: {
        organization_id: params.organizationId,
      },
    },
  })
  
  return preference.init_point // URL do checkout
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/mercadopago/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { paymentClient } from '@/lib/mercadopago'
import { prisma } from '@/lib/db'
import { addMonths } from 'date-fns'

const INTERVAL_MONTHS = {
  quarterly: 3,
  semiannual: 6,
  yearly: 12,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mercado Pago envia diferentes tipos de notificação
    if (body.type !== 'payment' && body.action !== 'payment.updated') {
      return NextResponse.json({ received: true })
    }
    
    const mpPaymentId = body.data?.id
    if (!mpPaymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }
    
    // Buscar detalhes do pagamento no MP
    const mpPayment = await paymentClient.get({ id: mpPaymentId })
    
    // external_reference é o ID do nosso Payment
    const paymentId = mpPayment.external_reference
    if (!paymentId) {
      return NextResponse.json({ received: true }) // Não é nosso
    }
    
    // Buscar payment no banco
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true },
    })
    
    if (!payment) {
      console.error('Payment not found:', paymentId)
      return NextResponse.json({ received: true })
    }
    
    // Processar conforme status
    if (mpPayment.status === 'approved') {
      const now = new Date()
      const months = INTERVAL_MONTHS[payment.interval]
      
      // Se subscription já tem período válido, extende
      const periodStart = payment.subscription.currentPeriodEnd 
        && payment.subscription.currentPeriodEnd > now
          ? payment.subscription.currentPeriodEnd
          : now
      
      const periodEnd = addMonths(periodStart, months)
      
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'approved',
            paidAt: now,
            mpPaymentId: String(mpPaymentId),
            mpPaymentType: mpPayment.payment_type_id,
            periodStart,
            periodEnd,
            webhookPayload: mpPayment as any,
          },
        }),
        prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'active',
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            lastInterval: payment.interval,
          },
        }),
      ])
      
      // TODO: Enviar email de confirmação
    } else if (mpPayment.status === 'rejected') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'rejected',
          webhookPayload: mpPayment as any,
        },
      })
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook MP Error]', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

## Environment Variables

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx  # Token de produção ou sandbox
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx    # Para frontend (se usar SDK)

# Webhook (opcional para dev)
# Use ngrok ou similar para testar webhooks localmente
```

---

## UI Components

### Página de Billing (`/settings/billing/page.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│  Sua Assinatura                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │  [BADGE: Ativo]                                 │    │
│  │                                                 │    │
│  │  Plano Pro                                      │    │
│  │  Expira em: 15 de Março de 2026                │    │
│  │                                                 │    │
│  │  [████████░░] 25/30 dias restantes             │    │
│  │                                                 │    │
│  │  [Renovar]  [Mudar Plano]  [Cancelar]          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Limites do Plano                                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Meta Profiles     [██░░░] 2/5                  │    │
│  │  WhatsApp          [█░░░░] 1/3                  │    │
│  │  Membros           [███░░] 3/10                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Histórico de Pagamentos                                │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Data       │ Plano │ Período  │ Valor   │ Status│   │
│  │  01/01/2026 │ Pro   │ 6 meses  │ R$523   │  ✓    │   │
│  │  01/07/2025 │ Pro   │ 6 meses  │ R$523   │  ✓    │   │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Modal de Checkout

```
┌─────────────────────────────────────────────────────────┐
│  Assinar Plano Pro                              [X]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Escolha o período:                                     │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ Trimestral  │ │ Semestral   │ │   Anual     │       │
│  │             │ │ 10% OFF     │ │ 20% OFF     │       │
│  │  R$ 97/mês  │ │  R$ 87/mês  │ │  R$ 77/mês  │       │
│  │             │ │             │ │             │       │
│  │  R$ 291     │ │  R$ 523     │ │  R$ 931     │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                        ▲                                │
│                   (selecionado)                         │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Total: R$ 523,80                                       │
│  Acesso até: 02 de Julho de 2026                       │
│                                                         │
│  [        Continuar para Pagamento        ]            │
│                                                         │
│  Você será redirecionado para o Mercado Pago           │
│  para concluir o pagamento com PIX, cartão ou boleto.  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Planos Sugeridos

| Plano | Trimestral | Semestral (-10%) | Anual (-20%) | Perfis Meta | WhatsApp | Membros |
|-------|------------|------------------|--------------|-------------|----------|---------|
| **Starter** | R$ 67/mês (R$ 201) | R$ 60/mês (R$ 362) | R$ 53/mês (R$ 643) | 1 | 1 | 3 |
| **Pro** | R$ 97/mês (R$ 291) | R$ 87/mês (R$ 523) | R$ 77/mês (R$ 931) | 2 | 3 | 10 |
| **Business** | R$ 197/mês (R$ 591) | R$ 177/mês (R$ 1063) | R$ 157/mês (R$ 1891) | 5 | 10 | 25 |

---

## Cron Job: Verificar Expirações

```typescript
// src/app/api/cron/check-expirations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { addDays } from 'date-fns'

export async function GET(request: Request) {
  // Verificar header de autenticação do cron (Vercel, etc)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const now = new Date()
  
  // 1. Expirar subscriptions vencidas
  const expired = await prisma.subscription.updateMany({
    where: {
      status: 'active',
      currentPeriodEnd: { lt: now },
    },
    data: {
      status: 'expired',
    },
  })
  
  // 2. Buscar para enviar emails de aviso (7 dias, 3 dias, 1 dia)
  const warningDates = [7, 3, 1]
  
  for (const days of warningDates) {
    const targetDate = addDays(now, days)
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))
    
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'active',
        currentPeriodEnd: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        organization: {
          include: {
            members: {
              where: { role: 'owner' },
              include: { user: true },
            },
          },
        },
      },
    })
    
    // TODO: Enviar emails
    for (const sub of expiringSoon) {
      const owner = sub.organization.members[0]?.user
      if (owner?.email) {
        // sendExpirationWarningEmail(owner.email, days, sub)
      }
    }
  }
  
  return NextResponse.json({
    expired: expired.count,
    checked: true,
  })
}
```

---

## Development Roadmap

### Semana 1: Foundation
- [ ] Schema Prisma + migrations
- [ ] Seed de planos
- [ ] Configurar Mercado Pago SDK
- [ ] Endpoint GET /api/plans

### Semana 2: Checkout
- [ ] POST /api/billing/checkout
- [ ] POST /api/webhooks/mercadopago
- [ ] Páginas /billing/success e /billing/failure
- [ ] Testar fluxo completo em sandbox

### Semana 3: UI + Polish
- [ ] Página /settings/billing
- [ ] Modal de checkout
- [ ] Histórico de pagamentos
- [ ] Cron job de expiração
- [ ] Emails de aviso

### Semana 4: Limites
- [ ] LimitService com verificações
- [ ] UI de barras de progresso
- [ ] Bloqueio ao atingir limite
- [ ] Modal de upgrade

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Webhook não chega | Polling de status na página de success |
| Usuário não conclui pagamento | Payment fica pending, pode tentar de novo |
| Expiração no meio de uso | Grace period de 3 dias (opcional) |
| Mercado Pago fora do ar | Retry no webhook + status page |

---

## Próximos Passos (Pós-MVP)

1. **Boleto bancário** - Já suportado pelo MP
2. **Cupons de desconto** - Aplicar na preferência
3. **Notas fiscais** - Integração com NFe
4. **Dashboard admin** - MRR, churn, conversões
5. **Asaas como alternativa** - Para clientes que preferem
