# PRD: Refatoração do Schema de Recursos - Simplificação da Hierarquia Curricular

**Versão:** 1.0  
**Data:** 2026-01-07  
**Status:** Proposto  
**Autor:** DBA Analysis

---

## 1. Resumo Executivo

Este documento propõe uma refatoração do modelo de dados para eliminar redundância e inconsistências na relação entre `Resource` e as entidades curriculares (`EducationLevel`, `Grade`, `Subject`).

### Problema Atual
O modelo atual permite inconsistências:
- Um Resource tem `educationLevelId` direto (obrigatório) + `grades[]` via N:N (opcional)
- Grades já pertencem a um EducationLevel, tornando o campo direto redundante
- Não há validação de que os Grades selecionados pertencem ao EducationLevel informado
- Subject é global, sem validação via GradeSubject

### Solução Proposta
- **Remover** `educationLevelId` direto do Resource
- **Tornar** `grades[]` obrigatório (mínimo 1)
- EducationLevel será **derivado** dos Grades selecionados
- Subject será **validado** via GradeSubject

---

## 2. Análise do Schema Atual

### 2.1 Estrutura Existente

```
EducationLevel (1)
     │
     ├── Grade (N) ──► EducationLevel via educationLevelId
     │         │
     │         └── GradeSubject (N:N) ──► Subject
     │
     └── Resource (N) ──► EducationLevel via educationLevelId (REDUNDANTE)
               │
               ├── Subject (1) via subjectId
               └── ResourceGrade (N:N) ──► Grade (opcional)
```

### 2.2 Problemas Identificados

| Problema | Impacto | Exemplo |
|----------|---------|---------|
| **Redundância** | EducationLevel informado 2x (direto + via Grade) | Resource com EF1 + grades do EM |
| **Inconsistência** | Grades podem conflitar com EducationLevel | Possível salvar dados inválidos |
| **Sem validação Subject** | Subject não validado via GradeSubject | Química para 1º ano EF1 |
| **UX confusa** | Admin escolhe 4 campos (etapa, ano, disciplina, grades) | Fluxo complexo |

---

## 3. Novo Modelo Proposto

### 3.1 Schema Prisma Atualizado

```prisma
model Resource {
  id              String             @id @default(cuid())
  title           String
  description     String?  

  // REMOVIDO: educationLevelId (será derivado dos grades)
  
  subjectId       String
  subject         Subject            @relation(fields: [subjectId], references: [id])
  
  externalId      Int                @unique
  isFree          Boolean            @default(false)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  images          ResourceImage[]
  files           ResourceFile[]
  videos          ResourceVideo[]
  accessEntries   ResourceUserAccess[]
  grades          ResourceGrade[]    // AGORA OBRIGATÓRIO (mínimo 1)

  originRequestId String?            @unique
  originRequest   CommunityRequest?  @relation(fields: [originRequestId], references: [id])

  // REMOVIDO: @@index([educationLevelId])
  @@index([subjectId])
  @@index([title, id])
  @@map("resource")
}
```

### 3.2 Hierarquia Simplificada

```
Fluxo de Criação:
┌─────────────────────────────────────────────────────────────┐
│ 1. Selecionar GRADE(S)  ◄─── Obrigatório, multi-select      │
│    └── EducationLevel inferido automaticamente              │
│                                                             │
│ 2. Selecionar SUBJECT   ◄─── Filtrado via GradeSubject      │
│    └── Só mostra disciplinas válidas para os grades         │
│                                                             │
│ 3. Preencher dados básicos (título, descrição, etc.)        │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **RN-01** | `grades` é obrigatório com mínimo 1 item |
| **RN-02** | Todos os grades selecionados devem pertencer ao **mesmo EducationLevel** |
| **RN-03** | Subject deve existir em `GradeSubject` para **pelo menos 1** dos grades selecionados |
| **RN-04** | EducationLevel é derivado: `resource.grades[0].grade.educationLevel` |
| **RN-05** | Ao exibir EducationLevel, buscar via JOIN com grades |

---

## 4. Plano de Migração

### 4.1 Fase 1: Preparação (Sem breaking changes)

1. **Criar migration para tornar `educationLevelId` nullable**
2. **Popular grades vazios**: Para resources sem grades, criar ResourceGrade baseado no educationLevelId atual
3. **Adicionar validação** nas APIs para garantir grades não-vazio

### 4.2 Fase 2: Migração de Dados

```sql
-- Para cada resource sem grades, criar vínculo com TODOS os grades do seu educationLevel
INSERT INTO resource_grade (id, "resourceId", "gradeId")
SELECT 
  gen_random_uuid(),
  r.id,
  g.id
FROM resource r
JOIN grade g ON g."educationLevelId" = r."educationLevelId"
WHERE NOT EXISTS (
  SELECT 1 FROM resource_grade rg WHERE rg."resourceId" = r.id
);
```

### 4.3 Fase 3: Remoção do Campo

```prisma
-- Após confirmar migração
ALTER TABLE resource DROP COLUMN "educationLevelId";
DROP INDEX resource_education_level_id_idx;
```

---

## 5. Arquivos a Modificar

### 5.1 Schema e Tipos (8 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `prisma/schema.prisma` | Remover `educationLevelId` de Resource, adicionar constraint |
| `src/lib/schemas/admin/resources.ts` | Remover `educationLevel`, tornar `grades` obrigatório |
| `src/lib/schemas/resource.ts` | Atualizar `ResourceSchema` e `ResourceFilterSchema` |
| `src/lib/schemas/community.ts` | Verificar se usa educationLevelId de Resource |
| `src/types/request.ts` | Atualizar tipos se necessário |
| `src/hooks/use-resource-meta.ts` | Manter - já tem grades |
| `src/hooks/use-admin-resources.ts` | Verificar query params |

### 5.2 Services (7 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `src/services/resources/admin/create-service.ts` | Remover educationLevelId, validar grades |
| `src/services/resources/admin/update-service.ts` | Remover educationLevelId, validar grades |
| `src/services/resources/admin/list-service.ts` | Alterar JOIN para buscar via grades |
| `src/services/resources/catalog/list-service.ts` | Alterar SQL para JOIN via resource_grade |
| `src/services/resources/catalog/meta-service.ts` | Verificar se afetado |
| `src/services/resources/catalog/count-service.ts` | Alterar SQL |
| `src/services/resources/catalog/summary-service.ts` | Alterar agregação |

### 5.3 API Routes (10 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `src/app/api/v1/admin/resources/route.ts` | Atualizar criação/listagem |
| `src/app/api/v1/admin/resources/[id]/route.ts` | Atualizar GET/PUT (inclui educationLevel) |
| `src/app/api/v1/resources/route.ts` | Atualizar filtros e JOIN |
| `src/app/api/v1/resources/[id]/route.ts` | Atualizar exibição educationLevel |
| `src/app/api/v1/resources/counts/route.ts` | Atualizar filtro educationLevel |
| `src/app/api/v1/resources/summary/route.ts` | Atualizar agregação |
| `src/app/api/v1/subjects/route.ts` | Manter - já usa GradeSubject |
| `src/app/api/v1/grades/route.ts` | Verificar |
| `src/app/api/v1/education-levels/route.ts` | Verificar |
| `src/app/api/v1/lesson-plans/refine-theme/route.ts` | Verificar se usa educationLevel de Resource |

### 5.4 Componentes Admin (8 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `src/app/admin/resources/page.tsx` | Atualizar filtros |
| `src/app/admin/resources/[id]/edit/page.tsx` | Atualizar interface |
| `src/components/admin/resources/edit/resource-details-form.tsx` | Redesenhar form com cascata |
| `src/components/admin/resources/resource-dialog.tsx` | Verificar |
| `src/components/client/resources/resource-create-drawer.tsx` | Atualizar para novo fluxo |
| `src/components/client/resources/resource-edit-drawer.tsx` | Atualizar interface |
| `src/components/client/resources/resources-table-view.tsx` | Alterar exibição educationLevel |
| `src/components/client/resources/resources-card-view.tsx` | Alterar exibição |

### 5.5 Componentes Cliente (7 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `src/components/client/resources/ResourceFilters.tsx` | Manter cascata (já funciona) |
| `src/components/client/resources/ResourceCard.tsx` | Exibir educationLevel via grades |
| `src/components/client/resources/ResourceGrid.tsx` | Verificar interface |
| `src/app/(client)/resources/page.tsx` | Verificar filtros |
| `src/app/(client)/resources/[id]/page.tsx` | Atualizar exibição |

### 5.6 Services Adicionais (3 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `src/services/users/user-access.ts` | Atualizar include de educationLevel |
| `src/services/bncc/bncc-service.ts` | Verificar se usa educationLevel de Resource |
| `src/services/lesson-plans/generate-content.ts` | Verificar se afetado |

### 5.7 Community/Lesson Plans (4 arquivos - verificar impacto)

| Arquivo | Impacto |
|---------|---------|
| `src/components/client/community/create-request-drawer.tsx` | Usa educationLevelId separado - **não afetado** |
| `src/components/client/lesson-plans/create-plan-drawer.tsx` | Verificar |
| `src/services/community/request-service.ts` | Usa educationLevelId próprio - **não afetado** |

---

## 6. UX Atualizada

### 6.1 Fluxo de Criação (Admin)

```
┌──────────────────────────────────────────────────────────────┐
│                    CRIAR NOVO RECURSO                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Título do Recurso *                                         │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Ex: Introdução ao Estudo dos Gases                  │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  1. Selecione os Anos/Séries *                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ [Dropdown agrupado por EducationLevel]              │     │
│  │                                                     │     │
│  │ ── Ensino Fundamental I ──                          │     │
│  │ ☐ 1º Ano   ☐ 2º Ano   ☐ 3º Ano   ☐ 4º Ano  ☐ 5º Ano │     │
│  │                                                     │     │
│  │ ── Ensino Fundamental II ──                         │     │
│  │ ☐ 6º Ano   ☐ 7º Ano   ☐ 8º Ano   ☐ 9º Ano           │     │
│  │                                                     │     │
│  │ ⚠️ Selecione apenas anos da mesma etapa             │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  Etapa Detectada: Ensino Fundamental II ✓                    │
│                                                              │
│  2. Disciplina *                                             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ [Dropdown filtrado por GradeSubject]               │      │
│  │ Matemática, Português, Ciências, História...       │      │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  ☐ Conteúdo Gratuito                                         │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              [ CRIAR RECURSO ]                      │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Filtros (Cliente)

Mantém a cascata atual:
1. Etapa (EducationLevel) → filtra via grades vinculados
2. Ano (Grade) → busca recursos via ResourceGrade
3. Disciplina (Subject) → filtrado por GradeSubject

---

## 7. Queries SQL Atualizadas

### 7.1 Listagem de Resources (Catálogo)

**Antes:**
```sql
SELECT r.*, el.slug AS "educationLevel"
FROM resource r
JOIN education_level el ON r."educationLevelId" = el.id
```

**Depois:**
```sql
SELECT 
  r.*,
  el.slug AS "educationLevel"
FROM resource r
JOIN resource_grade rg ON rg."resourceId" = r.id
JOIN grade g ON g.id = rg."gradeId"
JOIN education_level el ON el.id = g."educationLevelId"
WHERE ...
GROUP BY r.id, el.slug  -- Para evitar duplicatas
```

### 7.2 Filtro por EducationLevel

**Antes:**
```sql
WHERE el.slug = 'ensino-fundamental-1'
```

**Depois:**
```sql
WHERE EXISTS (
  SELECT 1 FROM resource_grade rg
  JOIN grade g ON g.id = rg."gradeId"
  JOIN education_level el ON el.id = g."educationLevelId"
  WHERE rg."resourceId" = r.id AND el.slug = 'ensino-fundamental-1'
)
```

---

## 8. Validações Backend

### 8.1 Criação de Resource

```typescript
async function createResource(input: CreateResourceInput) {
  const { title, grades, subject } = input;
  
  // RN-01: Grades obrigatório
  if (!grades || grades.length === 0) {
    throw new Error('Pelo menos um ano/série deve ser selecionado');
  }
  
  // RN-02: Todos grades do mesmo EducationLevel
  const gradeRecords = await prisma.grade.findMany({
    where: { slug: { in: grades } },
    include: { educationLevel: true }
  });
  
  const educationLevelIds = new Set(gradeRecords.map(g => g.educationLevelId));
  if (educationLevelIds.size > 1) {
    throw new Error('Todos os anos devem pertencer à mesma etapa de ensino');
  }
  
  // RN-03: Subject válido para pelo menos 1 grade
  const validSubject = await prisma.gradeSubject.findFirst({
    where: {
      gradeId: { in: gradeRecords.map(g => g.id) },
      subject: { slug: subject }
    }
  });
  
  if (!validSubject) {
    throw new Error('Disciplina não disponível para os anos selecionados');
  }
  
  // Criar resource
  return prisma.resource.create({
    data: {
      title,
      subjectId: validSubject.subjectId,
      grades: {
        create: grades.map(slug => ({
          grade: { connect: { slug } }
        }))
      }
    }
  });
}
```

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Dados inconsistentes existentes | Média | Alto | Script de validação antes da migração |
| Resources sem grades | Alta | Alto | Migração automática baseada em educationLevelId |
| Performance de queries | Baixa | Médio | Índices otimizados já existem |
| Breaking change API | Alta | Alto | Fase 1 mantém compatibilidade |

---

## 10. Cronograma Sugerido

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| **Fase 1** | Schema update (nullable), validações | 4h |
| **Fase 2** | Migração de dados, testes | 2h |
| **Fase 3** | Atualizar services backend | 6h |
| **Fase 4** | Atualizar APIs | 4h |
| **Fase 5** | Atualizar UI Admin | 6h |
| **Fase 6** | Atualizar UI Cliente | 4h |
| **Fase 7** | Testes e validação | 4h |
| **Fase 8** | Remoção do campo legado | 2h |
| **Total** | | **~32h** |

---

## 11. Decisão

**Opções:**

1. ✅ **Prosseguir com refatoração completa** (recomendado)
2. ⚠️ **Refatoração parcial** (manter educationLevelId, adicionar validação)
3. ❌ **Manter modelo atual** (apenas corrigir UI)

---

## 12. Checklist de Implementação

### 12.1 Pre-requisitos
- [ ] Backup do banco de dados
- [ ] Identificar resources sem grades
- [ ] Validar dados existentes

### 12.2 Schema
- [ ] Criar migration para nullable
- [ ] Executar script de migração de dados
- [ ] Validar integridade
- [ ] Criar migration para remoção

### 12.3 Backend
- [ ] Atualizar create-service.ts
- [ ] Atualizar update-service.ts  
- [ ] Atualizar list-service.ts (admin)
- [ ] Atualizar list-service.ts (catalog)
- [ ] Atualizar count-service.ts
- [ ] Atualizar APIs

### 12.4 Frontend Admin
- [ ] Atualizar resource-details-form.tsx
- [ ] Atualizar resource-create-drawer.tsx
- [ ] Atualizar page.tsx (listagem)
- [ ] Atualizar table-view e card-view

### 12.5 Frontend Cliente
- [ ] Verificar ResourceFilters.tsx
- [ ] Atualizar ResourceCard.tsx
- [ ] Testar filtros

### 12.6 Testes
- [ ] Testes de criação com validações
- [ ] Testes de listagem com filtros
- [ ] Testes de edição
- [ ] Testes de UI

---

**Aprovação:**

| Papel | Nome | Data | Status |
|-------|------|------|--------|
| Tech Lead | | | Pendente |
| DBA | | | Revisado ✓ |
| Product | | | Pendente |
