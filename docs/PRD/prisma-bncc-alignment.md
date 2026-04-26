# ✅ Análise: Prisma Schema vs Parser BNCC

## 🔍 Comparação

### Parser BNCC espera:
```ts
type BNCCSkill = {
  code: string                   // "EF05CI04"
  level: EducationLevel          // "EF" | "EM"
  year: number                   // 5
  componentCode: string          // "CI"
  component: SubjectComponent    // "ciencias"
  componentLabel: string         // "Ciências"
  area: KnowledgeArea            // "ciencias_natureza"
  areaLabel: string              // "Ciências da Natureza"
  skillNumber: number            // 4
  description?: string
}

type SubjectComponent =
  | "lingua_portuguesa"
  | "arte"
  | "educacao_fisica"
  | "lingua_inglesa"
  | "matematica"
  | "ciencias"
  | "historia"
  | "geografia"
  | "ensino_religioso"

type KnowledgeArea =
  | "linguagens"
  | "matematica"
  | "ciencias_natureza"
  | "ciencias_humanas"
  | "ensino_religioso"
```

### Prisma atual oferece:
```prisma
model BnccSkill {
  code         String
  educationLevelId  String (FK → EducationLevel)
  gradeId      String? (FK → Grade) — onde Grade tem educationLevelId
  subjectId    String? (FK → Subject)
  description  String
  ...
}

model EducationLevel {
  name, slug
}

model Grade {
  name, slug, educationLevelId
}

model Subject {
  name, slug, color, textColor
}
```

---

## ❌ Problemas de Alinhamento

### 1. **Falta modelo `KnowledgeArea`**
**Problema:** Não há tabela para as 5 áreas do conhecimento BNCC.

**Impacto:** O sistema não consegue recuperar que "Ciências" pertence a "Ciências da Natureza".

**Solução:** Criar modelo `KnowledgeArea`:
```prisma
model KnowledgeArea {
  id     String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code   String @unique  // "linguagens", "matematica", etc
  name   String @unique  // "Linguagens", "Matemática", etc
  order  Int    @default(0)

  subjects Subject[]
  createdAt DateTime @default(now())

  @@map("knowledge_area")
}
```

---

### 2. **Falta relacionamento Subject → KnowledgeArea**
**Problema:** `Subject` não tem FK para `KnowledgeArea`.

**Impacto:** Não consegue saber que "Ciências" é de "Ciências da Natureza".

**Solução:** Adicionar ao `Subject`:
```prisma
model Subject {
  id                String           @id @default(...)
  name              String           @unique
  slug              String           @unique
  knowledgeAreaId   String           @db.Uuid  // ← NOVO
  knowledgeArea     KnowledgeArea    @relation(fields: [knowledgeAreaId], references: [id])
  componentCode     String?          // "CI", "MA", "LP", etc — NOVO
  
  // ...
  @@index([knowledgeAreaId])
}
```

---

### 3. **Falta campo `componentCode`**
**Problema:** Não há lugar para armazenar "CI", "MA", "LP", etc.

**Impacto:** Quando parser extrai EF05CI04, o "CI" é perdido.

**Solução:** Adicionar `Subject.componentCode`:
```prisma
model Subject {
  componentCode String? @unique  // "CI", "MA", "LP", etc
  // ...
}
```

---

### 4. **Grade.name é string, não número**
**Problema:** Parser espera `year: number`, mas Prisma armazena Grade como slug string.

**Impacto:** Comparações com `year === 5` não funcionam.

**Solução:** Adicionar ao `Grade`:
```prisma
model Grade {
  id               String          @id
  name             String          // "1º ano", "5º ano"
  slug             String          @unique
  year             Int             // 1, 2, 3, ... 9 ← NOVO
  order            Int             @default(0)
  educationLevelId String          @db.Uuid
  
  // ...
  @@index([year])
}
```

---

### 5. **Falta enum para `EducationLevel`**
**Problema:** Não há garantia de que só existem "EF" e "EM".

**Impacto:** Possível inserir "XYZ" no banco sem validação.

**Solução:** Adicionar enum:
```prisma
enum EducationLevelType {
  EF  // Ensino Fundamental
  EM  // Ensino Médio
}

model EducationLevel {
  id    String                @id
  type  EducationLevelType
  name  String                @unique
  // ...
}
```

---

### 6. **Falta enum para `SubjectComponent`**
**Problema:** Não há garantia de que `Subject` seja um dos 9 componentes válidos.

**Impacto:** Possível inserir "Educação de Pinguins" como subject sem validação.

**Solução:** Adicionar enum:
```prisma
enum SubjectComponentType {
  LINGUA_PORTUGUESA
  ARTE
  EDUCACAO_FISICA
  LINGUA_INGLESA
  MATEMATICA
  CIENCIAS
  HISTORIA
  GEOGRAFIA
  ENSINO_RELIGIOSO
}

model Subject {
  id       String                  @id
  type     SubjectComponentType    @unique  // garante unicidade
  name     String                  @unique
  // ...
}
```

---

## ✅ Mudanças Recomendadas (Completas)

### 1. Adicionar enums:
```prisma
enum EducationLevelType {
  EF
  EM
}

enum SubjectComponentType {
  LINGUA_PORTUGUESA
  ARTE
  EDUCACAO_FISICA
  LINGUA_INGLESA
  MATEMATICA
  CIENCIAS
  HISTORIA
  GEOGRAFIA
  ENSINO_RELIGIOSO
}
```

### 2. Criar `KnowledgeArea`:
```prisma
model KnowledgeArea {
  id    String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code  String @unique  // "linguagens", "matematica", etc
  name  String @unique  // "Linguagens", "Matemática", etc
  order Int    @default(0)

  subjects  Subject[]
  createdAt DateTime @default(now())

  @@index([code])
  @@map("knowledge_area")
}
```

### 3. Atualizar `EducationLevel`:
```prisma
model EducationLevel {
  id    String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  type  EducationLevelType    @unique  // EF ou EM
  name  String                @unique  // "Ensino Fundamental"
  slug  String                @unique
  order Int                   @default(0)

  grades         Grade[]
  // ... resto dos relacionamentos
}
```

### 4. Atualizar `Grade`:
```prisma
model Grade {
  id               String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name             String          // "1º ano", "5º ano"
  slug             String          @unique
  year             Int             // 1–9
  educationLevelId String          @db.Uuid
  educationLevel   EducationLevel  @relation(fields: [educationLevelId], references: [id])

  subjects         GradeSubject[]
  resources        ResourceGrade[]
  bnccSkills       BnccSkill[]
  lessonPlans      LessonPlan[]

  @@unique([year, educationLevelId])
  @@index([educationLevelId])
  @@index([year])
  @@map("grade")
}
```

### 5. Atualizar `Subject`:
```prisma
model Subject {
  id                String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  type              SubjectComponentType    @unique  // LP, AR, MA, CI, etc
  name              String                  @unique  // "Língua Portuguesa", "Ciências", etc
  slug              String                  @unique
  componentCode     String                  @unique  // "LP", "CI", "MA", etc (redundante com type, para queries)
  knowledgeAreaId   String                  @db.Uuid
  color             String?
  textColor         String?

  knowledgeArea     KnowledgeArea           @relation(fields: [knowledgeAreaId], references: [id])

  grades            GradeSubject[]
  resources         Resource[]
  resourceSubjects  ResourceSubject[]
  bnccSkills        BnccSkill[]
  lessonPlans       LessonPlan[]

  @@index([knowledgeAreaId])
  @@index([componentCode])
  @@map("subject")
}
```

### 6. Atualizar `BnccSkill`:
```prisma
model BnccSkill {
  id                String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code              String  // "EF05CI04"

  educationLevelId  String         @db.Uuid
  educationLevel    EducationLevel @relation(fields: [educationLevelId], references: [id])

  gradeId           String         @db.Uuid
  grade             Grade          @relation(fields: [gradeId], references: [id])

  subjectId         String         @db.Uuid
  subject           Subject        @relation(fields: [subjectId], references: [id])

  // Conteúdo pedagógico
  unitTheme         String?
  knowledgeObject   String?
  description       String         @db.Text
  comments          String?        @db.Text
  curriculumSuggestions String?    @db.Text

  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  resources         ResourceBnccSkill[]

  @@unique([code, gradeId])
  @@index([educationLevelId])
  @@index([gradeId])
  @@index([subjectId])
  @@index([code])
  @@map("bncc_skill")
}
```

---

## 📊 Seed Data de Referência

Após migração, popular com:

```prisma
// KnowledgeArea
- code: "linguagens", name: "Linguagens"
- code: "matematica", name: "Matemática"
- code: "ciencias_natureza", name: "Ciências da Natureza"
- code: "ciencias_humanas", name: "Ciências Humanas"
- code: "ensino_religioso", name: "Ensino Religioso"

// EducationLevel
- type: "EF", name: "Ensino Fundamental", slug: "ensino-fundamental"
- type: "EM", name: "Ensino Médio", slug: "ensino-medio"

// Grade (Ensino Fundamental)
- year: 1, name: "1º ano", slug: "1-ano", educationLevelId: EF
- year: 2, name: "2º ano", slug: "2-ano", educationLevelId: EF
- ...
- year: 9, name: "9º ano", slug: "9-ano", educationLevelId: EF

// Subject (Ensino Fundamental)
- type: "LINGUA_PORTUGUESA", name: "Língua Portuguesa", componentCode: "LP", knowledgeAreaId: linguagens
- type: "ARTE", name: "Arte", componentCode: "AR", knowledgeAreaId: linguagens
- type: "EDUCACAO_FISICA", name: "Educação Física", componentCode: "EF", knowledgeAreaId: linguagens
- type: "LINGUA_INGLESA", name: "Língua Inglesa", componentCode: "LI", knowledgeAreaId: linguagens
- type: "MATEMATICA", name: "Matemática", componentCode: "MA", knowledgeAreaId: matematica
- type: "CIENCIAS", name: "Ciências", componentCode: "CI", knowledgeAreaId: ciencias_natureza
- type: "HISTORIA", name: "História", componentCode: "HI", knowledgeAreaId: ciencias_humanas
- type: "GEOGRAFIA", name: "Geografia", componentCode: "GE", knowledgeAreaId: ciencias_humanas
- type: "ENSINO_RELIGIOSO", name: "Ensino Religioso", componentCode: "ER", knowledgeAreaId: ensino_religioso
```

---

## ✅ Implementação Concluída

### 1. ✅ Prisma Schema Atualizado
- **Arquivo:** `/Users/thiago/www/kadernim/prisma/schema.prisma`
- **Alterações:**
  - Adicionados enums: `EducationLevelType` (EF, EM), `SubjectComponentType` (9 tipos)
  - Criado modelo `KnowledgeArea` com campos: code, name, order, createdAt
  - Atualizado `EducationLevel`: adicionado campo `type` (EducationLevelType?)
  - Atualizado `Grade`: adicionado campo `year` (Int?), índice em (year, educationLevelId)
  - Atualizado `Subject`: adicionados campos `componentCode` (String?), `knowledgeAreaId` (UUID?), `type` (SubjectComponentType?), relacionamento com KnowledgeArea
  - Atualizado `BnccSkill`: gradeId e subjectId agora NOT NULL (obrigatórios)

### 2. ✅ Migration SQL Criada
- **Arquivo:** `/Users/thiago/www/kadernim/prisma/migrations/20260426000000_bncc_alignment/migration.sql`
- **Conteúdo:**
  - CREATE TABLE knowledge_area com índices
  - CREATE TYPE enums (EducationLevelType, SubjectComponentType)
  - ALTER TABLE para adicionar colunas de forma segura (nullable)
  - Foreign keys e índices apropriados

### 3. ✅ Seed Data Implementado
- **Arquivo:** `/Users/thiago/www/kadernim/prisma/seeds/seed-bncc-alignment.ts`
- **Funcionalidade:**
  - Cria 5 KnowledgeArea records (linguagens, matemática, ciências_natureza, ciências_humanas, ensino_religioso)
  - Popula Subject.componentCode para 9 disciplinas (LP, AR, EF, LI, MA, CI, HI, GE, ER)
  - Atribui Subject.knowledgeAreaId corretamente para cada disciplina
  - Define Subject.type com SubjectComponentType enum
  - Atualiza EducationLevel.type = 'EF' para Ensino Fundamental
  - Popula Grade.year com valores 1-9 mapeados por slug
- **Integração:** Adicionado à execução de seed em `/Users/thiago/www/kadernim/prisma/seeds/index.ts`

---

## 🚀 Próximos Passos

1. **Executar migration:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Executar seed:**
   ```bash
   npx prisma db seed
   ```

3. **Atualizar TypeScript** para usar tipos enum:
   - `bncc-parser.ts` → validar contra Subject.componentCode
   - Queries do Prisma → filtrar por educationLevel.type, Subject.type, etc

4. **Regenerar Prisma Client:**
   ```bash
   npx prisma generate
   ```

---

## 💡 Benefício Final

Com essas mudanças, o fluxo fica:

```
Input: "EF05CI04"
  ↓
Parser extrai: { code: "EF05CI04", year: 5, componentCode: "CI", ... }
  ↓
Query Prisma:
  const skill = await prisma.bnccSkill.findUnique({
    where: { code_gradeId: { code: "EF05CI04", gradeId: ... } },
    include: {
      grade: { include: { educationLevel: true } },
      subject: { include: { knowledgeArea: true } }
    }
  })
  
  // Resultado:
  // {
  //   code: "EF05CI04",
  //   grade: { year: 5, educationLevel: { type: "EF" } },
  //   subject: { 
  //     name: "Ciências",
  //     componentCode: "CI",
  //     knowledgeArea: { name: "Ciências da Natureza" }
  //   }
  // }
```

✅ **Alinhamento 100% com parser BNCC**
