# 🗺️ Próximos Passos - Roadmap Completo

**Data:** 2026-04-19  
**Status Atual:** Fases 1-4 + Seeds 100% Implementados  
**Próximo Milestone:** Fase 5 (Conteúdo Pedagógico)

---

## 📊 Status Geral do Projeto

| Fase | Título | Status | Progresso | ETA |
|------|--------|--------|-----------|-----|
| 1 | Autoria + Metadados | ✅ 100% | Completo | Done |
| 2 | Reviews + Moderação | ✅ 100% | Completo | Done |
| 3 | Interações do Usuário | ✅ 100% | Completo | Done |
| 4 | Recursos Relacionados | ✅ 100% | Completo | Done |
| 5 | Conteúdo Pedagógico | ⏳ 0% | **PRÓXIMO** | 1-2 sem |
| 6 | Métricas + Cache | ⏳ 0% | Planejado | 2-3 sem |
| 7 | Integração E2E | ⏳ 0% | Planejado | 3-4 sem |

---

## 🎯 FASE 5: Conteúdo Pedagógico (1-2 semanas)

### Objetivo
Permitir que admins editem e salvem conteúdo pedagógico estruturado (objetivos, steps, materiais).

### Tarefas (5.1 - 5.3)

#### **Task 5.1: Validação de PedagogicalContent** (2h)

```typescript
// Criar em src/lib/resources/schemas/pedagogical-schemas.ts

import { z } from 'zod';

export const PedagogicalObjectiveSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(10).max(500),
  order: z.number().int().positive(),
});

export const ResourceStepTypeEnum = z.enum([
  'WARMUP',
  'DISTRIBUTION',
  'PRACTICE',
  'CONCLUSION',
  'DISCUSSION',
  'ACTIVITY',
  'REFLECTION',
]);

export const PedagogicalStepSchema = z.object({
  id: z.string().uuid(),
  type: ResourceStepTypeEnum,
  title: z.string().min(5).max(100),
  duration: z.string().regex(/^\d+\s*(min|h)$/).optional(), // "15 min", "1 h"
  content: z.string().min(20).max(2000),
  order: z.number().int().positive(),
});

export const PedagogicalMaterialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(5).max(200),
  quantity: z.number().int().positive(),
});

export const PedagogicalContentSchema = z.object({
  objectives: z.array(PedagogicalObjectiveSchema).min(1).max(10),
  steps: z.array(PedagogicalStepSchema).min(1).max(10),
  materials: z.array(PedagogicalMaterialSchema).optional(),
});

export type PedagogicalContent = z.infer<typeof PedagogicalContentSchema>;
```

**Checklist:**
- [ ] Criar arquivo com schemas Zod
- [ ] Adicionar função `validatePedagogicalContent()`
- [ ] Testes de validação (invalid data deve falhar)

---

#### **Task 5.2: Endpoints de Edição** (3h)

```typescript
// Criar em src/app/api/v1/admin/resources/[id]/pedagogy/route.ts

export async function GET(req, ctx) {
  // Fetch resource + pedagogicalContent
  // Return validated data
}

export async function POST(req, ctx) {
  // Validar com Zod
  // Atualizar resource.pedagogicalContent
  // Update cache (reviewCount, etc)
}

export async function PATCH(req, ctx) {
  // Atualizar parcialmente (só objectives, ou só steps)
}
```

**Endpoints:**
- `GET /api/v1/admin/resources/[id]/pedagogy` - Fetch conteúdo
- `POST /api/v1/admin/resources/[id]/pedagogy` - Salvar conteúdo
- `PATCH /api/v1/admin/resources/[id]/pedagogy` - Atualizar parcial

**Checklist:**
- [ ] Criar endpoints POST/PATCH
- [ ] Validação com Zod em cada endpoint
- [ ] Error handling (400 para dados inválidos)
- [ ] Admin-only (verificar role)

---

#### **Task 5.3: UI Admin para Edição** (4-5h)

**Páginas a criar:**

1. **`/admin/resources/[id]/pedagogy`** - Editor de conteúdo pedagógico
   - Editor de Objetivos
     - Add/remove objetivos
     - Reordenar (drag-drop)
     - Validação inline
   
   - Editor de Steps
     - Add/remove steps
     - Select tipo (WARMUP, DISTRIBUTION, etc)
     - Input duration ("15 min", "1 h")
     - Textarea para conteúdo
     - Reordenar (drag-drop)
   
   - Editor de Materiais (opcional)
     - Add/remove materiais
     - Quantity input

   - Preview em tempo real
   - Save button com loading state
   - Toast feedback (sucesso/erro)

**Componentes a criar:**
- `PedagogicalObjectiveEditor.tsx`
- `PedagogicalStepEditor.tsx`
- `PedagogicalMaterialEditor.tsx`
- `PedagogicalContentForm.tsx` (container)

**Checklist:**
- [ ] Criar formulário principal
- [ ] Componentes de campo (objetivo, step, material)
- [ ] Drag-drop para reordenar
- [ ] Preview em tempo real
- [ ] Conectar com endpoints
- [ ] Testar em browser

---

### Estimativa de Tempo
- **Total:** 8-10 horas
- **Dia 1:** Tasks 5.1 (schemas) + 5.2 (endpoints)
- **Dia 2:** Task 5.3 (UI admin)

### Bloqueadores
- ❌ Nenhum - tudo pronto no schema

---

## 🎯 FASE 6: Métricas + Cache (1-2 semanas)

### Objetivo
Otimizar queries de métricas com cache estratégico.

### Tarefas (6.1 - 6.2)

#### **Task 6.1: Lazy Aggregate (MVP - Fase 1)** ✅ JÁ FEITO

Status: `calculateResourceMetrics()` já implementada em `detail-service.ts`

#### **Task 6.2: Materialized View (Performance - Fase 2)** (4-6h)

**Implementação:**
1. Criar SQL view `resource_metrics_view`
2. Migration para adicionar view
3. Cron job para refresh (1-2x/dia)
4. Query alterar para usar view

```sql
-- migration file
CREATE MATERIALIZED VIEW resource_metrics_view AS
SELECT 
  r.id,
  COALESCE(AVG(rev.rating), 0) as averageRating,
  COUNT(DISTINCT rev.id) as reviewCount,
  COUNT(DISTINCT uri.id) FILTER (WHERE uri.hasDownloaded = true) as downloadCount
FROM resource r
LEFT JOIN review rev ON r.id = rev.resourceId AND rev.status = 'APPROVED'
LEFT JOIN user_resource_interaction uri ON r.id = uri.resourceId
GROUP BY r.id;

CREATE INDEX idx_resource_metrics_view_id ON resource_metrics_view(id);
```

**Cron Job:**
```typescript
// Vercel Cron Job - runs 1x/day
// src/app/api/cron/refresh-metrics/route.ts

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await prisma.$executeRaw`REFRESH MATERIALIZED VIEW resource_metrics_view`;
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
```

**Checklist:**
- [ ] Criar SQL migration com view
- [ ] Testar view em dev
- [ ] Criar Cron endpoint
- [ ] Configurar Vercel Crons
- [ ] Testar refresh automático
- [ ] Documentar em vercel.ts

---

### Estimativa de Tempo
- **Total:** 4-6 horas
- **Prioridade:** MÉDIA (MVP já funciona)

### Quando Fazer
- Após feedback de performance
- Se queries > 200ms em produção

---

## 🎯 FASE 7: Integração E2E + Testes (2-3 semanas)

### Objetivo
Validar completamente todas as features em browsers e devices reais.

### Tarefas (7.1 - 7.3)

#### **Task 7.1: Integração UI Completa** (4-5h)

**Página de Detalhe deve renderizar:**
- ✅ Autor + badge curadoria (já feito)
- ✅ Metadados (já feito)
- ✅ Avaliações (já feito)
- ✅ Botões Salvar/Planejar (já feito)
- ✅ Relacionados (já feito)
- ⏳ Objetivos (novo)
- ⏳ Steps (novo)
- ⏳ Materiais (novo)

**Checklist:**
- [ ] Renderizar seção Objetivos (expandível)
- [ ] Renderizar seção Steps (timeline/accordion)
- [ ] Renderizar seção Materiais (if present)
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Testar com dados reais (seed + dev)

---

#### **Task 7.2: Testes E2E Completos** (6-8h)

**Cenários a testar:**

1. **Anônimo pode ver tudo EXCETO:**
   - Botão Salvar (disabled/hidden)
   - Form de review (redirecionar login)
   - Planejador (redirecionar login)

2. **Usuário logado pode:**
   - [ ] Clicar "Salvar" → aparecer em "Recursos Salvos"
   - [ ] Clicar "Planejar" + escolher data → aparecer no planejador
   - [ ] Criar review → PENDING (admin vê, público não)
   - [ ] Baixar arquivo → incrementar downloadCount

3. **Admin pode:**
   - [ ] Aprovar review → aparece para público
   - [ ] Rejeitar review → removed
   - [ ] Editar conteúdo pedagógico → salvar
   - [ ] Criar relacionamentos → aparecer em "Combina com"

4. **Performance:**
   - [ ] getResourceDetail < 100ms (p95)
   - [ ] Reviews query < 150ms
   - [ ] Related query < 100ms
   - [ ] Lighthouse > 90 (Performance + Accessibility)

**Tools:** Playwright, Puppeteer, ou Cypress

**Checklist:**
- [ ] Criar test suite Playwright
- [ ] Rodar em CI/CD (GitHub Actions)
- [ ] Coverage > 80%

---

#### **Task 7.3: Otimização Final** (3-4h)

**Verificações:**
- [ ] Nenhuma N+1 query
- [ ] Cache headers corretos
- [ ] Imagens otimizadas
- [ ] Fonts carregando rápido
- [ ] JS bundle < 150KB

**Ferramentas:**
- Lighthouse
- WebPageTest
- Chrome DevTools
- Vercel Analytics

---

### Estimativa de Tempo
- **Total:** 13-17 horas
- **Dia 1:** Task 7.1
- **Dia 2-3:** Task 7.2
- **Dia 3:** Task 7.3

---

## 📋 TAREFAS ADICIONAIS (Fora do Roadmap)

### Alta Prioridade

#### **Admin Dashboard - Reviews Pendentes** (3-4h)
```
GET  /admin/reviews/pending
POST /admin/reviews/[id]/approve
POST /admin/reviews/[id]/reject
POST /admin/reviews/[id]/flag

UI: /admin/reviews - Fila de moderação
```

#### **User Dashboard - Recursos Salvos** (2-3h)
```
GET /user/resources/saved (paginated)
GET /user/resources/planned (by date range)

UI: /dashboard/saved - Lista de salvos
    /dashboard/planner - Calendário de planejados
```

#### **Relatórios de Analytics** (4-5h)
```
Métricas to track:
- Downloads por recurso
- Reviews por usuário
- Taxa de salvamento
- Recursos mais planejados
```

---

## 🚀 Timeline Recomendada

### Semana 1 (próxima)
- **Seg-Ter:** Fase 5.1-5.2 (Schemas + Endpoints)
- **Qua:** Fase 5.3 (UI Admin)
- **Qui-Sex:** Admin Reviews Panel + testes

### Semana 2
- **Seg-Ter:** Fase 7.1 (Integração UI)
- **Qua-Sex:** Fase 7.2 (E2E Tests)

### Semana 3
- **Seg:** Fase 7.3 (Performance)
- **Ter-Sex:** User Dashboard + Analytics

---

## 📊 Priorização (MoSCoW)

### MUST HAVE (Crítico)
- ✅ Schema + Models (DONE)
- ✅ Endpoints core (DONE)
- ✅ UI básica (DONE)
- ⏳ Admin: Editar pedagógico (Fase 5)
- ⏳ Admin: Moderar reviews (Alta prioridade)
- ⏳ E2E Tests (Fase 7)

### SHOULD HAVE (Importante)
- ⏳ User Dashboard (Média prioridade)
- ⏳ Materialize View (Performance)
- ⏳ Analytics básico (Média)

### COULD HAVE (Legal ter)
- ⏳ Advanced search/filter
- ⏳ Bulk operations
- ⏳ Export data
- ⏳ API documentation

### WON'T HAVE (Fora do escopo agora)
- Recommendation engine (ML)
- Mobile app native
- Offline sync

---

## 💾 Dependências

```
Fase 5 → Fase 6 (Metrics depende de dados)
Fase 6 → Fase 7 (E2E testa tudo)

Admin Dashboard → Fase 5 (precisa fazer POST /pedagogy)
Admin Dashboard → Reviews (POST /admin/reviews/[id]/approve)
```

---

## 🎯 Métricas de Sucesso

### Ao Completar Fase 5
- ✅ Admin consegue editar conteúdo pedagógico
- ✅ Dados salvos e validados
- ✅ UI responsivo (mobile/desktop)

### Ao Completar Fase 6
- ✅ Queries < 100ms
- ✅ Lighthouse > 90

### Ao Completar Fase 7
- ✅ 100% features testadas
- ✅ 0 bugs conhecidos
- ✅ Documentação completa

---

## 📚 Documentação Necessária

Para cada task, criar:
- [ ] README técnico
- [ ] API docs (Swagger/OpenAPI)
- [ ] UI screenshot
- [ ] Test cases
- [ ] Troubleshooting guide

---

## 🔗 Recursos Úteis

```
Prisma Docs:       https://www.prisma.io/docs
Next.js App Router: https://nextjs.org/docs/app
Tailwind CSS:      https://tailwindcss.com/docs
Zod Validation:    https://zod.dev
Vercel Crons:      https://vercel.com/docs/crons
Playwright:        https://playwright.dev
```

---

## ✅ Checklist Final (Hoje)

Antes de começar Fase 5:

- [ ] Rodar `npm run db:seed` 2x (validar seeds)
- [ ] Testar endpoints com curl/Postman
- [ ] Abrir Prisma Studio - verificar dados
- [ ] Rodar `npm run dev` - verificar UI
- [ ] Criar branch `feat/phase-5-pedagogy`
- [ ] Revisar docs de Fase 5
- [ ] Montar ambiente de desenvolvimento

---

**Status:** Pronto para Fase 5 ✅  
**Próxima ação:** Começar Task 5.1 (Zod Schemas)  
**Tempo estimado Fases 5-7:** 4-5 semanas com 1 dev full-time

