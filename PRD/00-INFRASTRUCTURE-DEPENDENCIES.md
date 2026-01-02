# PRD 00: Infraestrutura e Dependências Compartilhadas

## 1. Visão Geral

Este documento centraliza todas as dependências de infraestrutura que são compartilhadas entre múltiplas features do Kadernim. Serve como referência para novos PRDs e evita duplicação de configuração.

---

## 2. Push Notifications (Web Push)

### 2.1 Status: ✅ Instalado, ⚠️ Parcialmente Configurado

**Dependência:** `web-push` (já instalada)

**Variáveis de ambiente necessárias:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=   # Chave pública VAPID
VAPID_PRIVATE_KEY=               # Chave privada VAPID
```

### 2.2 Onde será usado

| Feature | Evento | Notificação |
|---------|--------|-------------|
| Community Requests | Pedido selecionado | "🏆 Seu pedido foi selecionado!" |
| Community Requests | Pedido marcado inviável | "⚠️ Sobre seu pedido..." |
| Community Requests | Material produzido | "🎉 Seu material está disponível!" |
| Billing (futuro) | Assinatura expirando | "⏰ Sua assinatura expira em 3 dias" |
| Resources (futuro) | Novo material na categoria | "📚 Novo material de Matemática" |

### 2.3 Componentes necessários

```
src/
├── lib/push/
│   ├── vapid.ts              # Configuração VAPID
│   ├── subscribe.ts          # Registrar subscription do usuário
│   └── send.ts               # Enviar notificação
│
├── app/api/v1/push/
│   ├── subscribe/route.ts    # Salvar subscription no banco
│   └── send/route.ts         # Endpoint interno para enviar
│
├── hooks/
│   └── usePushSubscription.ts # Hook para gerenciar subscription
│
└── components/
    └── push-permission-banner.tsx # Banner pedindo permissão
```

### 2.4 Schema Prisma

```prisma
model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  endpoint  String   @unique
  p256dh    String   // Chave pública do browser
  auth      String   // Token de autenticação

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("push_subscription")
}
```

### 2.5 Implementação básica

```typescript
// src/lib/push/send.ts
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:contato@kadernim.com.br',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth }
    },
    JSON.stringify(payload)
  )
}
```

---

## 3. Vercel AI SDK

### 3.1 Status: 🆕 Não instalado

**Dependências:**
```bash
npm install ai @ai-sdk/openai
```

**Variáveis de ambiente:**
```env
OPENAI_API_KEY=sk-...
```

### 3.2 Onde será usado

| Feature | Caso de uso | Modelo |
|---------|-------------|--------|
| Community Requests | Detecção de duplicados | `text-embedding-3-small` |
| Community Requests | Sugestão de categoria | `gpt-4o-mini` |
| Community Requests | Moderação automática | `gpt-4o-mini` |
| Community Requests | Sugestão de título | `gpt-4o-mini` |
| Community Requests | Template de justificativa | `gpt-4o-mini` |
| Resources (futuro) | Busca semântica | `text-embedding-3-small` |
| Support (futuro) | Chatbot de ajuda | `gpt-4o-mini` |

### 3.3 Estimativa de Custos

| Modelo | Preço | Uso estimado/mês | Custo |
|--------|-------|------------------|-------|
| `text-embedding-3-small` | $0.02/1M tokens | ~100k tokens | ~$0.002 |
| `gpt-4o-mini` | $0.15/1M input | ~500k tokens | ~$0.075 |
| **Total** | | | **~$0.10/mês** |

### 3.4 Estrutura de arquivos

```
src/
├── lib/ai/
│   ├── client.ts             # Configuração do cliente OpenAI
│   ├── embeddings.ts         # Funções de embedding
│   └── prompts/
│       ├── category-suggestion.ts
│       ├── moderation.ts
│       └── title-suggestion.ts
│
└── app/api/v1/ai/
    ├── suggest-category/route.ts
    ├── check-similar/route.ts
    ├── moderate/route.ts
    └── suggest-title/route.ts
```

### 3.5 pgvector para Embeddings (Supabase)

Se usar detecção de duplicados via embeddings:

```sql
-- Habilitar extensão pgvector no Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Adicionar coluna de embedding
ALTER TABLE community_request
ADD COLUMN embedding vector(1536);

-- Índice para busca de similaridade
CREATE INDEX ON community_request
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 4. Email Transacional (Resend)

### 4.1 Status: ✅ Instalado e Configurado

**Dependência:** `resend` (já instalada)

**Variável:** `RESEND_API_KEY`

### 4.2 Templates necessários para Community Requests

```
src/services/mail/templates/
├── request-selected.tsx      # "Seu pedido foi selecionado!"
├── request-unfeasible.tsx    # "Sobre seu pedido..."
├── request-produced.tsx      # "Seu material está disponível!"
└── monthly-digest.tsx        # "Top 10 do mês"
```

---

## 5. Cloudinary (Upload de Imagens)

### 5.1 Status: ✅ Instalado e Configurado

**Dependência:** `cloudinary`, `next-cloudinary` (já instaladas)

### 5.2 Pastas para Community Requests

```
cloudinary/
└── kadernim/
    └── community/
        └── references/       # Imagens de referência dos pedidos
            └── {requestId}/
                ├── ref-1.jpg
                ├── ref-2.jpg
                └── ref-3.jpg
```

### 5.3 Configuração de upload

```typescript
// Limite de 3 imagens por pedido
// Max 2MB por imagem
// Formatos: jpg, png, webp
const uploadOptions = {
  folder: `kadernim/community/references/${requestId}`,
  resource_type: 'image',
  allowed_formats: ['jpg', 'png', 'webp'],
  max_file_size: 2_000_000, // 2MB
  transformation: [
    { width: 1200, height: 1200, crop: 'limit' },
    { quality: 'auto:good' }
  ]
}
```

---

## 6. Cron Jobs / Scheduled Tasks

### 6.1 Status: 🆕 Não configurado

**Opções:**
1. **Vercel Cron** (recomendado) - Gratuito até 2 jobs/dia
2. **QStash** (Upstash) - Para jobs mais complexos
3. **GitHub Actions** - Alternativa gratuita

### 6.2 Jobs necessários para Community Requests

| Job | Frequência | Ação |
|-----|------------|------|
| `process-monthly-voting` | Dia 1, 00:00 UTC-3 | Seleciona top 10, arquiva baixos |
| `reset-user-votes` | Dia 1, 00:00 UTC-3 | Reseta contador de votos |
| `send-voting-reminder` | Dia 25, 10:00 UTC-3 | "Última semana para votar!" |

### 6.3 Configuração Vercel Cron

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/community/process-month",
      "schedule": "0 3 1 * *"  // Dia 1 às 00:00 UTC-3 (03:00 UTC)
    },
    {
      "path": "/api/cron/community/voting-reminder",
      "schedule": "0 13 25 * *" // Dia 25 às 10:00 UTC-3
    }
  ]
}
```

---

## 7. Animações (Framer Motion)

### 7.1 Status: ✅ Instalado

**Dependência:** `framer-motion` (já instalada)

### 7.2 Componentes reutilizáveis

```
src/components/ui/
├── confetti.tsx              # Explosão de confetti
├── animated-counter.tsx      # Contador com animação
└── celebrate-dialog.tsx      # Dialog de celebração
```

---

## 8. Confetti

### 8.1 Status: 🆕 Não instalado

**Dependência:**
```bash
npm install canvas-confetti
npm install -D @types/canvas-confetti
```

### 8.2 Uso

```typescript
import confetti from 'canvas-confetti'

// Ao votar
confetti({
  particleCount: 50,
  spread: 60,
  origin: { y: 0.7 }
})

// Ao desbloquear sugestão
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
})
```

---

## 9. Checklist de Dependências por Feature

### Community Requests (PRD-12)

| Dependência | Necessária para | Status |
|-------------|-----------------|--------|
| Push Notifications | Notificar seleção/produção | ⚠️ Configurar |
| Vercel AI SDK | Sugestão categoria, duplicados | 🆕 Instalar |
| Cloudinary | Upload de referências | ✅ Pronto |
| Resend | Emails de status | ✅ Pronto |
| Framer Motion | Animações de voto | ✅ Pronto |
| Canvas Confetti | Celebração ao votar | 🆕 Instalar |
| Vercel Cron | Job mensal | 🆕 Configurar |
| pgvector | Embeddings (opcional) | 🆕 Configurar |

---

## 10. Ordem de Implementação

### Fase 0: Infraestrutura Base (antes de qualquer feature)

```
1. [ ] Configurar Push Notifications
   - [ ] Gerar chaves VAPID
   - [ ] Criar schema PushSubscription
   - [ ] Criar hook usePushSubscription
   - [ ] Criar banner de permissão

2. [ ] Configurar Vercel Cron
   - [ ] Criar vercel.json
   - [ ] Criar rota /api/cron/health

3. [ ] Instalar canvas-confetti
   - [ ] npm install canvas-confetti
   - [ ] Criar componente reutilizável
```

### Fase IA (quando necessário)

```
1. [ ] Instalar AI SDK
   - [ ] npm install ai @ai-sdk/openai
   - [ ] Configurar OPENAI_API_KEY
   - [ ] Criar client.ts

2. [ ] (Opcional) Configurar pgvector
   - [ ] Habilitar extensão no Supabase
   - [ ] Adicionar coluna embedding
   - [ ] Criar índice
```

---

## 11. Links Úteis

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)
- [Supabase pgvector](https://supabase.com/docs/guides/ai/vector-columns)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
