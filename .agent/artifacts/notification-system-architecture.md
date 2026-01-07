# Arquitetura do Sistema de Notificações e Automações

## Visão Geral

Este documento define a arquitetura escalável do sistema de notificações do Kadernim, baseada em boas práticas de sistemas como Customer.io, SendGrid, Courier, e SuprSend.

---

## 1. Conceitos Fundamentais

### 1.1 Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SISTEMA DE NOTIFICAÇÕES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐               │
│  │    EVENTOS    │───▶│  AUTOMAÇÕES   │───▶│   TEMPLATES   │               │
│  │   (Triggers)  │    │   (Regras)    │    │   (Conteúdo)  │               │
│  └───────────────┘    └───────────────┘    └───────────────┘               │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  "O que aconteceu"    "O que fazer"      "Como comunicar"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Hierarquia de Conceitos

| Conceito | Descrição | Exemplo |
|----------|-----------|---------|
| **Evento** | Algo que aconteceu no sistema | `user.login`, `resource.purchased` |
| **Schema do Evento** | Estrutura de dados do evento | `{ userId, email, resourceId, amount }` |
| **Categoria de Evento** | Agrupamento lógico | `user`, `resource`, `subscription`, `community` |
| **Automação** | Regra de "quando X acontece, faça Y" | "Quando usuário compra recurso → enviar email" |
| **Template** | Modelo de comunicação **vinculado a um tipo de evento** | Template de "Compra Confirmada" |
| **Canal** | Meio de entrega | Email, WhatsApp, Push, Slack |

---

## 2. Schemas de Eventos

### 2.1 Estrutura Base de um Evento

Todos os eventos devem seguir uma estrutura comum:

```typescript
interface BaseEventPayload {
    // Identificação
    eventId: string;        // UUID único do evento
    eventName: string;      // Nome do evento
    timestamp: string;      // ISO 8601
    
    // Contexto do usuário (sempre presente)
    user: {
        id: string;
        email: string;
        name: string;
    };
    
    // Dados específicos do evento (variam por tipo)
    data: Record<string, any>;
}
```

### 2.2 Catálogo de Eventos do Kadernim

```typescript
const EVENT_CATALOG = {
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: USUÁRIO
    // ═══════════════════════════════════════════════════════════════
    'user.signup': {
        label: 'Cadastro de Usuário',
        category: 'user',
        description: 'Disparado quando um novo usuário se cadastra',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            source: 'string',  // 'organic', 'referral', 'campaign'
        },
        variables: [
            'user.name',
            'user.firstName',
            'user.email',
            'source',
        ],
    },
    
    'user.login': {
        label: 'Login de Usuário',
        category: 'user',
        description: 'Disparado quando usuário faz login',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            device: 'string',
            ip: 'string',
        },
        variables: [
            'user.name',
            'user.firstName',
            'user.email',
            'device',
            'event.date',
            'event.time',
        ],
    },
    
    'user.password_reset': {
        label: 'Recuperação de Senha',
        category: 'user',
        description: 'Disparado quando usuário solicita reset de senha',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            resetUrl: 'string',
            expiresAt: 'string',
        },
        variables: [
            'user.name',
            'user.email',
            'resetUrl',
            'expiresAt',
        ],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: RECURSOS (MATERIAIS DIDÁTICOS)
    // ═══════════════════════════════════════════════════════════════
    'resource.purchased': {
        label: 'Compra de Recurso',
        category: 'resource',
        description: 'Disparado quando um recurso é comprado',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            resource: {
                id: 'string',
                title: 'string',
                category: 'string',
                price: 'number',
            },
            purchase: {
                id: 'string',
                amount: 'number',
                method: 'string',
            },
        },
        variables: [
            'user.name',
            'user.firstName',
            'user.email',
            'resource.title',
            'resource.category',
            'resource.url',
            'purchase.amount',
            'purchase.method',
            'purchase.date',
        ],
    },
    
    'resource.accessed': {
        label: 'Acesso a Recurso Liberado',
        category: 'resource',
        description: 'Disparado quando admin libera acesso a um recurso',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            resource: {
                id: 'string',
                title: 'string',
                category: 'string',
            },
        },
        variables: [
            'user.name',
            'user.email',
            'resource.title',
            'resource.url',
            'resource.category',
        ],
    },
    
    'resource.expiring': {
        label: 'Acesso a Recurso Expirando',
        category: 'resource',
        description: 'Disparado X dias antes do acesso expirar',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            resource: {
                id: 'string',
                title: 'string',
            },
            daysRemaining: 'number',
            expiresAt: 'string',
        },
        variables: [
            'user.name',
            'resource.title',
            'resource.url',
            'daysRemaining',
            'expiresAt',
        ],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: ASSINATURAS / PLANOS
    // ═══════════════════════════════════════════════════════════════
    'subscription.created': {
        label: 'Nova Assinatura',
        category: 'subscription',
        description: 'Disparado quando usuário assina um plano',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            subscription: {
                id: 'string',
                planName: 'string',
                planId: 'string',
                amount: 'number',
                interval: 'string',  // 'monthly', 'yearly'
                expiresAt: 'string',
            },
        },
        variables: [
            'user.name',
            'user.email',
            'subscription.planName',
            'subscription.amount',
            'subscription.interval',
            'subscription.expiresAt',
        ],
    },
    
    'subscription.renewed': {
        label: 'Assinatura Renovada',
        category: 'subscription',
        description: 'Disparado quando assinatura é renovada',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            subscription: {
                id: 'string',
                planName: 'string',
                newExpiresAt: 'string',
            },
        },
        variables: [
            'user.name',
            'subscription.planName',
            'subscription.expiresAt',
        ],
    },
    
    'subscription.expiring': {
        label: 'Assinatura Expirando',
        category: 'subscription',
        description: 'Disparado X dias antes da assinatura expirar',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            subscription: {
                id: 'string',
                planName: 'string',
                daysRemaining: 'number',
                expiresAt: 'string',
            },
        },
        variables: [
            'user.name',
            'subscription.planName',
            'subscription.daysRemaining',
            'subscription.expiresAt',
            'app.url',
        ],
    },
    
    'subscription.cancelled': {
        label: 'Assinatura Cancelada',
        category: 'subscription',
        description: 'Disparado quando assinatura é cancelada',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            subscription: {
                id: 'string',
                planName: 'string',
                reason: 'string',
            },
        },
        variables: [
            'user.name',
            'subscription.planName',
            'subscription.reason',
        ],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: PLANOS DE AULA
    // ═══════════════════════════════════════════════════════════════
    'lesson_plan.created': {
        label: 'Plano de Aula Criado',
        category: 'lesson_plan',
        description: 'Disparado quando usuário cria um plano de aula',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            lessonPlan: {
                id: 'string',
                title: 'string',
                subject: 'string',
                grade: 'string',
                numberOfClasses: 'number',
            },
        },
        variables: [
            'user.name',
            'lessonPlan.title',
            'lessonPlan.subject',
            'lessonPlan.grade',
            'lessonPlan.url',
            'lessonPlan.numberOfClasses',
        ],
    },
    
    'lesson_plan.usage_limit': {
        label: 'Limite de Planos Atingido',
        category: 'lesson_plan',
        description: 'Disparado quando usuário atinge limite de criação',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            usage: {
                used: 'number',
                limit: 'number',
                resetsAt: 'string',
            },
        },
        variables: [
            'user.name',
            'usage.used',
            'usage.limit',
            'usage.resetsAt',
        ],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: COMUNIDADE
    // ═══════════════════════════════════════════════════════════════
    'community.request_created': {
        label: 'Solicitação Criada',
        category: 'community',
        description: 'Disparado quando usuário cria uma solicitação',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            request: {
                id: 'string',
                title: 'string',
                description: 'string',
            },
        },
        variables: [
            'user.name',
            'request.title',
            'request.description',
            'request.url',
        ],
    },
    
    'community.request_voted': {
        label: 'Solicitação Recebeu Voto',
        category: 'community',
        description: 'Disparado quando solicitação recebe voto',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },  // autor
            voter: { id: 'string', name: 'string' },
            request: {
                id: 'string',
                title: 'string',
                voteCount: 'number',
            },
        },
        variables: [
            'user.name',
            'voter.name',
            'request.title',
            'request.url',
            'request.voteCount',
        ],
    },
    
    'community.request_fulfilled': {
        label: 'Solicitação Atendida',
        category: 'community',
        description: 'Disparado quando solicitação é atendida',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            request: {
                id: 'string',
                title: 'string',
            },
            resource: {
                id: 'string',
                title: 'string',
            },
        },
        variables: [
            'user.name',
            'request.title',
            'resource.title',
            'resource.url',
        ],
    },
    
    'community.request_unfeasible': {
        label: 'Solicitação Inviável',
        category: 'community',
        description: 'Disparado quando solicitação é marcada como inviável',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            request: {
                id: 'string',
                title: 'string',
                reason: 'string',
            },
        },
        variables: [
            'user.name',
            'request.title',
            'request.reason',
        ],
    },
    
    // ═══════════════════════════════════════════════════════════════
    // CATEGORIA: PAGAMENTOS
    // ═══════════════════════════════════════════════════════════════
    'payment.successful': {
        label: 'Pagamento Aprovado',
        category: 'payment',
        description: 'Disparado quando pagamento é aprovado',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            payment: {
                id: 'string',
                amount: 'number',
                method: 'string',
                description: 'string',
            },
        },
        variables: [
            'user.name',
            'user.email',
            'payment.amount',
            'payment.method',
            'payment.description',
            'payment.date',
        ],
    },
    
    'payment.failed': {
        label: 'Pagamento Falhou',
        category: 'payment',
        description: 'Disparado quando pagamento falha',
        schema: {
            user: { id: 'string', email: 'string', name: 'string' },
            payment: {
                id: 'string',
                amount: 'number',
                reason: 'string',
            },
        },
        variables: [
            'user.name',
            'payment.amount',
            'payment.reason',
            'app.support.whatsapp',
        ],
    },
};
```

---

## 3. Templates Vinculados a Eventos

### 3.1 Conceito

Um **template não é genérico**. Ele é criado para um **tipo de evento específico**. Isso garante que:

1. O administrador veja apenas variáveis disponíveis para aquele evento
2. O sistema pode validar se o template usa variáveis válidas
3. Evita erros de variáveis vazias/inexistentes

### 3.2 Modelo do Template

```prisma
model NotificationTemplate {
    id          String   @id @default(cuid())
    slug        String   @unique
    name        String
    
    // Tipo de canal
    type        TemplateType  // email, push, whatsapp, slack
    
    // ✅ NOVO: Evento ao qual este template pertence
    eventType   String        // 'resource.purchased', 'user.login', etc.
    
    // Conteúdo
    subject     String?       // Só para email
    body        String        @db.Text
    
    // Metadados
    description String?
    isActive    Boolean @default(true)
    
    // Audit
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}
```

### 3.3 Fluxo de Criação de Template

```
1. Admin acessa /admin/templates
2. Clica em "Novo Template"
3. Seleciona o TIPO DE EVENTO (ex: "Compra de Recurso")
   → Sistema carrega as variáveis disponíveis para esse evento
4. Seleciona o CANAL (Email, WhatsApp, Push)
5. Escreve o conteúdo usando as variáveis disponíveis
6. Salva o template
```

---

## 4. Automações

### 4.1 Estrutura

Uma automação conecta:
- **Evento** (trigger) → O que dispara
- **Condições** (opcional) → Filtros adicionais
- **Ação** → O que acontece

```typescript
interface AutomationRule {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    
    // Trigger
    eventType: string;  // 'resource.purchased'
    
    // Condições (opcional) - para filtrar quando executar
    conditions?: {
        field: string;      // 'resource.category'
        operator: string;   // 'equals', 'contains', 'greater_than'
        value: any;         // 'matematica'
    }[];
    
    // Ação
    action: {
        type: 'EMAIL_SEND' | 'PUSH_NOTIFICATION' | 'WEBHOOK_CALL' | 'WHATSAPP_SEND';
        config: {
            templateId?: string;  // Para EMAIL_SEND, PUSH, WHATSAPP
            url?: string;         // Para WEBHOOK_CALL
        };
    };
}
```

### 4.2 Fluxo de Criação de Automação

```
1. Admin acessa /admin/automations
2. Clica em "Nova Automação"
3. Seleciona o EVENTO (ex: "Compra de Recurso")
4. (Opcional) Define CONDIÇÕES (ex: "categoria = matematica")
5. Seleciona a AÇÃO (ex: "Enviar Email")
6. Seleciona o TEMPLATE (só mostra templates do tipo de evento selecionado)
7. Ativa e salva
```

---

## 5. Fluxo de Execução

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE EXECUÇÃO                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   [App Code]                                                             │
│       │                                                                  │
│       ▼                                                                  │
│   emitEvent('resource.purchased', {                                     │
│       user: { id, email, name },                                        │
│       resource: { id, title, price },                                   │
│       purchase: { id, amount, method }                                  │
│   })                                                                     │
│       │                                                                  │
│       ▼                                                                  │
│   ┌────────────────┐                                                    │
│   │  Inngest Queue │                                                    │
│   └────────────────┘                                                    │
│       │                                                                  │
│       ▼                                                                  │
│   [Generic Event Handler]                                               │
│       │                                                                  │
│       ├─▶ Busca AutomationRules onde eventType = 'resource.purchased'  │
│       │   e isActive = true                                             │
│       │                                                                  │
│       ├─▶ Para cada regra:                                              │
│       │       │                                                          │
│       │       ├─▶ Avalia condições (se houver)                          │
│       │       │                                                          │
│       │       └─▶ Se condições OK:                                      │
│       │               │                                                  │
│       │               ├─▶ Busca Template por templateId                 │
│       │               │                                                  │
│       │               ├─▶ Renderiza variáveis {{...}} com payload       │
│       │               │                                                  │
│       │               └─▶ Executa ação (Email, Push, Webhook)           │
│       │                                                                  │
│       └─▶ Registra log no AutomationLog                                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Variáveis Globais

Além das variáveis específicas de cada evento, existem variáveis **sempre disponíveis**:

```typescript
const GLOBAL_VARIABLES = {
    'app.name': 'Kadernim',
    'app.url': 'https://kadernim.com.br',
    'app.support.email': 'contato@kadernim.com.br',
    'app.support.whatsapp': '+55 61 9869-8704',
    'event.date': '06/01/2026',
    'event.time': '18:30',
    'event.timestamp': '2026-01-06T18:30:00Z',
};
```

---

## 7. Alterações Necessárias no Banco de Dados

### 7.1 Prisma Schema

```prisma
// Adicionar campo eventType no NotificationTemplate
model NotificationTemplate {
    // ... campos existentes ...
    eventType   String    // Tipo de evento ao qual este template pertence
    
    @@index([eventType])
}

// Atualizar tipos de evento para usar ENUM ou string
enum EventType {
    user_signup
    user_login
    user_password_reset
    resource_purchased
    resource_accessed
    resource_expiring
    subscription_created
    subscription_renewed
    subscription_expiring
    subscription_cancelled
    lesson_plan_created
    lesson_plan_usage_limit
    community_request_created
    community_request_voted
    community_request_fulfilled
    community_request_unfeasible
    payment_successful
    payment_failed
}
```

---

## 8. Implementação em Fases

### Fase 1: Fundação (Atual)
- [x] Inngest configurado
- [x] AutomationRule e AutomationAction no banco
- [x] Email via Resend funcionando
- [x] UI básica de automações

### Fase 2: Schemas de Eventos
- [ ] Criar arquivo `src/lib/events/catalog.ts` com catálogo de eventos
- [ ] Adicionar campo `eventType` no NotificationTemplate
- [ ] Migrar banco de dados
- [ ] Atualizar UI de templates para filtrar variáveis por evento

### Fase 3: UI Aprimorada
- [ ] Na automação, ao selecionar evento, filtrar templates disponíveis
- [ ] Na criação de template, mostrar só variáveis do evento selecionado
- [ ] Adicionar preview de template com dados de exemplo

### Fase 4: Condições e Filtros
- [ ] Implementar sistema de condições nas automações
- [ ] UI para criar condições (ex: "categoria equals matematica")

### Fase 5: Multicanal
- [ ] Implementar WhatsApp (via API existente)
- [ ] Implementar Push Notifications (Web Push)
- [ ] Implementar Slack

---

## 9. Benefícios desta Arquitetura

| Aspecto | Benefício |
|---------|-----------|
| **Escalabilidade** | Novos eventos e canais podem ser adicionados sem mudar a estrutura |
| **Segurança de Tipos** | Schemas garantem que variáveis são válidas |
| **UX do Admin** | Só vê opções relevantes para o contexto |
| **Manutenibilidade** | Catálogo centralizado de eventos |
| **Testabilidade** | Schemas permitem mock de dados para testes |
| **Auditoria** | Logs estruturados de todas as notificações |

---

## 10. Exemplo de Uso Completo

### Cenário: Email de Confirmação de Compra

**1. Evento disparado pelo código:**
```typescript
// Em src/app/api/v1/resources/purchase/route.ts
await emitEvent('resource.purchased', {
    user: {
        id: user.id,
        email: user.email,
        name: user.name,
    },
    resource: {
        id: resource.id,
        title: resource.title,
        category: resource.categorySlug,
        price: resource.price,
    },
    purchase: {
        id: purchase.id,
        amount: purchase.amount,
        method: purchase.paymentMethod,
    },
});
```

**2. Template criado pelo admin:**
```
Evento: Compra de Recurso
Canal: Email
Assunto: 🎉 Compra confirmada - {{resource.title}}
Corpo:
---
Olá {{user.firstName}}!

Sua compra foi confirmada com sucesso!

📚 Recurso: {{resource.title}}
💰 Valor: R$ {{purchase.amount}}
💳 Forma de pagamento: {{purchase.method}}

Acesse agora: {{resource.url}}

Obrigado por fazer parte do Kadernim!
---
```

**3. Automação criada pelo admin:**
```
Nome: Email de Confirmação de Compra
Evento: Compra de Recurso
Ação: Enviar Email
Template: (selecionado acima)
```

**4. Resultado:** Email enviado automaticamente ao comprador.
