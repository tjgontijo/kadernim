# Resource Details - Plano de Implementação Completo
**Versão: 2.0 - Arquitetura Revisada**  
**Data: 2026-04-19**  
**Status: Pronto para Implementação**

---

## 1. Visão Geral

Este documento detalha a implementação completa da tela de "Detalhes do Recurso" no Kadernim, com suporte para:
- Sistema de autoria e curadoria editorial
- Conteúdo pedagógico estruturado (objetivos, passo-a-passo)
- Reviews e avaliações de usuários
- Interações de usuário (salvar, planejar, download)
- Recursos relacionados com relevância
- Habilidades BNCC integradas

**Base arquitetural:** Schema PostgreSQL com UUID padrão (já implementado em todo o projeto).

---

## 2. Análise da Implementação Atual

### ✅ O que já existe:
- `Resource`: Modelo base com título, descrição, educationLevel, subject
- `ResourceGrade`: Relação com níveis de ensino
- `ResourceUserAccess`: Permissões de acesso (será refatorado)
- `BnccSkill` + `ResourceBnccSkill`: Competências BNCC (completo)
- `ResourceImage`, `ResourceFile`, `ResourceVideo`: Mídia associada
- `User`: Modelo de usuário com role e perfil

### ⏳ O que precisa ser implementado:
1. **Autoria e Curadoria**: Author + campos em Resource
2. **Conteúdo Pedagógico**: ResourceObjective + ResourceStep (JSON + DB)
3. **Reviews**: Sistema de avaliações com moderação
4. **Interações**: UserResourceInteraction (unificado)
5. **Relacionamentos**: RelatedResource com scoring
6. **Métricas**: ResourceMetrics (views + cache)

---

## 3. Recomendações Arquitetais Aplicadas

### 3.1 Autoria Desacoplada
**Rationale:** Separar autoria de autenticação permite:
- Autores históricos ou externos sem User account
- Perfis de exibição independentes
- Evolução futura (foto, bio, badges)

```prisma
# Novo modelo Author (Light)
- id (UUID, PK)
- userId (FK nullable) -> User
- displayName (String)
- displayRole (String) - "Prof. 2º ano", "Especialista"
- location (String, nullable)
- verified (Boolean)
- createdAt
```

**Integração em Resource:**
```prisma
authorId (FK) -> Author
isCurated (Boolean) - Editorial approval flag
curatedAt (DateTime, nullable) - Timestamp de curadoria
curatorId (FK nullable) -> User (Admin que curou)
```

### 3.2 Conteúdo Pedagógico: JSON + Validação em App
**Rationale:** Flexibilidade sem migrations constantes + validação em camada de aplicação

```prisma
# Resource.pedagogicalContent (Json)
{
  objectives: [
    { id: uuid, text: string, order: number }
  ],
  steps: [
    { 
      id: uuid, 
      type: "warmup" | "distribution" | "practice" | "conclusion",
      title: string,
      duration: "10 min" | null,
      content: string,
      order: number
    }
  ],
  materials: [
    { id: uuid, name: string, quantity: number }
  ]
}
```

**Benefício:** 1 query ao detalhe, sem múltiplos JOINs, permite versioning.

### 3.3 Reviews com Moderation Workflow
**Rationale:** UGC precisa de aprovação para QA

```prisma
model Review {
  id, resourceId, userId
  rating (1-5)
  comment (nullable)
  status: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED"
  moderatedAt, moderatedBy
  helpfulCount, unhelpfulCount, flagCount
  createdAt
}
```

**Query otimizada:** `SELECT * FROM review WHERE resourceId = ? AND status = 'APPROVED'`

### 3.4 UserResourceInteraction Unificado
**Rationale:** Consolidar em 1 modelo ao invés de 2-3 reduz JOINs e oferece histórico completo

```prisma
model UserResourceInteraction {
  userId + resourceId (unique compound)
  isSaved, savedAt
  isPlanned, plannedFor (DateTime nullable)
  hasDownloaded, downloadedAt, downloadCount
  hasReviewed, reviewId (FK nullable)
  createdAt, updatedAt
}
```

**Queries:** Rápidas, índices bem-definidos.

### 3.5 RelatedResource Unidirecional com Relevância
**Rationale:** Editor define relações manualmente, peso permite ranking automático

```prisma
model RelatedResource {
  sourceResourceId + targetResourceId (unique)
  relationType: "COMPLEMENTS" | "PREREQUISITE" | "ADVANCED" | "RELATED_TOPIC"
  relevanceScore (1-5, default 3)
  createdBy (FK)
  createdAt
}
```

**Vantagem:** Sem sincronização, sem queries bidireccionais custosas.

### 3.6 ResourceMetrics via SQL View (Fase 2)
**Fase 1 MVP:** Lazy aggregate (calcula sob demanda)  
**Fase 2:** Materialized View com refresh via cron  
**Objetivo:** Performance em alta volumetria

---

## 4. Especificação do Schema Prisma

### 4.1 Novas Enumerações

```prisma
enum ResourceType {
  PRINTABLE_ACTIVITY
  LESSON_PLAN
  GAME
  ASSESSMENT
  OTHER
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  FLAGGED
}

enum RelatedResourceType {
  COMPLEMENTS      // "Combina com..."
  PREREQUISITE     // "Antes leia..."
  ADVANCED         // "Próximo nível..."
  RELATED_TOPIC    // "Mesmo assunto..."
}
```

### 4.2 Novo Modelo: Author

```prisma
model Author {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Vinculação opcional com usuário autenticado
  userId String? @unique @db.Uuid
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // Dados de exibição
  displayName String
  displayRole String? // "Prof. 2º ano", "Especialista em Matemática"
  location String? // "Belo Horizonte, MG"
  verified Boolean @default(false)
  
  // Auditoria
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  resources Resource[]
  
  @@index([displayName])
  @@map("author")
}
```

### 4.3 Atualização: Resource

```prisma
model Resource {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Existentes
  title String
  description String?
  educationLevelId String @db.Uuid
  subjectId String @db.Uuid
  externalId Int? @unique
  isFree Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  originRequestId String? @unique
  
  // NOVAS: Autoria e Curadoria
  authorId String? @db.Uuid
  author Author? @relation(fields: [authorId], references: [id], onDelete: SetNull)
  isCurated Boolean @default(false)
  curatedAt DateTime?
  curatorId String? @db.Uuid
  curator User? @relation(fields: [curatorId], references: [id], onDelete: SetNull)
  
  // NOVAS: Metadados do Recurso
  resourceType ResourceType @default(OTHER)
  pagesCount Int? // Para PDFs
  estimatedDurationMinutes Int? // "~50 min"
  slug String? @unique // Para SEO
  
  // NOVAS: Cache de Métricas (Fase 1: lazy, Fase 2: materialized view)
  reviewCount Int @default(0)
  averageRating Float @default(0)
  downloadCount Int @default(0)
  
  // NOVAS: Conteúdo Pedagógico (JSON)
  pedagogicalContent Json? // Objectives + Steps + Materials
  
  // NOVAS: Soft Delete
  archivedAt DateTime?
  
  // Relacionamentos existentes
  educationLevel EducationLevel @relation(fields: [educationLevelId], references: [id])
  subject Subject @relation(fields: [subjectId], references: [id])
  files ResourceFile[]
  grades ResourceGrade[]
  images ResourceImage[]
  accessEntries ResourceUserAccess[]
  videos ResourceVideo[]
  bnccSkills ResourceBnccSkill[]
  
  // NOVOS: Relacionamentos
  reviews Review[]
  userInteractions UserResourceInteraction[]
  sourceRelations RelatedResource[] @relation("source")
  targetRelations RelatedResource[] @relation("target")
  
  @@index([educationLevelId])
  @@index([subjectId])
  @@index([authorId])
  @@index([curatorId])
  @@index([title, id])
  @@index([slug])
  @@index([archivedAt]) // Para queries "where archivedAt IS NULL"
  @@map("resource")
}
```

### 4.4 Novo Modelo: Review

```prisma
model Review {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  resourceId String @db.Uuid
  userId String @db.Uuid
  
  // Avaliação
  rating Int @db.SmallInt // 1-5
  comment String? @db.Text
  
  // Moderação
  status ReviewStatus @default(PENDING)
  moderatedAt DateTime?
  moderatedBy String? @db.Uuid // User.id que moderou
  
  // Anti-abuse
  helpfulCount Int @default(0)
  unhelpfulCount Int @default(0)
  flagCount Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  resource Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  moderator User? @relation("ReviewModerator", fields: [moderatedBy], references: [id], onDelete: SetNull)
  
  @@unique([resourceId, userId]) // 1 review por usuário/recurso
  @@index([resourceId, status]) // Crítico para queries
  @@index([userId])
  @@index([createdAt])
  @@map("review")
}
```

### 4.5 Novo Modelo: UserResourceInteraction

```prisma
model UserResourceInteraction {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  userId String @db.Uuid
  resourceId String @db.Uuid
  
  // Interações booleanas + timestamps
  isSaved Boolean @default(false)
  savedAt DateTime?
  
  isPlanned Boolean @default(false)
  plannedFor DateTime? // Data planejada para usar
  
  hasDownloaded Boolean @default(false)
  downloadedAt DateTime?
  downloadCount Int @default(0)
  
  hasReviewed Boolean @default(false)
  reviewId String? @unique @db.Uuid // FK para Review
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  resource Resource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  @@unique([userId, resourceId])
  @@index([userId, isSaved]) // Dashboard: recursos salvos
  @@index([userId, plannedFor]) // Planejador: recursos agendados
  @@index([userId, hasDownloaded]) // Analytics: recursos usados
  @@index([resourceId])
  @@map("user_resource_interaction")
}
```

### 4.6 Novo Modelo: RelatedResource

```prisma
model RelatedResource {
  id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  sourceResourceId String @db.Uuid
  targetResourceId String @db.Uuid
  
  // Tipo de relação
  relationType RelatedResourceType @default(COMPLEMENTS)
  
  // Relevância (para ranking/exibição)
  relevanceScore Int @db.SmallInt @default(3) // 1-5
  
  createdBy String @db.Uuid // User.id (admin)
  createdAt DateTime @default(now())
  
  // Relacionamentos
  source Resource @relation("source", fields: [sourceResourceId], references: [id], onDelete: Cascade)
  target Resource @relation("target", fields: [targetResourceId], references: [id], onDelete: Cascade)
  creator User @relation(fields: [createdBy], references: [id], onDelete: Restrict)
  
  @@unique([sourceResourceId, targetResourceId]) // Evita duplicatas
  @@index([sourceResourceId]) // Query: relacionados de um recurso
  @@index([targetResourceId])
  @@index([relationType])
  @@map("related_resource")
}
```

### 4.7 Atualizações: User

```prisma
model User {
  // ... existentes ...
  
  // NOVOS: Opcionais para preenchimento de perfil
  roleTitle String? // "Prof. 2º ano" (pode diferir de Author.displayRole)
  location String? // "Belo Horizonte, MG"
  
  // NOVOS: Relacionamentos
  createdResources Resource[] @relation("authorCreated") // Se for autor
  curatedResources Resource[] @relation("ResourceCurator")
  reviews Review[]
  reviewsAsModeration Review[] @relation("ReviewModerator")
  userInteractions UserResourceInteraction[]
  relationsCreated RelatedResource[]
  
  @@map("user")
}
```

**Nota:** Os relacionamentos `createdResources` e `curatedResources` acessam Resource através de Author ou direto via `curatorId`. Revisar conforme padrão adotado.

### 4.8 Índices de Performance (Críticos)

```prisma
// Em Review
@@index([resourceId, status])
@@index([userId, status])
@@index([createdAt])

// Em UserResourceInteraction
@@index([userId, isSaved])
@@index([userId, isPlanned, plannedFor])
@@index([userId, hasDownloaded])
@@index([resourceId])

// Em RelatedResource
@@index([sourceResourceId])
@@index([targetResourceId, relationType])

// Em Resource
@@index([authorId])
@@index([slug])
@@index([archivedAt])
```

---

## 5. Plano de Implementação com Tasks

### Fase 1: Autoria + Metadados Básicos (Semana 1)

#### Task 1.1: Criar modelo Author e atualizar Resource
- [ ] 1.1.1: Criar migration `add_author_and_curation_fields`
  - [ ] Novo modelo `Author`
  - [ ] FKs em `Resource`: authorId, curatorId, isCurated, curatedAt
  - [ ] Campos opcionais em `User`: roleTitle, location
- [ ] 1.1.2: Gerar Prisma Client
- [ ] 1.1.3: Criar seeds para teste (3-5 autores, 10 recursos com autor)
- [ ] 1.1.4: Testar relacionamentos no Prisma Studio

#### Task 1.2: Adicionar metadados de Resource
- [ ] 1.2.1: Adicionar campos a `Resource`:
  - [ ] `resourceType` (enum)
  - [ ] `pagesCount`, `estimatedDurationMinutes`
  - [ ] `slug` (unique, para SEO)
  - [ ] `pedagogicalContent` (Json, null inicialmente)
  - [ ] Campos de cache: `reviewCount`, `averageRating`, `downloadCount`
  - [ ] `archivedAt` (soft delete)
- [ ] 1.2.2: Migration + Generate
- [ ] 1.2.3: Seeds com dados realistas

#### Task 1.3: Atualizar API de detalhe do recurso (tRPC)
- [ ] 1.3.1: Chamar `getResourceDetail` existente, adicionar select de:
  - [ ] author (displayName, displayRole, location, verified)
  - [ ] curator (name)
  - [ ] resourceType, pagesCount, estimatedDurationMinutes
  - [ ] pedagogicalContent
  - [ ] reviewCount, averageRating
- [ ] 1.3.2: Testar em browser

---

### Fase 2: Reviews + Moderação (Semana 2)

#### Task 2.1: Criar modelo Review com moderation
- [ ] 2.1.1: Migration `add_review_system`
  - [ ] Novo modelo `Review` (com ReviewStatus enum)
  - [ ] FKs em `User`: reviewModeration relationship
- [ ] 2.1.2: Generate + Seeds (5 reviews APPROVED, 2 PENDING)
- [ ] 2.1.3: Índices de performance verificados

#### Task 2.2: Implementar endpoints tRPC para Reviews
- [ ] 2.2.1: `createReview(resourceId, rating, comment)` → Status PENDING
- [ ] 2.2.2: `getResourceReviews(resourceId)` → Apenas APPROVED
- [ ] 2.2.3: `getResourceAverageRating(resourceId)` → Lazy aggregate (Fase 1)
- [ ] 2.2.4: Admin: `approveReview(reviewId)`, `rejectReview(reviewId)`

#### Task 2.3: UI para Reviews
- [ ] 2.3.1: Componente `ReviewList` (mostra reviews APPROVED com rating)
- [ ] 2.3.2: Form `CreateReviewDialog` (rating + comment)
- [ ] 2.3.3: Dashboard admin: `PendingReviewsQueue`

---

### Fase 3: Interações de Usuário (Semana 2-3)

#### Task 3.1: Criar UserResourceInteraction
- [ ] 3.1.1: Migration `add_user_resource_interactions`
  - [ ] Modelo `UserResourceInteraction` com todos os campos
  - [ ] Índices de performance
- [ ] 3.1.2: Seeds: 20 users × 5 interactions (salvar, planejar, download)
- [ ] 3.1.3: Verificar índices criados

#### Task 3.2: Endpoints tRPC para interações
- [ ] 3.2.1: `toggleSaveResource(resourceId)` → Upsert isSaved
- [ ] 3.2.2: `planResource(resourceId, plannedFor: DateTime)` → Upsert isPlanned
- [ ] 3.2.3: `logDownload(resourceId)` → Incrementa downloadCount
- [ ] 3.2.4: `getUserSavedResources()` → WHERE isSaved = true
- [ ] 3.2.5: `getUserPlannedResources(startDate, endDate)` → Planejador

#### Task 3.3: UI para interações
- [ ] 3.3.1: Botão "Salvar" (toggle) na tela de detalhe
- [ ] 3.3.2: Botão "Planejar" → DatePicker (plannedFor)
- [ ] 3.3.3: Dashboard usuário: "Recursos Salvos" (lista paginada)
- [ ] 3.3.4: Planejador semanal/mensal (view calendário de recursos planejados)

---

### Fase 4: Recursos Relacionados (Semana 3)

#### Task 4.1: Criar RelatedResource
- [ ] 4.1.1: Migration `add_related_resources`
  - [ ] Modelo `RelatedResource` com RelatedResourceType enum
  - [ ] Índices críticos
- [ ] 4.1.2: Seeds: 10 pares de recursos com tipos e scores
- [ ] 4.1.3: Testar queries de performance

#### Task 4.2: Admin endpoints
- [ ] 4.2.1: `createRelatedResource(sourceId, targetId, type, relevanceScore)`
- [ ] 4.2.2: `deleteRelatedResource(relationId)`
- [ ] 4.2.3: `listResourceRelations(sourceId)` → ORDER BY relationType, relevanceScore DESC

#### Task 4.3: API pública
- [ ] 4.3.1: `getRelatedResources(resourceId, limit=5)` → Ordenado por relevância
- [ ] 4.3.2: Opcionalmente filtrar por tipo de relação

#### Task 4.4: UI
- [ ] 4.4.1: Seção "Combina com essa aula" na tela de detalhe
- [ ] 4.4.2: Admin: Form para criar relações (autocomplete de recursos)

---

### Fase 5: Conteúdo Pedagógico + Geração (Semana 4)

#### Task 5.1: Validar e popular pedagogicalContent
- [ ] 5.1.1: Definir Zod schema para pedagogicalContent JSON
- [ ] 5.1.2: Script para popular recursos existentes com dados seed (objetivos + steps)
- [ ] 5.1.3: Validation no tRPC (ao criar/editar resource)

#### Task 5.2: Endpoints para conteúdo pedagógico
- [ ] 5.2.1: `updateResourcePedagogicalContent(resourceId, content)`
- [ ] 5.2.2: `getPedagogicalContent(resourceId)` (já incluso em detalhe)

#### Task 5.3: UI para gerenciar conteúdo
- [ ] 5.3.1: Admin: Form para editar Objetivos (add, remove, reorder)
- [ ] 5.3.2: Admin: Form para editar Steps (passo-a-passo)
- [ ] 5.3.3: Preview em tempo real

---

### Fase 6: Métricas + Cache (Semana 4-5)

#### Task 6.1: Lazy Aggregate (MVP, Fase 1)
- [ ] 6.1.1: Função `calculateResourceMetrics(resourceId)` em tRPC
  - [ ] AVG(review.rating) onde status = APPROVED
  - [ ] COUNT(review) onde status = APPROVED
  - [ ] COUNT(userInteraction) onde hasDownloaded = true
- [ ] 6.1.2: Integrar em `getResourceDetail` → sempre calcula fresh

#### Task 6.2: Materialized View (Fase 2, Opcional)
- [ ] 6.2.1: Migration para criar VW: `resource_metrics`
  - [ ] SELECT r.id, AVG(rev.rating), COUNT(rev.id), COUNT(dar.id)
  - [ ] JOIN Review, UserResourceInteraction
- [ ] 6.2.2: Cron job para REFRESH (1-2x por dia via Vercel Cron)
- [ ] 6.2.3: Query alterar para SELECT FROM resource_metrics

---

### Fase 7: Integração e Testes E2E (Semana 5)

#### Task 7.1: Integração completa tela de detalhe
- [ ] 7.1.1: Renderizar todos os novos dados em `ResourceDetails` page
  - [ ] Autor + curadoria badge
  - [ ] Metadados (páginas, duração, tipo)
  - [ ] Objetivos e steps
  - [ ] Reviews aprovadas
  - [ ] Botões: Salvar, Planejar, Download
  - [ ] Relacionados
- [ ] 7.1.2: Testar responsividade (mobile/desktop)

#### Task 7.2: Testes E2E
- [ ] 7.2.1: Usuário anônimo vê tela completa (sem botões interativos)
- [ ] 7.2.2: Usuário logado clica Salvar → aparecem em "Salvos"
- [ ] 7.2.3: Usuário logado cria review → fica PENDING
- [ ] 7.2.4: Admin aprova review → aparece para público
- [ ] 7.2.5: Usuário clica Planejar → aparece no planejador

#### Task 7.3: Performance
- [ ] 7.3.1: Lighthouse > 90 (Performance, Accessibility)
- [ ] 7.3.2: Query principal (getResourceDetail) < 100ms
- [ ] 7.3.3: Reviews list < 150ms

---

## 6. Ordem de Implementação Recomendada

```
Semana 1:
  ├─ Task 1.1: Author + curation fields
  ├─ Task 1.2: Metadados de Resource
  └─ Task 1.3: API getResourceDetail

Semana 2:
  ├─ Task 2.1: Review + moderation
  ├─ Task 2.2: Review endpoints
  ├─ Task 2.3: Review UI
  ├─ Task 3.1: UserResourceInteraction schema
  └─ Task 3.2: Interaction endpoints

Semana 3:
  ├─ Task 3.3: Interaction UI
  ├─ Task 4.1: RelatedResource schema
  └─ Task 4.2-4.4: Related endpoints + UI

Semana 4-5:
  ├─ Task 5: Conteúdo pedagógico
  ├─ Task 6.1: Lazy aggregate (metrics)
  ├─ Task 7: Integração E2E + testes
  └─ Task 6.2: Materialized view (opcional)
```

---

## 7. Considerações de Performance

### Índices Críticos
- `Review(resourceId, status)` - Queries de avaliações aprovadas
- `UserResourceInteraction(userId, isSaved)` - Dashboard do usuário
- `UserResourceInteraction(userId, plannedFor)` - Planejador
- `RelatedResource(sourceResourceId)` - Recomendações

### N+1 Query Prevention
- Usar Prisma `include` para Author, Review, UserInteraction em um select
- Pagination em reviews (limit=5, offset) se recurso tiver 1000+ reviews

### Cache Strategy
- **Fase 1 (MVP):** Lazy aggregate - correto, sem sync
- **Fase 2:** Materialized View + Cron refresh (1-2h delay aceitável)
- **Futuro:** Redis cache de getResourceDetail (invalidate on review creation)

---

## 8. Rollback e Segurança

### Soft Delete
- `Resource.archivedAt` permite "deletar" sem perder dados históricos
- Queries padrão: `WHERE archivedAt IS NULL`

### Data Integrity
- Review FK cascada (ao deletar recurso, reviews também deletam)
- RelatedResource FK RESTRICT em creator (não deixa deletar usuário)
- UserResourceInteraction cascada (histórico de interações apagado com recurso)

### Validações em Aplicação
- Rating: 1-5
- pedagogicalContent: Zod schema validation
- relevanceScore: 1-5
- plannedFor: DateTime futuro ou presente

---

## 9. Próximos Passos

1. **Review**: Aprovar schema com time
2. **Criar branches**: `feat/resource-details-phase-1` para cada fase
3. **Iniciar Fase 1**: Author + Metadados (semana de 2026-04-21)
4. **Weekly check-in**: Manter roadmap atualizado

---

## 10. Referências

- Schema atual: `prisma/schema.prisma` (v2.0+)
- Componentes UI: `src/components/design-system/resources/`
- API tRPC: `src/server/trpc/routes/resource.ts`
- Design System: `docs/Kadernim/design-system.md`

---

**Documento criado:** 2026-04-19  
**Próxima revisão:** Após Fase 1 (2026-04-28)
