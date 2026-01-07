# PRD: Refatoração do Schema - BnccSkill com FK + Validações

**Versão:** 3.1  
**Data:** 2026-01-07  
**Status:** Aprovado  
**Autor:** DBA Analysis

---

## 1. Resumo Executivo

Refatoração focada em:

1. **BnccSkill com FK** - usar FK para nossas models (fonte da verdade)
2. **Seed Campos de Experiência** - criar na tabela Subject
3. **Validação de consistência** - grades devem pertencer ao educationLevel
4. **Manter modelo atual** - EducationLevel, Grade, Subject (nomes inalterados)

---

## 2. Modelo de Dados

### 2.1 Estrutura Hierárquica

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOSSO DOMÍNIO (fonte da verdade)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  EducationLevel (Etapa)                                             │
│  ├── id, name, slug, order                                          │
│  │                                                                  │
│  └── grades[] ─────────► Grade (Ano/Série ou Faixa Etária)         │
│                           ├── id, name, slug, order                 │
│                           └── subjects[] ───► Subject               │
│                                               (Disciplina/Campo)    │
│                                               └── id, name, slug    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ FK (nossas models são a fonte da verdade)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DADOS EXTERNOS (MEC/BNCC)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BnccSkill (Habilidade BNCC - importada do TSV)                    │
│  ├── code: String                                                   │
│  ├── educationLevelId: FK ────► EducationLevel                     │
│  ├── gradeId: FK? ────────────► Grade                              │
│  ├── subjectId: FK? ──────────► Subject                            │
│  ├── description: String                                            │
│  └── ...                                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Resource

```
Resource
├── educationLevelId: FK ──► EducationLevel (OBRIGATÓRIO)
├── subjectId: FK ─────────► Subject (OBRIGATÓRIO)
└── grades[]: N:N ─────────► Grade (OPCIONAL - vazio = todos os anos)
```

---

## 3. Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **RN-01** | `educationLevelId` é **obrigatório** |
| **RN-02** | `subjectId` é **obrigatório** |
| **RN-03** | `grades[]` é **opcional** - se vazio, recurso aplica a todos os anos da etapa |
| **RN-04** | Se `grades[]` preenchido, todos devem pertencer ao mesmo `educationLevel` |
| **RN-05** | `subject` deve existir em `GradeSubject` para: os grades selecionados OU todos os grades da etapa (se vazio) |
| **RN-06** | BnccSkill usa FK para EducationLevel, Grade, Subject |

### 3.1 Fluxo de Criação/Edição de Resource

```typescript
async function validateResource(input) {
  const { educationLevelId, grades, subjectId } = input;
  
  // RN-01: educationLevel obrigatório
  if (!educationLevelId) {
    throw new Error('Etapa é obrigatória');
  }
  
  // RN-02: subject obrigatório
  if (!subjectId) {
    throw new Error('Disciplina é obrigatória');
  }
  
  // RN-04: Se grades preenchido, validar que todos pertencem ao educationLevel
  if (grades && grades.length > 0) {
    const gradeRecords = await prisma.grade.findMany({
      where: { slug: { in: grades } }
    });
    
    const invalidGrades = gradeRecords.filter(g => g.educationLevelId !== educationLevelId);
    if (invalidGrades.length > 0) {
      throw new Error('Anos selecionados não pertencem à etapa informada');
    }
    
    // RN-05: Validar subject existe em GradeSubject para os grades
    const validSubject = await prisma.gradeSubject.findFirst({
      where: {
        gradeId: { in: gradeRecords.map(g => g.id) },
        subject: { slug: subjectId }
      }
    });
    
    if (!validSubject) {
      throw new Error('Disciplina não disponível para os anos selecionados');
    }
  } else {
    // RN-05: Grades vazio - validar subject existe para algum grade da etapa
    const validSubject = await prisma.gradeSubject.findFirst({
      where: {
        grade: { educationLevelId },
        subject: { slug: subjectId }
      }
    });
    
    if (!validSubject) {
      throw new Error('Disciplina não disponível para esta etapa');
    }
  }
}
```

---

## 4. Alterações no Schema

### 4.1 BnccSkill (PRINCIPAL MUDANÇA)

**Antes:**
```prisma
model BnccSkill {
  educationLevelSlug String    // ← slug solto
  gradeSlug          String?   // ← slug solto
  subjectSlug        String?   // ← slug solto
  fieldOfExperience  String?   // ← texto do MEC
  ageRange           String?   // ← texto do MEC
}
```

**Depois:**
```prisma
model BnccSkill {
  id          String  @id @default(cuid())
  code        String

  // FK para nossas models (fonte da verdade)
  educationLevelId String
  educationLevel   EducationLevel @relation(fields: [educationLevelId], references: [id])

  gradeId     String?
  grade       Grade? @relation(fields: [gradeId], references: [id])

  subjectId   String?
  subject     Subject? @relation(fields: [subjectId], references: [id])

  // Campos BNCC
  unitTheme             String?
  knowledgeObject       String?
  description           String  @db.Text
  comments              String? @db.Text
  curriculumSuggestions String? @db.Text

  // Full-Text Search
  searchVector Unsupported("tsvector")?
  embedding    Unsupported("vector(1536)")?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([educationLevelId])
  @@index([gradeId])
  @@index([subjectId])
  @@index([code])
  @@index([searchVector], type: Gin)

  @@unique([code, gradeId], name: "code_gradeId")

  @@map("bncc_skill")
}
```

### 4.2 EducationLevel (adicionar relação BnccSkill)

```prisma
model EducationLevel {
  // ... campos existentes
  bnccSkills BnccSkill[]  // ← ADICIONAR
}
```

### 4.3 Grade (adicionar relação BnccSkill)

```prisma
model Grade {
  // ... campos existentes
  bnccSkills BnccSkill[]  // ← ADICIONAR
}
```

### 4.4 Subject (adicionar relação BnccSkill)

```prisma
model Subject {
  // ... campos existentes
  bnccSkills BnccSkill[]  // ← ADICIONAR
}
```

### 4.5 Resource (SEM MUDANÇAS estruturais)

O schema do Resource **permanece igual**:
- `educationLevelId` continua obrigatório
- `grades[]` continua opcional
- `subjectId` continua obrigatório

Apenas adicionamos **validação** no backend.

---

## 5. Seed de Campos de Experiência

Os 5 Campos de Experiência da Educação Infantil serão criados como `Subject`:

```typescript
// Em seed-taxonomy.ts

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

// Vincular aos Grades da EI via GradeSubject
const eiGrades = await prisma.grade.findMany({
  where: { educationLevel: { slug: 'educacao-infantil' } }
})

for (const grade of eiGrades) {
  for (const field of fieldsOfExperience) {
    const subject = await prisma.subject.findUnique({ where: { slug: field.slug } })
    if (subject) {
      await prisma.gradeSubject.upsert({
        where: { gradeId_subjectId: { gradeId: grade.id, subjectId: subject.id } },
        create: { gradeId: grade.id, subjectId: subject.id },
        update: {},
      })
    }
  }
}
```

---

## 6. Migração de Dados

### 6.1 Migrar BnccSkill slugs para FK

```sql
-- Adicionar colunas FK
ALTER TABLE bncc_skill ADD COLUMN "educationLevelId" TEXT;
ALTER TABLE bncc_skill ADD COLUMN "gradeId" TEXT;
ALTER TABLE bncc_skill ADD COLUMN "subjectId" TEXT;

-- Popular FKs a partir dos slugs existentes
UPDATE bncc_skill bs
SET 
  "educationLevelId" = (SELECT id FROM education_level WHERE slug = bs."educationLevelSlug"),
  "gradeId" = (SELECT id FROM grade WHERE slug = bs."gradeSlug"),
  "subjectId" = (SELECT id FROM subject WHERE slug = bs."subjectSlug");

-- Tornar educationLevelId NOT NULL
ALTER TABLE bncc_skill ALTER COLUMN "educationLevelId" SET NOT NULL;

-- Adicionar FK constraints
ALTER TABLE bncc_skill 
  ADD CONSTRAINT bk_education_level_fk FOREIGN KEY ("educationLevelId") REFERENCES education_level(id);
ALTER TABLE bncc_skill 
  ADD CONSTRAINT bk_grade_fk FOREIGN KEY ("gradeId") REFERENCES grade(id);
ALTER TABLE bncc_skill 
  ADD CONSTRAINT bk_subject_fk FOREIGN KEY ("subjectId") REFERENCES subject(id);

-- Criar índices
CREATE INDEX bk_education_level_idx ON bncc_skill("educationLevelId");
CREATE INDEX bk_grade_idx ON bncc_skill("gradeId");
CREATE INDEX bk_subject_idx ON bncc_skill("subjectId");

-- Após validação, remover colunas antigas
ALTER TABLE bncc_skill DROP COLUMN "educationLevelSlug";
ALTER TABLE bncc_skill DROP COLUMN "gradeSlug";
ALTER TABLE bncc_skill DROP COLUMN "subjectSlug";
ALTER TABLE bncc_skill DROP COLUMN "ageRange";
ALTER TABLE bncc_skill DROP COLUMN "fieldOfExperience";
```

---

## 7. Arquivos a Modificar

### 7.1 Schema (1 arquivo)
- `prisma/schema.prisma` - adicionar FK em BnccSkill, relações inversas

### 7.2 Seeds (4 arquivos)
- `prisma/seeds/seed-taxonomy.ts` - adicionar Campos de Experiência
- `prisma/seeds/seed-bncc-infantil.ts` - usar FK em vez de slug
- `prisma/seeds/seed-bncc-fundamental.ts` - usar FK em vez de slug
- `prisma/seeds/seed-resources.ts` - verificar validações

### 7.3 Services (5 arquivos)
- `src/services/resources/admin/create-service.ts` - adicionar validação
- `src/services/resources/admin/update-service.ts` - adicionar validação
- `src/services/bncc/bncc-service.ts` - usar FK em queries

### 7.4 API Routes (3 arquivos)
- `src/app/api/v1/subjects/route.ts` - remover lógica especial de EI (agora são Subjects normais)
- `src/app/api/v1/bncc/skills/route.ts` - usar FK
- `src/app/api/v1/bncc/themes/route.ts` - usar FK

### 7.5 Components (2 arquivos)
- `src/components/admin/resources/edit/resource-details-form.tsx` - adicionar validação frontend
- `src/components/client/resources/resource-create-drawer.tsx` - adicionar validação frontend

**Total: ~15 arquivos** (muito menos que antes!)

---

## 8. Frontend - Labels Dinâmicos

No frontend, baseado no `educationLevel` selecionado:

```tsx
function getSubjectLabel(educationLevelSlug: string) {
  if (educationLevelSlug === 'educacao-infantil') {
    return 'Campo de Experiência';
  }
  return 'Componente Curricular';
}

function getGradeLabel(educationLevelSlug: string) {
  if (educationLevelSlug === 'educacao-infantil') {
    return 'Faixa Etária';
  }
  return 'Ano/Série';
}
```

---

## 9. Cronograma

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Schema + Migration | 2h |
| 2 | Seeds | 2h |
| 3 | Services + Validações | 3h |
| 4 | API Routes | 2h |
| 5 | Components (validação) | 2h |
| 6 | Testes | 2h |
| **Total** | | **~13h** |

---

## 10. Checklist

### Schema
- [ ] Atualizar BnccSkill com FK
- [ ] Adicionar relações inversas em EducationLevel, Grade, Subject
- [ ] Criar migration

### Dados
- [ ] Migrar BnccSkill slugs para FK
- [ ] Remover colunas antigas
- [ ] Seed Campos de Experiência

### Backend
- [ ] Adicionar validação em create-service
- [ ] Adicionar validação em update-service
- [ ] Atualizar bncc-service
- [ ] Atualizar /api/v1/subjects (remover lógica EI especial)
- [ ] Atualizar /api/v1/bncc/*

### Frontend
- [ ] Labels dinâmicos (Componente/Campo, Ano/Faixa)
- [ ] Validação no form

### Seeds
- [ ] Adicionar Campos de Experiência
- [ ] Atualizar seed-bncc-*.ts
- [ ] Testar seed completo

---

**Status:** Pronto para implementação.
