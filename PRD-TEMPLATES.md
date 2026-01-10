# PRD - Reestruturação de Templates de Notificação

**Versão:** 1.1
**Data:** 2026-01-09
**Status:** 🟡 PARCIALMENTE IMPLEMENTADO
**Última Atualização:** 2026-01-09

---

## 1. Problema

### 1.1 Situação Atual

Atualmente, todos os tipos de templates (Email, WhatsApp, Push, Slack) compartilham:
- **Mesmo modelo de dados** (`NotificationTemplate`)
- **Mesmo formulário** na admin
- **Mesmos campos** (name, subject, body)

Isso causa problemas porque cada canal tem **particularidades diferentes**:

| Campo | Email | Push | WhatsApp |
|-------|-------|------|----------|
| Subject | ✅ Assunto | ❌ | ❌ |
| Body | HTML rico | Texto simples (max 500) | Texto + emojis |
| Title | ❌ | ✅ Título (max 100) | ❌ |
| URL | ❌ (no body) | ✅ Link ao clicar | ❌ |
| Icon | ❌ | ✅ Ícone 192x192 | ❌ |
| Image | ❌ (no body) | ✅ Imagem grande | ✅ Mídia |
| Badge | ❌ | ✅ Badge 72x72 | ❌ |
| Tag | ❌ | ✅ Agrupa notificações | ❌ |
| Actions | ❌ | ⚠️ Botões (futuro) | ✅ Botões |

### 1.2 Problemas Específicos

1. **Push usa `name` como título** - confuso, deveria ter campo próprio
2. **Não tem campo URL para push** - precisa hardcoded ou no `variables`
3. **Não tem campos de ícone/imagem** para push
4. **Mesmo editor** para HTML (email) e texto simples (push)
5. **Preview não funciona** corretamente para push (mostra HTML)

---

## 2. Solução Proposta

### 2.1 Arquitetura: Modelos Separados

Criar modelos específicos no Prisma para cada canal:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEMPLATES POR CANAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EmailTemplate          PushTemplate           (Futuro)         │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐   │
│  │ subject     │       │ title       │       │ WhatsApp    │   │
│  │ body (HTML) │       │ body        │       │ Slack       │   │
│  │ preheader   │       │ url         │       │ ...         │   │
│  └─────────────┘       │ icon        │       └─────────────┘   │
│                        │ badge       │                          │
│                        │ image       │                          │
│                        │ tag         │                          │
│                        └─────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Admin: Páginas Separadas com Submenu

**Implementação atual: Páginas separadas com submenu expansível**

```
/admin/templates
├── /email     → Templates de Email
├── /push      → Templates de Push
└── /whatsapp  → Templates de WhatsApp (futuro)
```

A sidebar possui um submenu expansível (Collapsible) que mostra os três tipos de templates.

### 2.3 Decisão: Começar com Push

Para o MVP, focar em:
1. **Criar modelo `PushTemplate`** com campos específicos
2. **Criar tab/página de Push Templates** na admin
3. **Manter `NotificationTemplate`** para email (já funciona)
4. **Migrar automações** para usar `PushTemplate`

---

## 3. Especificação Técnica

### 3.1 Novo Modelo: PushTemplate

```prisma
model PushTemplate {
  id          String   @id @default(cuid())
  slug        String   @unique

  // Conteúdo da notificação
  title       String                    // "{{user.name}} votou!" (max 100)
  body        String   @db.Text         // "Sua sugestão recebeu um voto" (max 500)

  // Visual
  icon        String?                   // "/icons/vote.png" ou null = padrão
  badge       String?                   // "/icons/badge.png" ou null = padrão
  image       String?                   // Imagem grande (opcional)

  // Comportamento
  url         String?                   // "/community/{{request.id}}"
  tag         String?                   // "community-vote" (agrupa)

  // Metadata
  eventType   String                    // "community.request.voted"
  description String?                   // Descrição interna

  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([eventType])
  @@index([isActive])
  @@map("push_template")
}
```

### 3.2 Schema Zod

```typescript
// src/lib/schemas/push-template.ts

import { z } from 'zod';

export const PushTemplateSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  icon: z.string().url().optional().nullable(),
  badge: z.string().url().optional().nullable(),
  image: z.string().url().optional().nullable(),
  url: z.string().max(500).optional().nullable(),
  tag: z.string().max(100).optional().nullable(),
  eventType: z.string().min(1),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type PushTemplateCreate = z.infer<typeof PushTemplateSchema>;
```

### 3.3 API Endpoints

```
/api/v1/admin/push-templates
├── GET     → Lista todos
├── POST    → Criar novo
│
/api/v1/admin/push-templates/[id]
├── GET     → Buscar por ID
├── PATCH   → Atualizar
└── DELETE  → Excluir
```

### 3.4 Atualização do Inngest

```typescript
// src/lib/inngest/functions.ts

case 'PUSH_NOTIFICATION': {
  const templateId = config.templateId as string;

  if (!templateId) {
    return { success: false, error: 'templateId obrigatório' };
  }

  // ANTES: Buscava em NotificationTemplate
  // AGORA: Busca em PushTemplate
  const template = await prisma.pushTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template) {
    return { success: false, error: 'Template não encontrado' };
  }

  const context = buildTemplateContext(payload, eventName || 'automation');

  const result = await sendPushToAll({
    title: renderVariables(template.title, context),
    body: renderVariables(template.body, context),
    url: template.url ? renderVariables(template.url, context) : '/',
    icon: template.icon || undefined,
    badge: template.badge || undefined,
    image: template.image || undefined,
    tag: template.tag || `kadernim-${eventName}`
  });

  return { success: result.success > 0 };
}
```

### 3.5 Atualização do PushPayload

```typescript
// src/lib/schemas/push-notification.ts

export const PushPayloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  url: z.string().optional(),
  tag: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  image: z.string().optional(),  // NOVO
});
```

### 3.6 Atualização do Service Worker

```javascript
// public/sw-custom.js

self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image || undefined,  // NOVO: imagem grande
    tag: data.tag || 'kadernim-notification',
    data: {
      url: data.url || '/',
    },
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Kadernim', options)
  );
});
```

---

## 4. Interface Admin

### 4.1 Página de Templates com Tabs

```
┌─────────────────────────────────────────────────────────────────┐
│  Templates de Notificação                              [+ Novo] │
│  Configure os modelos de comunicação por canal                  │
├─────────────────────────────────────────────────────────────────┤
│  [📧 Email]  [🔔 Push]  [💬 WhatsApp]                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  (Conteúdo muda conforme a tab selecionada)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Formulário de Push Template

```
┌─────────────────────────────────────────────────────────────────┐
│  Novo Template de Push                                     [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Evento *                          Slug                         │
│  ┌─────────────────────────┐      ┌─────────────────────────┐  │
│  │ community.request.voted │      │ novo-voto-recebido      │  │
│  └─────────────────────────┘      └─────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  CONTEÚDO DA NOTIFICAÇÃO                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Título * (max 100 caracteres)                    [Variáveis ▼] │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ {{voter.name}} votou na sua sugestão                        ││
│  └─────────────────────────────────────────────────────────────┘│
│  │██████████████████████████░░░░░░░░░░│ 45/100                  │
│                                                                 │
│  Mensagem * (max 500 caracteres)                  [Variáveis ▼] │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Sua sugestão "{{request.title}}" recebeu um novo voto!      ││
│  │ Agora são {{request.voteCount}} votos.                      ││
│  └─────────────────────────────────────────────────────────────┘│
│  │██████████████░░░░░░░░░░░░░░░░░░░░░░│ 120/500                 │
│                                                                 │
│  URL ao clicar (opcional)                         [Variáveis ▼] │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ /community/{{request.id}}                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  APARÊNCIA (opcional)                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Ícone                             Badge                        │
│  ┌─────────────────────────┐      ┌─────────────────────────┐  │
│  │ /icons/vote.png         │      │ (padrão)                │  │
│  └─────────────────────────┘      └─────────────────────────┘  │
│  192x192px recomendado             72x72px                      │
│                                                                 │
│  Imagem (opcional)                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ (nenhuma)                                                   ││
│  └─────────────────────────────────────────────────────────────┘│
│  Imagem grande exibida na notificação expandida                 │
│                                                                 │
│  Tag (agrupa notificações similares)                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ community-vote                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  PREVIEW                                                        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  ┌────┐                                                     ││
│  │  │ 🔔 │  Kadernim                              agora        ││
│  │  └────┘  João votou na sua sugestão                         ││
│  │          Sua sugestão "Atividade de matemática"             ││
│  │          recebeu um novo voto! Agora são 5 votos.           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                      [Cancelar]  [Salvar]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Lista de Push Templates

```
┌─────────────────────────────────────────────────────────────────┐
│  Template                    │ Evento              │ Status │ ⋮ │
├─────────────────────────────────────────────────────────────────┤
│  🔔 Novo voto recebido       │ request.voted       │ 🟢     │ ⋮ │
│     novo-voto-recebido       │                     │        │   │
├─────────────────────────────────────────────────────────────────┤
│  🔔 Sugestão selecionada     │ request.selected    │ 🟢     │ ⋮ │
│     sugestao-selecionada     │                     │        │   │
├─────────────────────────────────────────────────────────────────┤
│  🔔 Recurso publicado        │ resource.published  │ 🔴     │ ⋮ │
│     recurso-publicado        │                     │        │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Migração

### 5.1 Plano de Migração

1. **Criar modelo `PushTemplate`** no Prisma
2. **Migrar dados existentes** de `NotificationTemplate` onde `type = 'push'`
3. **Atualizar Inngest** para usar `PushTemplate`
4. **Criar UI admin** para Push Templates
5. **Remover templates push** de `NotificationTemplate`
6. **Atualizar automações** para usar novos IDs

### 5.2 Script de Migração

```typescript
// scripts/migrate-push-templates.ts

async function migratePushTemplates() {
  // 1. Buscar templates de push antigos
  const oldTemplates = await prisma.notificationTemplate.findMany({
    where: { type: 'push' }
  });

  // 2. Criar novos PushTemplates
  for (const old of oldTemplates) {
    await prisma.pushTemplate.create({
      data: {
        slug: old.slug,
        title: old.name,           // name vira title
        body: old.body,
        url: '/',                  // padrão, ajustar manualmente
        eventType: old.eventType,
        description: old.description,
        isActive: old.isActive,
      }
    });
  }

  // 3. Mapear IDs antigos para novos
  // (guardar para atualizar automações)
}
```

---

## 6. Estrutura de Arquivos

```
CRIAR:
├── prisma/
│   └── schema.prisma                    # Adicionar PushTemplate
│
├── src/lib/schemas/
│   └── push-template.ts                 # Schema Zod
│
├── src/app/api/v1/admin/push-templates/
│   ├── route.ts                         # GET, POST
│   └── [id]/route.ts                    # GET, PATCH, DELETE
│
├── src/app/admin/templates/
│   └── page.tsx                         # Adicionar tabs
│
└── src/components/admin/templates/
    ├── email-template-form.tsx          # Formulário email
    ├── push-template-form.tsx           # Formulário push
    └── push-template-preview.tsx        # Preview de push

ATUALIZAR:
├── src/lib/inngest/functions.ts         # Usar PushTemplate
├── src/services/notification/push-send.ts # Suportar image
└── public/sw-custom.js                  # Suportar image
```

---

## 7. Plano de Implementação

### Fase 1: Modelo e API
1. Criar modelo `PushTemplate` no Prisma
2. Criar schema Zod `push-template.ts`
3. Criar endpoints API CRUD
4. Atualizar `push-send.ts` para suportar `image`
5. Atualizar Service Worker

### Fase 2: Admin UI
1. Criar componente `PushTemplateForm`
2. Criar componente `PushTemplatePreview`
3. Adicionar tab "Push" na página de templates
4. Implementar CRUD na UI

### Fase 3: Integração
1. Atualizar Inngest para usar `PushTemplate`
2. Migrar templates existentes
3. Atualizar automações
4. Testar fluxo completo

### Fase 4: Limpeza
1. Remover templates push de `NotificationTemplate`
2. Documentar uso

---

## 8. Variáveis Disponíveis por Evento

### community.request.voted
```
{{voter.name}}        → Nome de quem votou
{{voter.email}}       → Email de quem votou
{{request.id}}        → ID da sugestão
{{request.title}}     → Título da sugestão
{{request.voteCount}} → Total de votos
{{author.name}}       → Nome do autor
{{author.email}}      → Email do autor
```

### community.request.selected
```
{{request.id}}        → ID da sugestão
{{request.title}}     → Título da sugestão
{{request.voteCount}} → Total de votos
{{author.name}}       → Nome do autor
```

### resource.published
```
{{resource.id}}       → ID do recurso
{{resource.title}}    → Título do recurso
{{resource.url}}      → URL do recurso
{{author.name}}       → Nome do autor
```

---

## 9. Checklist de Implementação

### Modelo e API
- [x] Adicionar `PushTemplate` ao schema.prisma
- [x] Executar migration
- [x] Criar `src/lib/schemas/push-template.ts`
- [x] Criar `src/app/api/v1/admin/push-templates/route.ts`
- [x] Criar `src/app/api/v1/admin/push-templates/[id]/route.ts`

### Service Layer
- [ ] Atualizar `PushPayloadSchema` com campo `image`
- [ ] Atualizar `sendPushToSubscription` para enviar `image`
- [ ] Atualizar `sw-custom.js` para exibir `image`

### Admin UI
- [ ] Criar `src/components/admin/templates/push-template-form.tsx`
- [ ] Criar `src/components/admin/templates/push-template-preview.tsx`
- [x] Adicionar tab na página `/admin/templates` (página push existe)
- [ ] Implementar lista de push templates (melhorar UI)
- [x] Implementar CRUD completo (endpoints funcionam)

### Integração
- [ ] Atualizar `executeAction` no Inngest para usar `PushTemplate`
- [ ] Criar script de migração
- [ ] Migrar dados existentes
- [ ] Testar envio com template

### Testes
- [ ] Testar criação de template
- [ ] Testar preview
- [ ] Testar envio via automação
- [ ] Testar variáveis dinâmicas

---

## 10. Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | |
| Tech Lead | | | |

---

*Este PRD define a separação de templates por canal, começando com Push.*
