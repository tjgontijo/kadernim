# Fluxo de Webhook para Planos Premium

## 📋 Como Funciona

### 1. **Cadastro dos Planos Premium**
Você cadastra os planos na tabela `PremiumPlan`:

```typescript
// Seed ou painel admin
await prisma.premiumPlan.create({
  data: {
    name: "Plano Premium - 3 Meses",
    slug: "premium-3-meses",
    productId: "12345678", // ID real do produto na Yampi
    store: "yampi",
    durationDays: 90
  }
});
```

### 2. **Webhook Recebe Compra**
Quando um usuário compra, o webhook da Yampi/Hotmart envia:

```json
{
  "product_id": "12345678",
  "customer_email": "usuario@email.com",
  "transaction_id": "TXN_ABC123",
  "status": "approved"
}
```

### 3. **Processamento do Webhook**

```typescript
// app/api/webhooks/yampi/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  
  // 1. Verificar se é um plano premium
  const plan = await prisma.premiumPlan.findUnique({
    where: { productId: data.product_id }
  });
  
  if (plan) {
    // É um plano premium! Liberar acesso total
    await grantPremiumAccess(data.customer_email, plan, data.transaction_id);
  } else {
    // É um recurso individual
    await grantIndividualResourceAccess(data.product_id, data.customer_email);
  }
}

async function grantPremiumAccess(
  email: string, 
  plan: PremiumPlan, 
  transactionId: string
) {
  const user = await prisma.user.findUnique({ where: { email } });
  
  // Calcular data de expiração
  const expiresAt = plan.durationDays 
    ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
    : null; // null = vitalício
  
  // Criar/atualizar assinatura
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      planId: plan.id,
      productId: plan.productId,
      transactionId,
      expiresAt,
      isActive: true
    },
    update: {
      planId: plan.id,
      productId: plan.productId,
      transactionId,
      expiresAt,
      isActive: true,
      purchaseDate: new Date()
    }
  });
  
  // Atualizar subscriptionTier no User (cache)
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionTier: "premium" }
  });
}
```

### 4. **Verificação de Acesso**

```typescript
// Verificar se usuário tem acesso premium
async function userHasPremiumAccess(userId: string): Promise<boolean> {
  // Opção 1: Verificação rápida (cache)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  });
  
  if (user?.subscriptionTier === "premium") {
    return true;
  }
  
  // Opção 2: Verificação completa (com expiração)
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { isActive: true, expiresAt: true }
  });
  
  if (!subscription?.isActive) return false;
  
  // Se não tem expiração, é vitalício
  if (!subscription.expiresAt) return true;
  
  // Verificar se ainda não expirou
  return subscription.expiresAt > new Date();
}
```

## 🎯 Vantagens desta Abordagem

### ✅ Flexibilidade Total
- Adicionar novos planos sem alterar código
- Mudar duração de planos facilmente
- Criar ofertas especiais (Black Friday, etc)

### ✅ Múltiplas Lojas
```typescript
// Yampi
{ productId: "12345", store: "yampi", durationDays: 90 }

// Hotmart
{ productId: "ABC123", store: "hotmart", durationDays: 90 }

// Mesmo plano, lojas diferentes!
```

### ✅ Controle Granular
```typescript
// Desativar plano antigo
await prisma.premiumPlan.update({
  where: { slug: "premium-3-meses-2023" },
  data: { isActive: false }
});

// Criar novo plano
await prisma.premiumPlan.create({
  data: {
    slug: "premium-3-meses-2024",
    productId: "NEW_ID",
    durationDays: 90
  }
});
```

### ✅ Histórico Completo
```typescript
// Ver todos os planos que o usuário já teve
const history = await prisma.subscription.findMany({
  where: { userId },
  include: { plan: true },
  orderBy: { purchaseDate: 'desc' }
});
```

## 📊 Exemplo de Dados

### Tabela `PremiumPlan`
| id | name | productId | store | durationDays |
|----|------|-----------|-------|--------------|
| 1 | Premium 3M | 12345 | yampi | 90 |
| 2 | Premium 6M | 12346 | yampi | 180 |
| 3 | Premium Anual | 12347 | yampi | 365 |
| 4 | Premium Vitalício | 12348 | yampi | null |

### Tabela `Subscription`
| userId | planId | expiresAt | isActive |
|--------|--------|-----------|----------|
| user1 | 1 | 2025-04-12 | true |
| user2 | 4 | null | true |
| user3 | 2 | 2024-12-01 | false |

## 🔄 Renovação Automática

```typescript
// Cron job diário para verificar expirações
async function checkExpiredSubscriptions() {
  const expired = await prisma.subscription.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      isActive: true
    },
    data: { isActive: false }
  });
  
  // Atualizar subscriptionTier dos usuários
  const expiredUsers = await prisma.subscription.findMany({
    where: { isActive: false },
    select: { userId: true }
  });
  
  await prisma.user.updateMany({
    where: { id: { in: expiredUsers.map(s => s.userId) } },
    data: { subscriptionTier: "free" }
  });
}
```

## 🎁 Ofertas Especiais

```typescript
// Black Friday: 50% off no plano anual
await prisma.premiumPlan.create({
  data: {
    name: "Black Friday - Premium Anual",
    slug: "bf-2024-premium-anual",
    productId: "BF_12347_2024", // Produto especial na loja
    store: "yampi",
    durationDays: 365,
    isActive: true,
    description: "Oferta especial Black Friday 2024"
  }
});
```
