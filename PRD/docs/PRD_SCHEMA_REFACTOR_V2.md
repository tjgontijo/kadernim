# PRD: Refatoração Completa do Schema - Nomenclatura BNCC + Simplificação

**Versão:** 2.0  
**Data:** 2026-01-07  
**Status:** Proposto  
**Autor:** DBA Analysis

---

## 1. Resumo Executivo

Este documento propõe uma refatoração completa do modelo de dados para:

1. **Adotar nomenclatura BNCC** para as models principais
2. **Eliminar redundância** na relação Resource ↔ EducationLevel
3. **Corrigir dependência** do BnccSkill (deve usar FK, não slugs)
4. **Unificar Subject** para Componente Curricular + Campo de Experiência

---

## 2. Renaming de Models

### 2.1 Tabela de Mapeamento

| Model Atual | Model Nova | Tabela DB | Justificativa BNCC |
|-------------|------------|-----------|-------------------|
| `EducationLevel` | `Stage` | `stage` | "Etapa" é o termo oficial |
| `Grade` | `SchoolYear` | `school_year` | "Ano/Série" (EF) ou "Faixa Etária" (EI) |
| `Subject` | `Subject` (mantém) | `subject` | Unifica Componente Curricular + Campo de Experiência |
| `GradeSubject` | `SchoolYearSubject` | `school_year_subject` | Segue renaming |
| `ResourceGrade` | `ResourceSchoolYear` | `resource_school_year` | Segue renaming |

### 2.2 Frontend - Labels por Contexto

| Contexto | Label para Subject |
|----------|-------------------|
| Educação Infantil | "Campo de Experiência" |
| Ensino Fundamental I | "Componente Curricular" |
| Ensino Fundamental II | "Componente Curricular" |
| Ensino Médio | "Componente Curricular" |

---

## 3. Novo Schema Prisma

### 3.1 Stage (ex-EducationLevel)

```prisma
model Stage {
  id        String       @id @default(cuid())
  name      String       @unique
  slug      String       @unique
  order     Int          @default(0)

  schoolYears       SchoolYear[]
  communityRequests CommunityRequest[]
  bnccSkills        BnccSkill[]

  @@map("stage")
}
```

### 3.2 SchoolYear (ex-Grade)

```prisma
model SchoolYear {
  id        String  @id @default(cuid())
  name      String
  slug      String  @unique
  order     Int     @default(0)

  stageId   String
  stage     Stage   @relation(fields: [stageId], references: [id])

  subjects          SchoolYearSubject[]
  resources         ResourceSchoolYear[]
  communityRequests CommunityRequest[]
  bnccSkills        BnccSkill[]

  @@index([stageId])
  @@map("school_year")
}
```

### 3.3 Subject (mantém nome, unifica conceitos)

```prisma
model Subject {
  id        String  @id @default(cuid())
  name      String  @unique
  slug      String  @unique

  schoolYears       SchoolYearSubject[]
  resources         Resource[]
  communityRequests CommunityRequest[]
  bnccSkills        BnccSkill[]

  @@map("subject")
}
```

### 3.4 SchoolYearSubject (ex-GradeSubject)

```prisma
model SchoolYearSubject {
  id           String     @id @default(cuid())

  schoolYearId String
  subjectId    String

  schoolYear   SchoolYear @relation(fields: [schoolYearId], references: [id], onDelete: Cascade)
  subject      Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([schoolYearId, subjectId])
  @@index([schoolYearId])
  @@index([subjectId])
  @@map("school_year_subject")
}
```

### 3.5 Resource (REFATORADO)

```prisma
model Resource {
  id          String   @id @default(cuid())
  title       String
  description String?

  // REMOVIDO: stageId (era educationLevelId) - agora derivado de schoolYears
  
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])

  externalId  Int      @unique
  isFree      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  images        ResourceImage[]
  files         ResourceFile[]
  videos        ResourceVideo[]
  accessEntries ResourceUserAccess[]
  schoolYears   ResourceSchoolYear[]  // OBRIGATÓRIO (mínimo 1)

  originRequestId String?            @unique
  originRequest   CommunityRequest?  @relation(fields: [originRequestId], references: [id])

  @@index([subjectId])
  @@index([title, id])
  @@map("resource")
}
```

### 3.6 ResourceSchoolYear (ex-ResourceGrade)

```prisma
model ResourceSchoolYear {
  id           String     @id @default(cuid())

  resourceId   String
  schoolYearId String

  resource     Resource   @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  schoolYear   SchoolYear @relation(fields: [schoolYearId], references: [id], onDelete: Cascade)

  @@unique([resourceId, schoolYearId])
  @@index([resourceId])
  @@index([schoolYearId])
  @@map("resource_school_year")
}
```

### 3.7 BnccSkill (REFATORADO - com FK)

```prisma
model BnccSkill {
  id          String  @id @default(cuid())
  code        String

  // FK para nossas models (fonte da verdade)
  stageId     String
  stage       Stage   @relation(fields: [stageId], references: [id])

  schoolYearId String?
  schoolYear   SchoolYear? @relation(fields: [schoolYearId], references: [id])

  subjectId   String?
  subject     Subject? @relation(fields: [subjectId], references: [id])

  // Campos específicos BNCC
  unitTheme           String?
  knowledgeObject     String?
  description         String  @db.Text
  comments            String? @db.Text
  curriculumSuggestions String? @db.Text

  // Full-Text Search
  searchVector Unsupported("tsvector")?
  embedding    Unsupported("vector(1536)")?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([stageId])
  @@index([schoolYearId])
  @@index([subjectId])
  @@index([code])
  @@index([searchVector], type: Gin)

  @@unique([code, schoolYearId], name: "code_schoolYearId")

  @@map("bncc_skill")
}
```

---

## 4. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **RN-01** | `Resource.schoolYears` é obrigatório com mínimo 1 item |
| **RN-02** | Todos os schoolYears devem pertencer à **mesma Stage** |
| **RN-03** | Subject deve existir em `SchoolYearSubject` para pelo menos 1 dos schoolYears |
| **RN-04** | Stage é derivado: `resource.schoolYears[0].schoolYear.stage` |
| **RN-05** | BnccSkill usa FK para Stage, SchoolYear, Subject |

---

## 5. Migração de Dados

### 5.1 Renaming de Tabelas

```sql
-- Fase 1: Renomear tabelas
ALTER TABLE education_level RENAME TO stage;
ALTER TABLE grade RENAME TO school_year;
ALTER TABLE grade_subject RENAME TO school_year_subject;
ALTER TABLE resource_grade RENAME TO resource_school_year;

-- Fase 2: Renomear colunas FK
ALTER TABLE school_year RENAME COLUMN "educationLevelId" TO "stageId";
ALTER TABLE school_year_subject RENAME COLUMN "gradeId" TO "schoolYearId";
ALTER TABLE resource_school_year RENAME COLUMN "gradeId" TO "schoolYearId";
```

### 5.2 Popular schoolYears vazios em Resources

```sql
-- Resources sem schoolYears: criar vínculo com TODOS os anos da stage
INSERT INTO resource_school_year (id, "resourceId", "schoolYearId")
SELECT 
  gen_random_uuid(),
  r.id,
  sy.id
FROM resource r
JOIN school_year sy ON sy."stageId" = r."stageId"
WHERE NOT EXISTS (
  SELECT 1 FROM resource_school_year rsy WHERE rsy."resourceId" = r.id
);
```

### 5.3 Migrar BnccSkill slugs para FK

```sql
-- Atualizar BnccSkill para usar FK
UPDATE bncc_skill bs
SET 
  "stageId" = (SELECT id FROM stage WHERE slug = bs."educationLevelSlug"),
  "schoolYearId" = (SELECT id FROM school_year WHERE slug = bs."gradeSlug"),
  "subjectId" = (SELECT id FROM subject WHERE slug = bs."subjectSlug");

-- Após validação, remover colunas de slug
ALTER TABLE bncc_skill DROP COLUMN "educationLevelSlug";
ALTER TABLE bncc_skill DROP COLUMN "gradeSlug";
ALTER TABLE bncc_skill DROP COLUMN "subjectSlug";
ALTER TABLE bncc_skill DROP COLUMN "ageRange";
ALTER TABLE bncc_skill DROP COLUMN "fieldOfExperience";
```

### 5.4 Remover stageId de Resource

```sql
-- Após confirmar que todos resources têm schoolYears
ALTER TABLE resource DROP COLUMN "stageId";
```

---

## 6. Seed de Campos de Experiência

Os 5 Campos de Experiência da Educação Infantil serão criados como `Subject`:

```typescript
const fieldsOfExperience = [
  { name: 'O eu, o outro e o nós', slug: 'eu-outro-nos' },
  { name: 'Corpo, gestos e movimentos', slug: 'corpo-gestos-movimentos' },
  { name: 'Traços, sons, cores e formas', slug: 'tracos-sons-cores-formas' },
  { name: 'Escuta, fala, pensamento e imaginação', slug: 'escuta-fala-pensamento' },
  { name: 'Espaços, tempos, quantidades, relações e transformações', slug: 'espacos-tempos-quantidades' },
]

// Criar como Subject
for (const field of fieldsOfExperience) {
  await prisma.subject.upsert({
    where: { slug: field.slug },
    create: field,
    update: { name: field.name },
  })
}

// Vincular aos SchoolYears da EI via SchoolYearSubject
const eiSchoolYears = await prisma.schoolYear.findMany({
  where: { stage: { slug: 'educacao-infantil' } }
})

for (const sy of eiSchoolYears) {
  for (const field of fieldsOfExperience) {
    const subject = await prisma.subject.findUnique({ where: { slug: field.slug } })
    await prisma.schoolYearSubject.upsert({
      where: { schoolYearId_subjectId: { schoolYearId: sy.id, subjectId: subject.id } },
      create: { schoolYearId: sy.id, subjectId: subject.id },
      update: {},
    })
  }
}
```

---

## 7. Arquivos a Modificar

### 7.1 Schema e Migrations (2 arquivos)
- `prisma/schema.prisma`
- Nova migration

### 7.2 Seeds (6 arquivos)
- `prisma/seeds/index.ts`
- `prisma/seeds/seed-taxonomy.ts`
- `prisma/seeds/seed-bncc-infantil.ts`
- `prisma/seeds/seed-bncc-fundamental.ts`
- `prisma/seeds/seed-resources.ts`
- `prisma/seeds/seed-resource-files.ts`

### 7.3 Types/Schemas (6 arquivos)
- `src/types/request.ts`
- `src/lib/schemas/resource.ts`
- `src/lib/schemas/admin/resources.ts`
- `src/lib/schemas/community.ts`
- `src/lib/schemas/lesson-plan.ts`

### 7.4 Services (~15 arquivos)
- `src/services/resources/admin/create-service.ts`
- `src/services/resources/admin/update-service.ts`
- `src/services/resources/admin/list-service.ts`
- `src/services/resources/catalog/list-service.ts`
- `src/services/resources/catalog/count-service.ts`
- `src/services/resources/catalog/meta-service.ts`
- `src/services/resources/catalog/summary-service.ts`
- `src/services/community/request-service.ts`
- `src/services/community/refine-description.ts`
- `src/services/lesson-plans/generate-content.ts`
- `src/services/bncc/bncc-service.ts`
- `src/services/users/user-access.ts`

### 7.5 API Routes (~15 arquivos)
- `src/app/api/v1/education-levels/route.ts` → renomear para `/stages`
- `src/app/api/v1/grades/route.ts` → renomear para `/school-years`
- `src/app/api/v1/subjects/route.ts`
- `src/app/api/v1/resources/route.ts`
- `src/app/api/v1/resources/[id]/route.ts`
- `src/app/api/v1/resources/counts/route.ts`
- `src/app/api/v1/resources/summary/route.ts`
- `src/app/api/v1/admin/resources/route.ts`
- `src/app/api/v1/admin/resources/[id]/route.ts`
- `src/app/api/v1/community/requests/route.ts`
- `src/app/api/v1/community/refine-request/route.ts`
- `src/app/api/v1/lesson-plans/route.ts`
- `src/app/api/v1/lesson-plans/refine-theme/route.ts`
- `src/app/api/v1/bncc/skills/route.ts`
- `src/app/api/v1/bncc/themes/route.ts`

### 7.6 Hooks (~5 arquivos)
- `src/hooks/use-resource-meta.ts`
- `src/hooks/use-admin-resources.ts`
- `src/hooks/use-admin-users.ts`
- `src/hooks/use-resources-summary-query.ts`

### 7.7 Components (~30 arquivos)
- `src/components/client/resources/*` (10 arquivos)
- `src/components/admin/resources/*` (5 arquivos)
- `src/components/client/community/*` (8 arquivos)
- `src/components/client/lesson-plans/*` (10 arquivos)

### 7.8 Pages (~8 arquivos)
- `src/app/(client)/resources/page.tsx`
- `src/app/(client)/resources/[id]/page.tsx`
- `src/app/(client)/community/page.tsx`
- `src/app/(client)/lesson-plans/page.tsx`
- `src/app/admin/resources/page.tsx`
- `src/app/admin/resources/[id]/edit/page.tsx`

---

## 8. Cronograma

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Schema Prisma + Migration | 3h |
| 2 | Seeds | 3h |
| 3 | Types/Schemas | 2h |
| 4 | Services | 6h |
| 5 | API Routes | 5h |
| 6 | Hooks | 2h |
| 7 | Components | 8h |
| 8 | Pages | 3h |
| 9 | Testes | 4h |
| **Total** | | **~36h** |

---

## 9. Checklist

### Pre-requisitos
- [ ] Backup do banco de dados
- [ ] Branch separada para desenvolvimento

### Schema
- [ ] Atualizar schema.prisma com novos nomes
- [ ] Criar migration de renaming
- [ ] Executar migration de dados

### Backend
- [ ] Atualizar todos os services
- [ ] Atualizar todas as APIs
- [ ] Renomear endpoints (/education-levels → /stages, etc)

### Frontend
- [ ] Atualizar hooks
- [ ] Atualizar components
- [ ] Implementar labels dinâmicos (Componente/Campo)
- [ ] Atualizar pages

### Seeds
- [ ] Atualizar seed-taxonomy.ts
- [ ] Adicionar Campos de Experiência
- [ ] Atualizar seed-bncc-*.ts para usar FK
- [ ] Testar seed completo

### Validação
- [ ] Testes de criação de Resource
- [ ] Testes de listagem com filtros
- [ ] Testes de edição
- [ ] Testes de BNCC skills
- [ ] Testes de Lesson Plans
- [ ] Testes de Community Requests

---

## 10. Resumo Visual

```
ANTES:
──────
EducationLevel ← Resource.educationLevelId (redundante)
      │
      └── Grade ←──── ResourceGrade (opcional)
            │
            └── GradeSubject ──► Subject

BnccSkill
├── educationLevelSlug (String)
├── gradeSlug (String)
└── subjectSlug (String)


DEPOIS:
───────
Stage
  │
  └── SchoolYear ←──── ResourceSchoolYear (obrigatório)
          │                        │
          └── SchoolYearSubject    │
                    │              │
                    └──► Subject ◄─┘
                           ▲
                           │
BnccSkill ─────────────────┘ (FK)
├── stageId (FK)
├── schoolYearId (FK)
└── subjectId (FK)
```

---

**Status:** Aguardando aprovação para iniciar implementação.
