# Resource Details - Checklist de Implementação

## 📋 Visão Geral
Checklist executável para implementação do sistema de "Detalhes do Recurso" com Autoria, Reviews, Interações e Métricas.

---

## 🔴 FASE 1: Autoria + Metadados (1-2 semanas)

### Task 1.1: Schema + Autoria
- [ ] Criar arquivo migration
- [ ] Implementar modelo `Author`
- [ ] Adicionar FKs em `Resource`: `authorId`, `curatorId`, `isCurated`, `curatedAt`
- [ ] Adicionar campos em `User`: `roleTitle`, `location`
- [ ] Adicionar enums: `ResourceType`
- [ ] Gerar Prisma Client
- [ ] Criar 3-5 autores de seed
- [ ] Criar 10 recursos com autores
- [ ] Verificar em Prisma Studio

**Status:** ⏳ Pendente  
**Branch:** `feat/resource-details-phase-1`

### Task 1.2: Metadados de Resource
- [ ] Adicionar `resourceType` (enum)
- [ ] Adicionar `pagesCount` (Int nullable)
- [ ] Adicionar `estimatedDurationMinutes` (Int nullable)
- [ ] Adicionar `slug` (unique)
- [ ] Adicionar `pedagogicalContent` (Json)
- [ ] Adicionar cache fields: `reviewCount`, `averageRating`, `downloadCount`
- [ ] Adicionar `archivedAt` para soft delete
- [ ] Migration + Generate
- [ ] Poplar dados de seed realistas
- [ ] Testar queries com índices

**Status:** ⏳ Pendente  
**Depends on:** Task 1.1

### Task 1.3: API getResourceDetail
- [ ] Atualizar query tRPC para incluir:
  - [ ] author (displayName, displayRole, location, verified)
  - [ ] curator (name) se isCurated
  - [ ] resourceType, pagesCount, estimatedDurationMinutes
  - [ ] pedagogicalContent
  - [ ] reviewCount, averageRating (lazy calculate)
- [ ] Testar em tRPC Playground
- [ ] Testar em browser

**Status:** ⏳ Pendente  
**Depends on:** Task 1.2

---

## 🟡 FASE 2: Reviews + Moderação (1 semana)

### Task 2.1: Review Schema
- [ ] Criar enum `ReviewStatus` (PENDING, APPROVED, REJECTED, FLAGGED)
- [ ] Implementar modelo `Review`
- [ ] Adicionar FK em `User` para ReviewModerator
- [ ] Adicionar índices: (resourceId, status), (userId), (createdAt)
- [ ] Migration + Generate
- [ ] Criar seeds: 5 reviews APPROVED, 2 PENDING, 1 FLAGGED
- [ ] Verificar integridade de FKs

**Status:** ⏳ Pendente  
**Depends on:** Task 1.3

### Task 2.2: Review Endpoints
- [ ] `createReview(resourceId, rating, comment)` → Status PENDING
- [ ] `getResourceReviews(resourceId)` → WHERE status = APPROVED
- [ ] `getResourceAverageRating(resourceId)` → AVG(rating)
- [ ] Admin: `approveReview(reviewId)`
- [ ] Admin: `rejectReview(reviewId)`
- [ ] Admin: `getPendingReviewsQueue()` → Status PENDING
- [ ] Testes unitários (simples)

**Status:** ⏳ Pendente  
**Depends on:** Task 2.1

### Task 2.3: Review UI
- [ ] Componente `ReviewCard` (rating, comment, author, date)
- [ ] Componente `ReviewList` (paginado)
- [ ] Componente `CreateReviewDialog` (rating + textarea)
- [ ] Admin: `PendingReviewsQueue` page
- [ ] Admin: Buttons Approve/Reject/Flag
- [ ] Testar em browser

**Status:** ⏳ Pendente  
**Depends on:** Task 2.2

---

## 🟡 FASE 3: User Interactions (1-2 semanas)

### Task 3.1: UserResourceInteraction Schema
- [ ] Implementar modelo `UserResourceInteraction`
- [ ] Campos: isSaved, savedAt, isPlanned, plannedFor, hasDownloaded, downloadedAt, downloadCount, hasReviewed, reviewId
- [ ] Índices críticos: (userId, isSaved), (userId, plannedFor), (userId, hasDownloaded), (resourceId)
- [ ] Migration + Generate
- [ ] Seeds: 20 users × 5 interactions variadas
- [ ] Verificar índices criados (EXPLAIN ANALYZE)

**Status:** ⏳ Pendente  
**Depends on:** Task 2.1

### Task 3.2: Interaction Endpoints
- [ ] `toggleSaveResource(resourceId)` → Upsert isSaved + savedAt
- [ ] `planResource(resourceId, plannedFor)` → Upsert isPlanned + plannedFor
- [ ] `logDownload(resourceId)` → Incrementa downloadCount
- [ ] `getUserSavedResources(limit, offset)` → WHERE isSaved = true
- [ ] `getUserPlannedResources(startDate, endDate)` → Planejador
- [ ] Autenticação required em todos
- [ ] Error handling (resource not found, etc)

**Status:** ⏳ Pendente  
**Depends on:** Task 3.1

### Task 3.3: Interaction UI
- [ ] Botão "Salvar" (toggle + animação) na tela de detalhe
- [ ] Botão "Planejar" → DatePicker (plannedFor)
- [ ] Feedback visual (toast) após salvar/planejar
- [ ] Dashboard: "Recursos Salvos" (lista paginada)
- [ ] Planejador: View calendário/semanal (recursos planejados)
- [ ] Testar em mobile/desktop
- [ ] Teste E2E: salvar e verificar em dashboard

**Status:** ⏳ Pendente  
**Depends on:** Task 3.2

---

## 🟡 FASE 4: Relacionamentos (1 semana)

### Task 4.1: RelatedResource Schema
- [ ] Criar enum `RelatedResourceType` (COMPLEMENTS, PREREQUISITE, ADVANCED, RELATED_TOPIC)
- [ ] Implementar modelo `RelatedResource`
- [ ] Campos: sourceResourceId, targetResourceId, relationType, relevanceScore, createdBy, createdAt
- [ ] Índices: (sourceResourceId), (targetResourceId, relationType)
- [ ] Migration + Generate
- [ ] Seeds: 10-20 pares de recursos com tipos e scores
- [ ] Testar queries (EXPLAIN ANALYZE sourceResourceId)

**Status:** ⏳ Pendente  
**Depends on:** Task 1.3

### Task 4.2: Relation Endpoints
- [ ] Admin: `createRelatedResource(sourceId, targetId, type, score)` → Validar FKs
- [ ] Admin: `deleteRelatedResource(relationId)` → Verificar permissões
- [ ] Admin: `updateRelationRelevance(relationId, score)`
- [ ] `getRelatedResources(resourceId, limit=5)` → ORDER BY relevanceScore DESC
- [ ] Error handling (circular relations, etc)

**Status:** ⏳ Pendente  
**Depends on:** Task 4.1

### Task 4.3: Relation UI
- [ ] Seção "Combina com essa aula" na tela de detalhe
- [ ] Cards dos recursos relacionados (thumbnail, título, tipo)
- [ ] Admin: Form para criar relações (autocomplete)
- [ ] Admin: List/Delete de relações existentes
- [ ] Testar em browser

**Status:** ⏳ Pendente  
**Depends on:** Task 4.2

---

## 🟢 FASE 5: Conteúdo Pedagógico (1 semana)

### Task 5.1: PedagogicalContent Validation
- [ ] Definir Zod schema para `pedagogicalContent`
  - [ ] objectives: array de {id, text, order}
  - [ ] steps: array de {id, type, title, duration, content, order}
  - [ ] materials: array de {id, name, quantity} (opcional)
- [ ] Criar função `validatePedagogicalContent()`
- [ ] Script para popular recursos de seed com dados realistas
- [ ] Testar validação (invalid data deve falhar)

**Status:** ⏳ Pendente  
**Depends on:** Task 1.2

### Task 5.2: Pedagogy Endpoints
- [ ] `updateResourcePedagogicalContent(resourceId, content)` → Validar com Zod
- [ ] `getPedagogicalContent(resourceId)` → Já incluso em getResourceDetail
- [ ] Admin only para update
- [ ] Error handling (validation errors)

**Status:** ⏳ Pendente  
**Depends on:** Task 5.1

### Task 5.3: Pedagogy UI
- [ ] Admin: Form para editar Objetivos (add, remove, reorder)
- [ ] Admin: Form para editar Steps (drag-drop para reorder)
- [ ] Admin: Form para editar Materials (opcional)
- [ ] Preview em tempo real
- [ ] Save + Toast feedback
- [ ] Testar em browser

**Status:** ⏳ Pendente  
**Depends on:** Task 5.2

---

## 🟢 FASE 6: Métricas + Cache (1 semana)

### Task 6.1: Lazy Aggregate (MVP)
- [ ] Função `calculateResourceMetrics(resourceId)`:
  - [ ] AVG(review.rating) WHERE status = APPROVED
  - [ ] COUNT(review) WHERE status = APPROVED
  - [ ] COUNT(userInteraction) WHERE hasDownloaded = true
- [ ] Integrar em `getResourceDetail` → sempre fresh
- [ ] Teste de performance (< 100ms para 1000 reviews)

**Status:** ⏳ Pendente  
**Depends on:** Task 2.2

### Task 6.2: Materialized View (Fase 2, OPCIONAL)
- [ ] Criar SQL view: `resource_metrics`
- [ ] SELECT r.id, AVG(rev.rating), COUNT(*), etc
- [ ] Cron job: REFRESH (1-2x por dia)
- [ ] Query update: SELECT FROM view ao invés de calc
- [ ] Medir latência melhora

**Status:** ⏳ Pendente (Fase 2)  
**Depends on:** Task 6.1

---

## 🔵 FASE 7: Integração E2E (1-2 semanas)

### Task 7.1: Integração Completa
- [ ] Renderizar Author + Curator badge em `ResourceDetails`
- [ ] Renderizar Metadados (páginas, duração, tipo)
- [ ] Renderizar Objetivos (expandível)
- [ ] Renderizar Steps (timeline/accordion)
- [ ] Renderizar Reviews (com average rating no topo)
- [ ] Renderizar botões: Salvar, Planejar
- [ ] Renderizar Relacionados
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Testar com dados reais (não seed)

**Status:** ⏳ Pendente  
**Depends on:** Task 3.3, 4.3, 5.3

### Task 7.2: E2E Tests
- [ ] [ ] Usuário anônimo vê página completa (sem interações)
- [ ] Usuário logado clica "Salvar" → fica salvo
- [ ] Usuário logado verifica em "Recursos Salvos"
- [ ] Usuário cria review → fica PENDING (admin só vê)
- [ ] Admin aprova review → aparece para público
- [ ] Usuário clica "Planejar" → data picker
- [ ] Planejador mostra recurso na data correta
- [ ] Related resources carregam e são clicáveis
- [ ] Performance: Lighthouse > 90

**Status:** ⏳ Pendente  
**Depends on:** Task 7.1

### Task 7.3: Analytics + Monitoring
- [ ] [ ] Query principal getResourceDetail < 100ms (p95)
- [ ] Reviews query < 150ms
- [ ] Dashboard queries < 200ms
- [ ] Implementar observability (se aplicável)

**Status:** ⏳ Pendente  
**Depends on:** Task 7.2

---

## 📊 Resumo de Progresso

| Fase | Status | Tasks | Subtasks | ETA |
|------|--------|-------|----------|-----|
| 1: Autoria + Metadados | ⏳ | 3 | 15 | Semana 1 |
| 2: Reviews + Moderação | ⏳ | 3 | 12 | Semana 2 |
| 3: Interações | ⏳ | 3 | 15 | Semana 2-3 |
| 4: Relacionamentos | ⏳ | 3 | 12 | Semana 3 |
| 5: Conteúdo Pedagógico | ⏳ | 3 | 10 | Semana 4 |
| 6: Métricas | ⏳ | 2 | 6 | Semana 4-5 |
| 7: E2E + Integração | ⏳ | 3 | 15 | Semana 5 |
| **TOTAL** | **⏳** | **20** | **85** | **5 semanas** |

---

## 🚀 Próximas Ações

1. Criar branches para cada fase
2. Iniciar Fase 1 (schema + API)
3. Revisão de arquitetura com time
4. Daily standup para tracking

---

**Última atualização:** 2026-04-19 10:30 GMT-3  
**Owner:** Arquitetura de Software  
**Reviewers:** Time de Produto, DevOps
