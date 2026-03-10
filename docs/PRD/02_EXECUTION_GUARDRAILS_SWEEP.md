# PRD: Varredura e Adequação aos Execution Guardrails

## 1. Visão Geral

Auditoria e refatoração completa do projeto **Kadernim** para alinhá-lo às regras da skill `nextjs-execution-guardrails` antes de integrar novas features (Asaas).

**Referência da Skill:** `/Users/thiago/www/whatrack/docs/SKILL/nextjs-execution-guardrails/`

---

## 2. Estado Atual do Projeto

### Estrutura de Diretórios

```
src/
├── app/
│   ├── (client)/          # Área do usuário logado (community, resources, lesson-plans, account)
│   ├── admin/             # Painel administrativo
│   ├── api/v1/            # 78 route handlers
│   ├── login/
│   └── plans/
├── components/
│   ├── admin/             # ❌ Deveria ser dashboard/[dominio]
│   ├── client/            # ❌ Deveria ser dashboard/[dominio]
│   ├── home/              # ✅ OK (landing page)
│   ├── pwa/               # ✅ OK (transversal)
│   ├── shared/            # ✅ OK (transversal)
│   ├── auth/              # ✅ OK (transversal)
│   └── ui/                # ✅ OK (design system)
├── contexts/              # ❌ Não previsto no guardrail
├── hooks/
│   ├── admin/             # ❌ Deveria ser hooks/[dominio]/ (users, resources)
│   ├── auth/
│   ├── entities/          # ❌ Nome genérico; deveria ser hooks/[dominio]/
│   ├── layout/
│   └── utils/
├── lib/
│   ├── schemas/           # ❌ Deveria estar em src/schemas/ (raiz)
│   └── ...
├── providers/             # ✅ OK
├── server/                # ✅ OK (auth, clients, utils)
├── services/              # ✅ OK (domínios organizados)
└── types/                 # ⚠️ Parcialmente OK (2 arquivos flat na raiz)
```

---

## 3. Inventário Completo de Violações

### 3.1. SCHEMAS ZOD FORA DO LOCAL

**Regra:** Schemas Zod devem estar exclusivamente em `src/schemas/[dominio]/[recurso]-schemas.ts`.

**Situação atual:** Os schemas estão em `src/lib/schemas/` (localização incorreta) e também inline em componentes e rotas.

#### 3.1.1. Schemas em `src/lib/schemas/` (mover para `src/schemas/`)

| Arquivo atual | Destino |
|---|---|
| `src/lib/schemas/community.ts` | `src/schemas/community/community-schemas.ts` |
| `src/lib/schemas/email-template.ts` | `src/schemas/templates/email-template-schemas.ts` |
| `src/lib/schemas/enroll.ts` | `src/schemas/billing/enroll-schemas.ts` |
| `src/lib/schemas/lesson-plan.ts` | `src/schemas/lesson-plans/lesson-plan-schemas.ts` |
| `src/lib/schemas/push-notification.ts` | `src/schemas/notifications/push-notification-schemas.ts` |
| `src/lib/schemas/push-template.ts` | `src/schemas/templates/push-template-schemas.ts` |
| `src/lib/schemas/resource.ts` | `src/schemas/resources/resource-schemas.ts` |
| `src/lib/schemas/whatsapp-template.ts` | `src/schemas/templates/whatsapp-template-schemas.ts` |
| `src/lib/schemas/admin/resources.ts` | `src/schemas/resources/admin-resource-schemas.ts` |
| `src/lib/schemas/admin/subjects.ts` | `src/schemas/subjects/subject-schemas.ts` |
| `src/lib/schemas/admin/users.ts` | `src/schemas/users/admin-user-schemas.ts` |

**Ação:** Criar `src/schemas/` na raiz do `src/`, mover todos os arquivos, atualizar todos os imports (`@/lib/schemas/...` → `@/schemas/...`).

#### 3.1.2. Schemas Zod inline em componentes (extrair)

| Arquivo | Schema encontrado | Destino |
|---|---|---|
| `src/components/admin/campaigns/campaign-form.tsx` | `campaignSchema = z.object({...})` | `src/schemas/campaigns/campaign-schemas.ts` |
| `src/components/admin/dash/dash-page-shell.tsx` | `dashPageShellPropsSchema = z.object({...})` | Avaliar se necessário ou remover |

**Ação:** Extrair schemas para `src/schemas/[dominio]/`, importar nos componentes.

#### 3.1.3. Schemas Zod inline em rotas da API (extrair)

| Arquivo | O que tem inline |
|---|---|
| `src/app/api/v1/community/generate-title/route.ts` | Schema Zod inline |
| `src/app/api/v1/community/refine-request/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/automations/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/automations/[id]/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/templates/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/templates/[id]/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/users/[id]/access/route.ts` | Schema Zod inline |
| `src/app/api/v1/lesson-plans/refine-theme/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/resources/[id]/bncc-skills/route.ts` | Schema Zod inline |
| `src/app/api/v1/admin/resources/[id]/images/reorder/route.ts` | Schema Zod inline |

**Ação:** Extrair cada schema para `src/schemas/[dominio]/` correspondente.

#### 3.1.4. Schemas Zod inline em services (extrair)

| Arquivo | Schema encontrado |
|---|---|
| `src/services/community/refine-description.ts` | `RefinedDescriptionsSchema` |
| `src/services/lesson-plans/refine-theme.ts` | `RefinedThemesSchema` |

**Ação:** Mover para `src/schemas/community/` e `src/schemas/lesson-plans/` respectivamente. Esses são schemas de output de LLM, então aceitável manter co-localizados se forem exclusivos da LLM call, mas o guardrail é explícito sobre centralização.

---

### 3.2. PRISMA DIRETO NAS ROTAS DA API

**Regra:** Queries Prisma pertencem exclusivamente a `src/services/` ou `src/server/`. Route handlers devem apenas: auth → validate → delegate → respond.

**Rotas com `prisma.` direto (56+ arquivos):**

#### Admin

| Rota | Ação |
|---|---|
| `admin/automations/route.ts` | Extrair para `src/services/automations/automation.service.ts` |
| `admin/automations/[id]/route.ts` | Idem |
| `admin/automations/logs/route.ts` | Idem |
| `admin/campaigns/route.ts` | Extrair para `src/services/campaigns/campaign.service.ts` |
| `admin/campaigns/[id]/route.ts` | Idem |
| `admin/campaigns/analytics/route.ts` | Idem |
| `admin/email-templates/route.ts` | Extrair para `src/services/templates/email-template.service.ts` |
| `admin/email-templates/[id]/route.ts` | Idem |
| `admin/llm-usage/logs/route.ts` | Extrair para `src/services/llm/llm-usage.service.ts` (já existe, mover queries) |
| `admin/llm-usage/route.ts` | Idem |
| `admin/push-templates/route.ts` | Extrair para `src/services/templates/push-template.service.ts` |
| `admin/push-templates/[id]/route.ts` | Idem |
| `admin/resources/route.ts` | Extrair/consolidar em `src/services/resources/` (já existe) |
| `admin/resources/[id]/route.ts` | Idem |
| `admin/resources/[id]/access/route.ts` | Idem |
| `admin/resources/[id]/access/[accessId]/route.ts` | Idem |
| `admin/resources/[id]/bncc-skills/route.ts` | Idem |
| `admin/resources/[id]/bncc-skills/[skillId]/route.ts` | Idem |
| `admin/resources/[id]/files/route.ts` | Idem |
| `admin/resources/[id]/files/[fileId]/route.ts` | Idem |
| `admin/resources/[id]/images/route.ts` | Idem |
| `admin/resources/[id]/images/[imageId]/route.ts` | Idem |
| `admin/resources/[id]/images/reorder/route.ts` | Idem |
| `admin/resources/[id]/videos/route.ts` | Idem |
| `admin/resources/[id]/videos/[videoId]/route.ts` | Idem |
| `admin/resources/bulk/delete/route.ts` | Idem |
| `admin/resources/bulk/update/route.ts` | Idem |
| `admin/stats/route.ts` | Extrair para `src/services/stats/stats.service.ts` |
| `admin/subjects/route.ts` | Extrair para `src/services/subjects/subject.service.ts` |
| `admin/subjects/[id]/route.ts` | Idem |
| `admin/templates/route.ts` | Consolidar em services de templates |
| `admin/templates/[id]/route.ts` | Idem |
| `admin/users/route.ts` | Consolidar em `src/services/users/` (já existe) |
| `admin/users/[id]/route.ts` | Idem |
| `admin/users/[id]/access/route.ts` | Idem |
| `admin/users/[id]/avatar/route.ts` | Idem |
| `admin/users/search/route.ts` | Idem |
| `admin/whatsapp-templates/route.ts` | Extrair para `src/services/templates/whatsapp-template.service.ts` |
| `admin/whatsapp-templates/[id]/route.ts` | Idem |

#### Client/Público

| Rota | Ação |
|---|---|
| `account/route.ts` | Extrair para `src/services/users/account.service.ts` |
| `account/avatar/route.ts` | Idem |
| `account/sessions/route.ts` | Idem |
| `bncc/themes/route.ts` | Extrair para `src/services/bncc/bncc.service.ts` |
| `campaigns/track/route.ts` | Extrair para `src/services/campaigns/campaign.service.ts` |
| `community/requests/route.ts` | Consolidar em `src/services/community/` (já existe) |
| `community/requests/[id]/vote/route.ts` | Idem |
| `cron/community-cleanup/route.ts` | Consolidar em `src/services/community/` |
| `cron/community-month-end/route.ts` | Idem |
| `education-levels/route.ts` | Extrair para `src/services/taxonomy/taxonomy.service.ts` |
| `enroll/route.ts` | Consolidar em `src/services/billing/` ou `src/services/enrollment/` |
| `enroll/subscriber/route.ts` | Idem |
| `grades/route.ts` | `src/services/taxonomy/taxonomy.service.ts` |
| `lesson-plans/route.ts` | Consolidar em `src/services/lesson-plans/` (já existe) |
| `lesson-plans/[id]/route.ts` | Idem |
| `lesson-plans/[id]/export/[format]/route.ts` | Idem |
| `notifications/subscribe/route.ts` | Extrair para `src/services/notification/` (já existe) |
| `notifications/unsubscribe/route.ts` | Idem |
| `notifications/test-push/route.ts` | Idem |
| `notifications/debug/route.ts` | Avaliar remoção (debug em produção) |
| `resources/route.ts` | Consolidar em `src/services/resources/` (já existe) |
| `resources/[id]/route.ts` | Idem |
| `resources/counts/route.ts` | Idem |
| `resources/download/route.ts` | Idem |
| `resources/meta/route.ts` | Idem |
| `resources/summary/route.ts` | Idem |
| `resources/[id]/files/[fileId]/download/route.ts` | Idem |
| `subjects/route.ts` | `src/services/taxonomy/taxonomy.service.ts` |

---

### 3.3. PAGES `'use client'` — VIOLAÇÃO SERVER-FIRST

**Regra:** Páginas read-heavy de dashboard DEVEM ser Server Components. Componentes interativos ficam em arquivos filhos `'use client'`.

#### Admin (14 páginas — todas `'use client'`)

| Arquivo | useEffect? | Ação |
|---|---|---|
| `src/app/admin/page.tsx` | Sim | Tornar Server Component; extrair interativos para filho client |
| `src/app/admin/campaigns/page.tsx` | - | Idem |
| `src/app/admin/campaigns/analytics/page.tsx` | Sim | Idem |
| `src/app/admin/subjects/page.tsx` | - | Idem |
| `src/app/admin/users/page.tsx` | Sim | Idem |
| `src/app/admin/templates/email/page.tsx` | Sim | Idem |
| `src/app/admin/templates/whatsapp/page.tsx` | Sim | Idem |
| `src/app/admin/templates/push/page.tsx` | Sim | Idem |
| `src/app/admin/automations/page.tsx` | Sim | Idem |
| `src/app/admin/automations/analytics/page.tsx` | Sim | Idem |
| `src/app/admin/automations/analytics/loading.tsx` | - | ✅ Manter (loading é client por natureza) |
| `src/app/admin/llm-usage/page.tsx` | Sim | Idem |
| `src/app/admin/resources/page.tsx` | Sim | Idem |
| `src/app/admin/resources/[id]/edit/page.tsx` | Sim | Idem |

#### Client (6 páginas — todas `'use client'`)

| Arquivo | useEffect? | Ação |
|---|---|---|
| `src/app/(client)/community/page.tsx` | Sim | Avaliar Server-First; extrair wizard/form para client |
| `src/app/(client)/account/page.tsx` | - | Tornar Server Component (leitura de perfil) |
| `src/app/(client)/lesson-plans/page.tsx` | Sim | Avaliar; listagem pode ser server |
| `src/app/(client)/lesson-plans/[id]/page.tsx` | - | Avaliar; detalhe pode ser server |
| `src/app/(client)/resources/page.tsx` | Sim | Avaliar; listagem pode ser server |
| `src/app/(client)/resources/[id]/page.tsx` | Sim | Avaliar; detalhe pode ser server |

---

### 3.4. COMPONENTES FORA DO DIRETÓRIO

**Regra:** Componentes de feature do dashboard devem ficar em `src/components/dashboard/[dominio]/`.

#### `src/components/admin/` → `src/components/dashboard/`

| Origem | Destino |
|---|---|
| `src/components/admin/users/` (7 arquivos) | `src/components/dashboard/users/` |
| `src/components/admin/resources/` (8 arquivos) | `src/components/dashboard/resources/` |
| `src/components/admin/campaigns/` (1 arquivo) | `src/components/dashboard/campaigns/` |
| `src/components/admin/templates/` (4 arquivos) | `src/components/dashboard/templates/` |
| `src/components/admin/subjects/` (1 arquivo) | `src/components/dashboard/subjects/` |
| `src/components/admin/editor/` (2 arquivos) | `src/components/dashboard/editor/` |
| `src/components/admin/crud/` (9 arquivos) | `src/components/dashboard/crud/` (genérico compartilhado) |
| `src/components/admin/dash/` (1 arquivo) | `src/components/dashboard/dash/` |
| `src/components/admin/shared/` (5 arquivos) | `src/components/dashboard/shared/` |
| `src/components/admin/global-header.tsx` | `src/components/dashboard/global-header.tsx` |
| `src/components/admin/sidebar.tsx` | `src/components/dashboard/sidebar.tsx` |
| `src/components/admin/admin-content.tsx` | `src/components/dashboard/admin-content.tsx` |

#### `src/components/client/` → `src/components/dashboard/`

| Origem | Destino |
|---|---|
| `src/components/client/community/` (15 arquivos) | `src/components/dashboard/community/` |
| `src/components/client/resources/` (16 arquivos) | `src/components/dashboard/resources/` (merge com admin) |
| `src/components/client/lesson-plans/` (20 arquivos) | `src/components/dashboard/lesson-plans/` |
| `src/components/client/quiz/` (11 arquivos) | `src/components/dashboard/quiz/` |
| `src/components/client/layout/` (4 arquivos) | `src/components/dashboard/layout/` |
| `src/components/client/shared/` (10 arquivos) | `src/components/dashboard/shared/` (merge com admin shared) |

---

### 3.5. HOOKS FORA DO PADRÃO

**Regra:** Hooks de domínio em `src/hooks/[dominio]/use-[recurso].ts`.

| Origem | Destino |
|---|---|
| `src/hooks/admin/use-admin-users.ts` | `src/hooks/users/use-admin-users.ts` |
| `src/hooks/admin/use-admin-resources.ts` | `src/hooks/resources/use-admin-resources.ts` |
| `src/hooks/entities/use-resources.ts` | `src/hooks/resources/use-resources.ts` |
| `src/hooks/entities/use-community.ts` | `src/hooks/community/use-community.ts` |
| `src/hooks/entities/use-lesson-plans.ts` | `src/hooks/lesson-plans/use-lesson-plans.ts` |
| `src/hooks/entities/use-taxonomy.ts` | `src/hooks/taxonomy/use-taxonomy.ts` |

**Ação:** Renomear pastas, atualizar imports.

---

### 3.6. TYPES FLAT NA RAIZ

**Regra:** Tipos de domínio em `src/types/[dominio]/[recurso].ts`.

| Origem | Destino |
|---|---|
| `src/types/request.ts` | `src/types/community/resource-request.ts` |
| `src/types/user-role.ts` | `src/types/users/user-role.ts` |

---

### 3.7. CONTEXT ISOLADO

**Regra:** Não existe `src/contexts/` no directory-map do guardrail.

| Arquivo | Ação |
|---|---|
| `src/contexts/resource-context.tsx` | Migrar para `src/hooks/resources/use-resource-context.ts` como hook com provider, ou avaliar remoção (lógica simples de título) |

---

### 3.8. REACT QUERY PROVIDER

**Regra:** `staleTime: 5 * 60 * 1000`, `gcTime: 10 * 60 * 1000`, `refetchOnMount: false`, `refetchOnReconnect: false`.

| Arquivo | Violação | Ação |
|---|---|---|
| `src/providers/react-query-provider.tsx` | `staleTime: 60 * 1000` (1 min, deveria ser 5 min); falta `gcTime`, `refetchOnMount: false`, `refetchOnReconnect: false` | Atualizar defaults |

---

### 3.9. `console.log` EM PRODUÇÃO

**Regra:** Proibido `console.log` em código de produção.

| Arquivo | Ação |
|---|---|
| `src/services/whatsapp/uazapi/check.ts` | Remover |
| `src/services/notification/automation-email.ts` | Remover |
| `src/services/notification/push-send.ts` | Remover |
| `src/services/llm/llm-usage-service.ts` | Remover |
| `src/lib/events/emit.ts` | Remover |
| `src/lib/inngest/client.ts` | Remover |
| `src/lib/inngest/functions.ts` | Remover |
| `src/lib/pwa/sw-update-listener.ts` | Remover |
| `src/components/admin/global-header.tsx` | Remover |
| `src/components/admin/sidebar.tsx` | Remover |
| `src/components/admin/resources/edit/resource-images-manager.tsx` | Remover |
| `src/components/pwa/ServiceWorkerRegister.tsx` | Remover |
| `src/server/auth/auth.ts` | Remover |
| `src/server/clients/cloudinary/image-client.ts` | Remover |
| `src/app/api/v1/notifications/subscribe/route.ts` | Remover |
| `src/app/api/v1/notifications/unsubscribe/route.ts` | Remover |
| `src/app/api/v1/notifications/test-push/route.ts` | Remover |
| `src/app/api/v1/lesson-plans/route.ts` | Remover |
| `src/app/api/v1/campaigns/track/route.ts` | Remover |
| `src/app/api/v1/admin/resources/[id]/files/[fileId]/route.ts` | Remover |
| `src/app/api/v1/admin/resources/[id]/images/[imageId]/route.ts` | Remover |
| `src/app/api/v1/admin/resources/[id]/videos/[videoId]/route.ts` | Remover |

---

### 3.10. `setInterval` EM COMPONENTES

**Regra:** Proibido `setInterval` para polling. Usar `refetchInterval` do TanStack Query.

| Arquivo | Uso | Ação |
|---|---|---|
| `src/components/client/lesson-plans/questions/question-generating.tsx` | Timer de progresso animado | ⚠️ Avaliar: se é UX pura (progress bar fake), aceitável. Se é polling real, substituir. |
| `src/components/pwa/ServiceWorkerRegister.tsx` | Polling de SW update | ⚠️ Aceitável: sincronização com API do browser (Service Worker), uso permitido. |
| `src/lib/utils/confetti.ts` | Animação de confetti | ✅ OK: UX pura, não é data fetching. |
| `src/lib/pwa/sw-update-listener.ts` | Polling de SW update | ⚠️ Aceitável: sincronização com browser API. |

---

### 3.11. `useEffect` EM COMPONENTES DO ADMIN

**Regra:** Proibido useEffect para fluxo de dados, sincronização de estado derivado, fetch.

| Arquivo | Ação |
|---|---|
| `src/components/admin/global-header.tsx` | Auditar e substituir se for sync de dados |
| `src/components/admin/sidebar.tsx` | Auditar e substituir |
| `src/components/admin/users/user-edit-drawer.tsx` | Sincronização de form com dados → usar `key` prop |
| `src/components/admin/users/user-dropdown-menu-global.tsx` | Auditar |
| `src/components/admin/users/user-dropdown-menu.tsx` | Auditar |
| `src/components/admin/resources/resource-dialog.tsx` | Sincronização de form com dados → usar `key` prop |
| `src/components/admin/subjects/subject-form.tsx` | Sincronização de form com dados → usar `key` prop |
| `src/components/admin/resources/edit/resource-bncc-manager.tsx` | Auditar |
| `src/components/admin/resources/edit/resource-categorization-form.tsx` | Auditar |
| `src/components/admin/resources/edit/resource-files-manager.tsx` | Auditar |
| `src/components/admin/resources/edit/resource-images-manager.tsx` | Auditar |

---

## 4. Plano de Execução (Fases)

### Fase 1: Schemas Zod
- Criar `src/schemas/` com subpastas por domínio.
- Mover todo conteúdo de `src/lib/schemas/`.
- Extrair schemas inline de rotas, services e componentes.
- Atualizar todos os imports.
- Deletar `src/lib/schemas/` ao final.

### Fase 2: Serviços (Prisma fora das rotas)
- Para cada rota da API, extrair as queries para o respectivo service.
- Domínios que **já possuem** `src/services/[dominio]/`: `users`, `resources`, `community`, `lesson-plans`, `notification`, `llm`, `mail`, `delivery`, `bncc`, `auth`, `config`, `whatsapp`.
- Domínios que **precisam ser criados**: `campaigns`, `automations`, `templates`, `stats`, `taxonomy` (education-levels, grades, subjects), `billing/enrollment`.
- Reduzir cada handler de rota para ~30-50 linhas.

### Fase 3: Co-localização de componentes
- Renomear `src/components/admin/` → `src/components/dashboard/`.
- Renomear `src/components/client/` → merge nos domínios em `src/components/dashboard/`.
- Renomear `src/hooks/admin/` e `src/hooks/entities/` para `src/hooks/[dominio]/`.
- Mover `src/types/` flat para subpastas de domínio.
- Migrar `src/contexts/resource-context.tsx`.

### Fase 4: Server-First Pages
- Remover `'use client'` das 14 pages de `/admin` e 6 pages de `/(client)`.
- Extrair partes interativas para componentes filhos client.
- Remover useEffects de sync de dados/filtros.

### Fase 5: Saneamento Final
- Atualizar `react-query-provider.tsx` com defaults do guardrail.
- Remover todos os `console.log`.
- Auditar `setInterval` em componentes.
- Deletar diretórios vazios.
- Rodar `npx tsc --noEmit`, `npm run lint`, `npm run build`.

---

## 5. Critérios de Aceite

- [ ] `grep -r "prisma\." src/app/api/` retorna 0 resultados.
- [ ] `grep -r "z\.object" src/app/api/` retorna 0 resultados.
- [ ] `src/lib/schemas/` não existe mais; tudo está em `src/schemas/`.
- [ ] `src/components/admin/` e `src/components/client/` não existem mais.
- [ ] `src/hooks/entities/` e `src/hooks/admin/` não existem mais.
- [ ] `src/contexts/` não existe mais.
- [ ] Nenhuma `page.tsx` de admin ou client possui `'use client'` na raiz.
- [ ] `grep -r "console\.log" src/` retorna 0 resultados fora de dev-only guards.
- [ ] `react-query-provider.tsx` possui `staleTime: 5 * 60 * 1000` e demais defaults.
- [ ] `npm run build` compila sem erros.
