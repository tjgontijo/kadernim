# PRD - Banco de Questões Kadernim

## Visão Geral

### Objetivo
Criar um módulo de **Banco de Questões** que permite professoras gerarem e acessarem questões educacionais alinhadas à BNCC, usando IA para geração inicial e construindo progressivamente um banco de dados que reduzirá a dependência de LLM ao longo do tempo.

### Proposta de Valor
- Professoras economizam tempo na elaboração de avaliações
- Questões alinhadas à BNCC com qualidade pedagógica
- Banco de questões cresce organicamente com o uso
- Custo de LLM diminui conforme o banco cresce

---

## Decisões Arquiteturais (Pontos de Atenção)

### 1. Imutabilidade das Questões

**Decisão**: Questões do banco são **imutáveis para o professor**.

- Professor **não edita** questões do banco
- Ao exportar para Word/PDF, pode editar no próprio documento
- Isso preserva integridade do banco e histórico de avaliações
- Simplifica o modelo (sem fork/clone de questões)

### 2. Estrutura do Gabarito

**Decisão**: Gabarito único dentro do `content`, com campo derivado para exportação.

```typescript
// Campo `content` contém o gabarito estruturado por tipo
// Campo `answerSummary` é derivado automaticamente para exibição/exportação

// Exemplo para múltipla escolha:
content: {
  alternatives: [...],
  correctAlternativeId: "B"  // Gabarito aqui
}
answerSummary: "B"  // Derivado automaticamente no save

// Exemplo para V/F:
content: {
  statements: [
    { id: "1", text: "...", isTrue: true },  // Gabarito aqui
    { id: "2", text: "...", isTrue: false }
  ]
}
answerSummary: "1-V, 2-F"  // Derivado automaticamente
```

- Remove redundância
- `answerSummary` é computed field no backend ao salvar
- Usado apenas para listagem/exportação rápida

### 3. Versionamento de Questões

**Decisão**: Questões aprovadas **não são editáveis**.

| Status | Pode Editar? | Ação de Edição |
|--------|--------------|----------------|
| `DRAFT` | ✅ Sim | Edição direta |
| `PENDING_REVIEW` | ✅ Sim | Edição direta (volta para DRAFT) |
| `APPROVED` | ❌ Não | Criar nova questão |
| `REJECTED` | ✅ Sim | Edição direta (volta para DRAFT) |
| `ARCHIVED` | ❌ Não | Desarquivar primeiro |

- Preserva histórico de avaliações que usaram a questão
- Admin pode arquivar e criar nova se precisar corrigir

### 4. Relacionamento com BNCC

**Decisão**: Usar tabela de relacionamento real (como `ResourceBnccSkill`).

A tabela `BnccSkill` já existe com estrutura completa:
- `id`, `code`, `description`, `unitTheme`, `knowledgeObject`, `comments`
- Relacionamentos com `EducationLevel`, `Grade`, `Subject`
- Full-text search com `searchVector`
- Embedding para busca semântica

Criar tabela de relacionamento `QuestionBnccSkill`:
```prisma
model QuestionBnccSkill {
  id          String    @id @default(cuid())
  questionId  String
  question    Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  bnccSkillId String
  bnccSkill   BnccSkill @relation(fields: [bnccSkillId], references: [id])
  isPrimary   Boolean   @default(false)  // Habilidade principal vs complementar

  @@unique([questionId, bnccSkillId])
  @@index([questionId])
  @@index([bnccSkillId])
}
```

Benefícios:
- Queries complexas e analytics facilitados
- Joins eficientes
- Consistência com padrão existente (`ResourceBnccSkill`)

### 5. Deduplicação de Questões

**Decisão**: Hash do enunciado normalizado + tipo para detectar duplicatas.

```typescript
// Ao salvar questão:
const normalizedStatement = statement
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
  .replace(/\s+/g, ' ')              // Normaliza espaços
  .trim()

const contentHash = crypto
  .createHash('sha256')
  .update(`${type}:${normalizedStatement}`)
  .digest('hex')
  .substring(0, 16)  // Primeiros 16 chars suficientes
```

Comportamento:
- Ao gerar com IA, verificar se hash já existe
- Se existir questão APPROVED com mesmo hash: reutilizar
- Se existir DRAFT/REJECTED: sinalizar para revisão
- Armazenar `contentHash` no model para queries rápidas

### 6. Validação por Tipo e Etapa

**Decisão**: Regras duras no backend, validadas com Zod.

```typescript
const QUESTION_RULES = {
  'ensino-fundamental-1': {
    MULTIPLE_CHOICE: { minAlternatives: 4, maxAlternatives: 4 },
    TRUE_FALSE: { maxStatements: 5 },
    FILL_BLANK: { maxBlanks: 3 },
  },
  'ensino-fundamental-2': {
    MULTIPLE_CHOICE: { minAlternatives: 5, maxAlternatives: 5 },
    TRUE_FALSE: { maxStatements: 8 },
    ESSAY: { minRubricCriteria: 2 },
    CALCULATION: { minSteps: 1 },
  },
}
```

- Validação no backend antes de salvar
- IA recebe regras no prompt
- Rejeitar questões fora do padrão

### 7. Salvamento de Questões Geradas

**Decisão**: Salvar automaticamente como `DRAFT`.

Fluxo:
1. Usuário solicita geração
2. IA gera questões
3. Cada questão salva automaticamente com `status: DRAFT`
4. Usuário vê preview
5. Pode descartar (delete) questões indesejadas
6. Questões usadas em avaliação ganham `usageCount++`

Benefícios:
- Não perde dados gerados
- Métricas de geração vs uso
- Fila de revisão tem material

### 8. Contagem de Uso Mensal

**Decisão**: Contar **apenas quando IA gera de fato**.

```typescript
// Incrementar uso APENAS quando:
// 1. Chamou a API da OpenAI
// 2. Geração foi bem-sucedida
// 3. Questões foram salvas

// NÃO incrementar quando:
// - Reutilizou questões existentes do banco
// - Buscou questões aprovadas
// - Geração falhou
```

Implementação:
- `QuestionGenerationUsage.count` += quantidade de questões GERADAS (não reutilizadas)
- Resposta da API indica quantas foram geradas vs reutilizadas
- UI mostra: "3 questões do banco + 2 geradas por IA"

### 9. Exportação Word/PDF

**Decisão**: Versão única com gabarito na última página.

Estrutura do documento exportado:
```
[Cabeçalho: Título, Escola, Data, Aluno]
[Instruções]
[Questões numeradas sem gabarito]
---
[Última página - Gabarito]
1. B
2. V, F, V, F
3. [Resposta esperada]
...
```

Características:
- Snapshot no momento da exportação
- Se questão do banco mudar depois, avaliação antiga não afetada
- Salvar histórico de exportações? **Não no MVP** (complexidade desnecessária)

### 10. Prioridade do MVP

**Decisão**: Fases reordenadas por valor/risco.

```
Fase 1: Fundação (CRUD)
├── Modelos Prisma
├── Admin CRUD completo
└── Listagem cliente (read-only)

Fase 2: Busca e Reutilização
├── Filtros avançados
├── Busca por texto
├── Favoritos
└── Lógica de seleção do banco

Fase 3: Geração com IA
├── Prompts por tipo/etapa
├── Wizard de geração
├── Controle de uso
└── Preview e salvamento

Fase 4: Avaliações
├── Builder de prova
├── Ordenação drag & drop
└── Exportação Word/PDF

Fase 5: Curadoria
├── Fila de revisão
├── Aprovação/Rejeição
└── Auto-promoção

Fase 6: Analytics
├── Dashboard admin
├── Métricas de uso
└── Custo de LLM
```

**Justificativa**:
- Fase 1-2: Valor imediato com questões manuais/importadas
- Fase 3: IA só entra com base sólida
- Fase 4: Avaliações dependem de banco populado
- Fase 5-6: Otimização quando tiver volume

---

## Pesquisa: Tipos de Questões no Ensino Brasileiro

### Educação Infantil
**Não possui avaliações formais.** A avaliação é qualitativa e observacional, focada no desenvolvimento integral da criança. O módulo de questões **não se aplica** à Educação Infantil.

### Ensino Fundamental I (1º ao 5º ano)
| Tipo | Descrição | Uso |
|------|-----------|-----|
| **Múltipla Escolha** | 4 alternativas (padrão SAEB 5º ano) | Alto - Avaliações diagnósticas e somativas |
| **Verdadeiro ou Falso** | Afirmações binárias | Médio - Verificação rápida de conceitos |
| **Completar Lacunas** | Preencher espaços em branco | Médio - Vocabulário e conceitos |
| **Associação/Correspondência** | Relacionar duas colunas | Médio - Relações entre conceitos |
| **Resposta Curta** | 1-2 frases | Baixo - Introdução gradual |

### Ensino Fundamental II (6º ao 9º ano)
| Tipo | Descrição | Uso |
|------|-----------|-----|
| **Múltipla Escolha** | 5 alternativas (padrão SAEB 9º ano) | Alto - Todas as disciplinas |
| **Verdadeiro ou Falso** | Com justificativa opcional | Alto |
| **Dissertativa Curta** | Resposta de 2-5 linhas | Alto - Avalia argumentação |
| **Dissertativa Longa** | Desenvolvimento completo | Médio - Redações e análises |
| **Cálculo/Resolução** | Mostrar desenvolvimento matemático | Alto - Matemática e Ciências |
| **Interpretação de Texto** | Múltipla escolha + dissertativa | Alto - Língua Portuguesa |
| **Análise de Imagem/Gráfico** | Questões sobre representações visuais | Médio |

### Padrões SAEB/Prova Brasil
- **5º ano**: 22 itens por prova, 4 alternativas
- **9º ano**: 26 itens por prova, 5 alternativas
- Matrizes de referência alinhadas à BNCC
- Foco em competências e habilidades (não memorização)

---

## Arquitetura Técnica

### Modelo de Dados (Prisma Schema)

```prisma
// Tipos de questão suportados
enum QuestionType {
  MULTIPLE_CHOICE      // Múltipla escolha
  TRUE_FALSE           // Verdadeiro ou Falso
  FILL_BLANK           // Completar lacunas
  MATCHING             // Associação/Correspondência
  SHORT_ANSWER         // Resposta curta (1-2 frases)
  ESSAY                // Dissertativa
  CALCULATION          // Cálculo com desenvolvimento
}

// Nível de dificuldade
enum DifficultyLevel {
  EASY                 // Fácil
  MEDIUM               // Médio
  HARD                 // Difícil
}

// Status da questão
enum QuestionStatus {
  DRAFT                // Rascunho (gerada por IA, não revisada)
  PENDING_REVIEW       // Aguardando revisão
  APPROVED             // Aprovada para uso
  REJECTED             // Rejeitada
  ARCHIVED             // Arquivada
}

// Origem da questão
enum QuestionOrigin {
  AI_GENERATED         // Gerada por IA
  MANUAL               // Criada manualmente
  IMPORTED             // Importada de fonte externa
}

model Question {
  id                  String            @id @default(cuid())

  // Conteúdo principal
  type                QuestionType
  statement           String            @db.Text    // Enunciado
  supportText         String?           @db.Text    // Texto de apoio (opcional)
  imageUrl            String?                       // Imagem de apoio (Cloudinary)

  // Conteúdo estruturado (JSON) - contém gabarito por tipo
  content             Json              // Alternativas, gabarito estruturado, etc.

  // Gabarito derivado (computed no save, para listagem/export)
  answerSummary       String            @db.Text    // Ex: "B" ou "1-V, 2-F, 3-V"
  explanation         String?           @db.Text    // Explicação pedagógica

  // Deduplicação
  contentHash         String            @db.VarChar(16)  // Hash para detectar duplicatas

  // Taxonomia (usando IDs reais para joins)
  educationLevelId    String
  educationLevel      EducationLevel    @relation(fields: [educationLevelId], references: [id])

  gradeId             String
  grade               Grade             @relation(fields: [gradeId], references: [id])

  subjectId           String
  subject             Subject           @relation(fields: [subjectId], references: [id])

  // BNCC - relacionamento real
  bnccSkills          QuestionBnccSkill[]

  // Metadados
  difficulty          DifficultyLevel   @default(MEDIUM)
  estimatedTime       Int?              // Tempo estimado em minutos
  tags                String[]          // Tags livres para busca

  // Gestão
  status              QuestionStatus    @default(DRAFT)
  origin              QuestionOrigin    @default(AI_GENERATED)

  // Estatísticas de uso
  usageCount          Int               @default(0)
  averageRating       Float?            // Avaliação média (1-5)
  ratingCount         Int               @default(0)

  // Auditoria
  createdById         String?           // Usuário que gerou/criou
  reviewedById        String?           // Usuário que revisou
  reviewedAt          DateTime?
  rejectionReason     String?           @db.Text    // Motivo da rejeição

  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  // Relacionamentos
  createdBy           User?             @relation("QuestionsCreated", fields: [createdById], references: [id])
  reviewedBy          User?             @relation("QuestionsReviewed", fields: [reviewedById], references: [id])
  userQuestions       UserQuestion[]
  assessmentItems     AssessmentItem[]
  questionRatings     QuestionRating[]

  @@unique([contentHash, type])  // Evita duplicatas exatas
  @@index([educationLevelId, gradeId, subjectId])
  @@index([status])
  @@index([type])
  @@index([difficulty])
  @@index([createdAt])
  @@index([contentHash])
  @@map("question")
}

// Relacionamento Question <-> BnccSkill (padrão do projeto)
model QuestionBnccSkill {
  id          String    @id @default(cuid())

  questionId  String
  question    Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  bnccSkillId String
  bnccSkill   BnccSkill @relation(fields: [bnccSkillId], references: [id])

  isPrimary   Boolean   @default(false)  // Habilidade principal vs complementar

  @@unique([questionId, bnccSkillId])
  @@index([questionId])
  @@index([bnccSkillId])
  @@map("question_bncc_skill")
}

// Questões salvas pelo usuário (favoritos)
model UserQuestion {
  id          String    @id @default(cuid())
  userId      String
  questionId  String
  savedAt     DateTime  @default(now())
  notes       String?   @db.Text  // Anotações pessoais

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question    Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([userId])
}

// Avaliações das questões pelos usuários
model QuestionRating {
  id          String    @id @default(cuid())
  userId      String
  questionId  String
  rating      Int       // 1-5
  feedback    String?   // Feedback opcional
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question    Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
  @@index([questionId])
}

// Avaliação/Prova montada pelo usuário
model Assessment {
  id                  String            @id @default(cuid())
  userId              String
  title               String
  description         String?

  // Taxonomia
  educationLevelSlug  String
  gradeSlug           String
  subjectSlug         String

  // Configuração
  totalPoints         Float             @default(10)
  estimatedDuration   Int?              // minutos
  instructions        String?           @db.Text

  // Status
  isPublished         Boolean           @default(false)

  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  user                User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  items               AssessmentItem[]

  @@index([userId])
}

// Itens da avaliação (questões ordenadas)
model AssessmentItem {
  id            String      @id @default(cuid())
  assessmentId  String
  questionId    String
  order         Int         // Ordem na prova
  points        Float       @default(1)  // Pontuação da questão

  assessment    Assessment  @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  question      Question    @relation(fields: [questionId], references: [id])

  @@unique([assessmentId, questionId])
  @@index([assessmentId])
}

// Controle de uso mensal de geração de questões
model QuestionGenerationUsage {
  id          String   @id @default(cuid())
  userId      String
  yearMonth   String   // "2026-01"
  count       Int      @default(0)

  @@unique([userId, yearMonth])
  @@index([userId, yearMonth])
}
```

### Estrutura JSON do Campo `content` por Tipo

```typescript
// MULTIPLE_CHOICE
interface MultipleChoiceContent {
  alternatives: {
    id: string           // "A", "B", "C", "D", "E"
    text: string         // Texto da alternativa
    isCorrect: boolean   // Se é a correta
  }[]
  correctAlternativeId: string  // "B"
}

// TRUE_FALSE
interface TrueFalseContent {
  statements: {
    id: string           // "1", "2", "3"
    text: string         // Afirmação
    isTrue: boolean      // Verdadeiro ou Falso
    justification?: string // Justificativa opcional
  }[]
}

// FILL_BLANK
interface FillBlankContent {
  textWithBlanks: string  // "O Brasil foi descoberto em _____ por _____."
  blanks: {
    id: string            // "1", "2"
    correctAnswers: string[]  // ["1500", "mil e quinhentos"]
    position: number      // Posição no texto
  }[]
}

// MATCHING
interface MatchingContent {
  columnA: {
    id: string
    text: string
  }[]
  columnB: {
    id: string
    text: string
  }[]
  correctPairs: {
    columnAId: string
    columnBId: string
  }[]
}

// SHORT_ANSWER
interface ShortAnswerContent {
  expectedKeywords: string[]     // Palavras-chave esperadas
  sampleAnswer: string           // Resposta modelo
  maxLength?: number             // Limite de caracteres
}

// ESSAY
interface EssayContent {
  rubric: {                      // Rubrica de correção
    criterion: string
    maxPoints: number
    description: string
  }[]
  sampleAnswer?: string
  minWords?: number
  maxWords?: number
}

// CALCULATION
interface CalculationContent {
  steps: {                       // Passos da resolução
    order: number
    description: string
    formula?: string             // LaTeX
    result: string
  }[]
  finalAnswer: string
  unit?: string                  // Unidade de medida
  acceptableVariance?: number    // Margem de erro aceita
}
```

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── (client)/
│   │   └── questions/
│   │       ├── page.tsx                    # Explorar banco de questões
│   │       ├── generate/
│   │       │   └── page.tsx                # Gerar novas questões (wizard)
│   │       ├── saved/
│   │       │   └── page.tsx                # Minhas questões salvas
│   │       ├── assessments/
│   │       │   ├── page.tsx                # Minhas avaliações
│   │       │   ├── create/
│   │       │   │   └── page.tsx            # Criar avaliação
│   │       │   └── [id]/
│   │       │       ├── page.tsx            # Visualizar avaliação
│   │       │       └── edit/
│   │       │           └── page.tsx        # Editar avaliação
│   │       └── [id]/
│   │           └── page.tsx                # Detalhes da questão
│   │
│   ├── admin/
│   │   └── questions/
│   │       ├── page.tsx                    # CRUD de questões
│   │       ├── review/
│   │       │   └── page.tsx                # Fila de revisão
│   │       └── analytics/
│   │           └── page.tsx                # Analytics do banco
│   │
│   └── api/v1/
│       ├── questions/
│       │   ├── route.ts                    # GET (list/search), POST (generate)
│       │   ├── [id]/
│       │   │   └── route.ts                # GET, PUT, DELETE
│       │   ├── generate/
│       │   │   └── route.ts                # POST - Gerar com IA
│       │   ├── saved/
│       │   │   └── route.ts                # GET, POST (salvar), DELETE (remover)
│       │   ├── rate/
│       │   │   └── route.ts                # POST - Avaliar questão
│       │   └── usage/
│       │       └── route.ts                # GET - Uso mensal
│       │
│       ├── assessments/
│       │   ├── route.ts                    # GET (list), POST (create)
│       │   ├── [id]/
│       │   │   ├── route.ts                # GET, PUT, DELETE
│       │   │   ├── items/
│       │   │   │   └── route.ts            # POST (add), DELETE (remove)
│       │   │   └── export/
│       │   │       └── route.ts            # GET - Exportar (Word/PDF)
│       │
│       └── admin/
│           └── questions/
│               ├── route.ts                # GET (list), POST (create manual)
│               ├── [id]/
│               │   └── route.ts            # GET, PUT, DELETE
│               ├── review/
│               │   └── route.ts            # GET (fila), PUT (aprovar/rejeitar)
│               ├── bulk/
│               │   └── route.ts            # POST - Operações em lote
│               └── analytics/
│                   └── route.ts            # GET - Métricas
│
├── components/
│   ├── client/
│   │   └── questions/
│   │       ├── question-card.tsx           # Card de questão na listagem
│   │       ├── question-viewer.tsx         # Visualizador completo
│   │       ├── question-filters.tsx        # Filtros de busca
│   │       ├── generate/
│   │       │   ├── generate-drawer.tsx     # Wizard de geração
│   │       │   ├── step-context.tsx        # Passo 1: Contexto
│   │       │   ├── step-config.tsx         # Passo 2: Configuração
│   │       │   ├── step-review.tsx         # Passo 3: Revisão
│   │       │   └── generated-preview.tsx   # Preview das questões geradas
│   │       ├── assessment/
│   │       │   ├── assessment-builder.tsx  # Construtor de avaliação
│   │       │   ├── question-selector.tsx   # Seletor de questões
│   │       │   ├── assessment-preview.tsx  # Preview da prova
│   │       │   └── drag-question-item.tsx  # Item arrastável
│   │       ├── types/
│   │       │   ├── multiple-choice.tsx     # Renderer múltipla escolha
│   │       │   ├── true-false.tsx          # Renderer V/F
│   │       │   ├── fill-blank.tsx          # Renderer lacunas
│   │       │   ├── matching.tsx            # Renderer associação
│   │       │   ├── short-answer.tsx        # Renderer resposta curta
│   │       │   ├── essay.tsx               # Renderer dissertativa
│   │       │   └── calculation.tsx         # Renderer cálculo
│   │       └── rating-dialog.tsx           # Dialog de avaliação
│   │
│   └── admin/
│       └── questions/
│           ├── question-form.tsx           # Formulário completo
│           ├── review-card.tsx             # Card na fila de revisão
│           ├── bulk-actions.tsx            # Ações em lote
│           └── analytics-charts.tsx        # Gráficos de métricas
│
├── services/
│   └── questions/
│       ├── index.ts                        # Exports
│       ├── search.ts                       # Busca com filtros
│       ├── generate.ts                     # Geração com IA
│       ├── usage.ts                        # Controle de uso
│       ├── rating.ts                       # Avaliações
│       └── assessment.ts                   # Operações de avaliação
│
├── lib/
│   ├── schemas/
│   │   ├── question.ts                     # Schemas de questão
│   │   └── assessment.ts                   # Schemas de avaliação
│   └── ai/
│       └── prompts/
│           └── questions/
│               ├── system-ef1.ts           # Prompt EF1
│               ├── system-ef2.ts           # Prompt EF2
│               └── types/                  # Prompts por tipo de questão
│                   ├── multiple-choice.ts
│                   ├── true-false.ts
│                   └── ...
│
└── hooks/
    ├── use-questions.ts                    # Lista de questões
    ├── use-question.ts                     # Detalhes de uma questão
    ├── use-question-generation.ts          # Hook de geração
    ├── use-saved-questions.ts              # Questões salvas
    ├── use-question-usage.ts               # Uso mensal
    ├── use-assessments.ts                  # Lista de avaliações
    └── use-assessment.ts                   # Detalhes de avaliação
```

---

## Fluxos de Usuário

### 1. Explorar Banco de Questões (Cliente)

```
/questions
├── Filtros: Série, Disciplina, Habilidade BNCC, Tipo, Dificuldade
├── Busca por texto no enunciado
├── Grid de cards de questões
│   └── Cada card mostra: tipo, enunciado resumido, série, disciplina, dificuldade
├── Paginação
└── Ações por questão:
    ├── Ver detalhes (modal ou página)
    ├── Salvar nos favoritos
    ├── Adicionar a uma avaliação
    └── Avaliar (1-5 estrelas)
```

### 2. Gerar Novas Questões (Cliente - Wizard)

```
/questions/generate (ou drawer)

Passo 1: Contexto
├── Selecionar Etapa (Fundamental 1 ou 2)
├── Selecionar Série
├── Selecionar Disciplina
└── Selecionar Habilidades BNCC (1-3)

Passo 2: Configuração
├── Tipo de questão (múltipla escolha, V/F, etc.)
├── Quantidade (1-10 questões)
├── Dificuldade (fácil, médio, difícil)
├── Tema/Contexto opcional (ex: "situações do cotidiano")
└── Preferências adicionais

Passo 3: Revisão
├── Confirmar seleções
├── Ver uso restante do mês
└── Gerar questões

Passo 4: Resultado
├── Preview das questões geradas
├── Para cada questão:
│   ├── Salvar no banco (status: DRAFT)
│   ├── Editar antes de salvar
│   ├── Descartar
│   └── Adicionar a uma avaliação
└── Solicitar regeneração se insatisfeito
```

### 3. Montar Avaliação (Cliente)

```
/questions/assessments/create

├── Informações básicas
│   ├── Título
│   ├── Série, Disciplina
│   └── Instruções
│
├── Seleção de questões
│   ├── Buscar no banco (mesmos filtros)
│   ├── Adicionar questões dos favoritos
│   ├── Gerar novas questões (inline)
│   └── Arrastar para ordenar
│
├── Configuração
│   ├── Pontuação por questão
│   ├── Tempo estimado
│   └── Preview em tempo real
│
└── Ações
    ├── Salvar rascunho
    ├── Exportar Word
    ├── Exportar PDF
    └── Publicar (se feature futura)
```

### 4. Administração de Questões (Admin)

```
/admin/questions
├── Listagem CRUD padrão
├── Filtros: Status, Origem, Tipo, Série, Disciplina
├── Ações em lote:
│   ├── Aprovar selecionadas
│   ├── Rejeitar selecionadas
│   └── Arquivar selecionadas
└── Formulário de edição completo

/admin/questions/review
├── Fila de questões pendentes (DRAFT + PENDING_REVIEW)
├── Interface de revisão rápida
│   ├── Ver questão completa
│   ├── Editar inline
│   ├── Aprovar
│   ├── Rejeitar (com motivo)
│   └── Próxima
└── Métricas: questões revisadas hoje, pendentes, etc.

/admin/questions/analytics
├── Total de questões por status
├── Questões por tipo, série, disciplina
├── Questões mais usadas
├── Taxa de aprovação
├── Uso de LLM (tokens, custo estimado)
└── Crescimento do banco ao longo do tempo
```

---

## Lógica de Negócio

### Estratégia de Redução de Uso de LLM

```typescript
// Ao solicitar questões, primeiro buscar no banco existente
async function getOrGenerateQuestions(params: {
  educationLevelId: string
  gradeId: string
  subjectId: string
  bnccSkillIds: string[]
  type: QuestionType
  difficulty: DifficultyLevel
  quantity: number
}): Promise<{
  fromBank: Question[]
  generated: Question[]
  usage: { used: number; limit: number }
}> {
  // 1. Buscar questões APROVADAS que atendem aos critérios
  const existingQuestions = await prisma.question.findMany({
    where: {
      status: 'APPROVED',
      educationLevelId: params.educationLevelId,
      gradeId: params.gradeId,
      subjectId: params.subjectId,
      bnccSkills: {
        some: { bnccSkillId: { in: params.bnccSkillIds } }
      },
      type: params.type,
      difficulty: params.difficulty,
    },
    include: {
      bnccSkills: { include: { bnccSkill: true } }
    },
    orderBy: [
      { usageCount: 'asc' },      // Priorizar menos usadas
      { averageRating: 'desc' },  // Melhor avaliadas
    ],
    take: params.quantity * 2,    // Buscar o dobro para ter margem
  })

  // 2. Selecionar aleatoriamente da pool
  const shuffled = shuffleArray(existingQuestions)
  const fromBank = shuffled.slice(0, params.quantity)

  // 3. Se não tiver questões suficientes, gerar com IA
  const missing = params.quantity - fromBank.length
  let generated: Question[] = []

  if (missing > 0) {
    // Verificar limite de uso ANTES de gerar
    const usage = await getQuestionUsage(userId)
    if (usage.remaining < missing) {
      throw new QuotaExceededError(usage)
    }

    // Gerar com IA
    generated = await generateQuestionsWithAI({
      ...params,
      quantity: missing,
      existingStatements: fromBank.map(q => q.statement), // Evitar duplicatas
    })

    // Salvar como DRAFT automaticamente
    await prisma.question.createMany({
      data: generated.map(q => ({
        ...q,
        status: 'DRAFT',
        origin: 'AI_GENERATED',
        createdById: userId,
      }))
    })

    // Incrementar uso APENAS pelas questões geradas
    await incrementQuestionUsage(userId, generated.length)
  }

  // Incrementar usageCount das questões reutilizadas
  if (fromBank.length > 0) {
    await prisma.question.updateMany({
      where: { id: { in: fromBank.map(q => q.id) } },
      data: { usageCount: { increment: 1 } }
    })
  }

  return {
    fromBank,
    generated,
    usage: await getQuestionUsage(userId)
  }
}
```

### Limites de Uso

```typescript
const QUESTION_GENERATION_LIMITS = {
  user: 20,        // 20 questões/mês para usuário free
  subscriber: 100, // 100 questões/mês para assinante
  admin: Infinity, // Sem limite para admin
}

// Resposta da API inclui breakdown claro
interface GenerateQuestionsResponse {
  success: true
  data: {
    questions: Question[]
    breakdown: {
      fromBank: number      // Ex: 3 questões reutilizadas
      generated: number     // Ex: 2 questões geradas
      total: number         // Ex: 5 total
    }
    usage: {
      used: number          // Questões geradas este mês
      limit: number         // Limite mensal
      remaining: number     // Restante
      resetsAt: string      // Data de reset
    }
  }
}
```

### Regras de Edição por Status

```typescript
function canEditQuestion(question: Question, user: User): boolean {
  // Admin pode editar qualquer questão não-aprovada
  if (user.role === 'admin' || user.role === 'editor') {
    return question.status !== 'APPROVED' && question.status !== 'ARCHIVED'
  }

  // Usuário comum pode editar apenas suas próprias questões em DRAFT
  return (
    question.createdById === user.id &&
    question.status === 'DRAFT'
  )
}

// Ao tentar editar questão APPROVED
// → Criar nova questão baseada nela (clone)
// → Retornar erro informativo para o frontend
```

### Deduplicação ao Salvar

```typescript
async function saveQuestion(data: CreateQuestionInput): Promise<Question> {
  // 1. Calcular hash
  const contentHash = computeContentHash(data.type, data.statement)

  // 2. Verificar duplicata
  const existing = await prisma.question.findFirst({
    where: { contentHash, type: data.type }
  })

  if (existing) {
    if (existing.status === 'APPROVED') {
      // Reutilizar questão existente
      return existing
    }
    // Sinalizar que já existe uma similar
    throw new DuplicateQuestionError(existing.id)
  }

  // 3. Salvar nova questão
  return prisma.question.create({
    data: {
      ...data,
      contentHash,
      answerSummary: computeAnswerSummary(data.type, data.content),
    }
  })
}
```

### Workflow de Revisão

```
AI_GENERATED (status: DRAFT)
    │
    ▼
Usuário usa a questão
    │
    ├── Questão com rating >= 4.0 e >= 5 usos
    │       │
    │       ▼
    │   Status: PENDING_REVIEW (auto)
    │
    └── Admin revisa manualmente
            │
            ▼
        Status: APPROVED ou REJECTED

MANUAL (status: APPROVED direto se criada por editor/admin)
```

---

## Schemas Zod

```typescript
// lib/schemas/question.ts

import { z } from 'zod'

export const QuestionTypeEnum = z.enum([
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'FILL_BLANK',
  'MATCHING',
  'SHORT_ANSWER',
  'ESSAY',
  'CALCULATION',
])

export const DifficultyLevelEnum = z.enum(['EASY', 'MEDIUM', 'HARD'])

// ============================================
// REGRAS FIXAS POR ETAPA E TIPO
// ============================================

export const QUESTION_RULES = {
  'ensino-fundamental-1': {
    MULTIPLE_CHOICE: {
      minAlternatives: 4,
      maxAlternatives: 4,
      allowedIds: ['A', 'B', 'C', 'D']
    },
    TRUE_FALSE: {
      minStatements: 1,
      maxStatements: 5
    },
    FILL_BLANK: {
      minBlanks: 1,
      maxBlanks: 3
    },
    MATCHING: {
      minPairs: 3,
      maxPairs: 5
    },
    SHORT_ANSWER: {
      maxLength: 200
    },
    // ESSAY e CALCULATION não disponíveis para EF1
  },
  'ensino-fundamental-2': {
    MULTIPLE_CHOICE: {
      minAlternatives: 5,
      maxAlternatives: 5,
      allowedIds: ['A', 'B', 'C', 'D', 'E']
    },
    TRUE_FALSE: {
      minStatements: 1,
      maxStatements: 8
    },
    FILL_BLANK: {
      minBlanks: 1,
      maxBlanks: 5
    },
    MATCHING: {
      minPairs: 4,
      maxPairs: 8
    },
    SHORT_ANSWER: {
      maxLength: 500
    },
    ESSAY: {
      minRubricCriteria: 2,
      maxRubricCriteria: 5
    },
    CALCULATION: {
      minSteps: 1,
      maxSteps: 10
    },
  },
} as const

// Tipos disponíveis por etapa
export const AVAILABLE_TYPES_BY_LEVEL = {
  'ensino-fundamental-1': [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'MATCHING',
    'SHORT_ANSWER',
  ],
  'ensino-fundamental-2': [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'MATCHING',
    'SHORT_ANSWER',
    'ESSAY',
    'CALCULATION',
  ],
} as const

// ============================================
// CONTENT SCHEMAS COM VALIDAÇÃO DINÂMICA
// ============================================

// Factory para criar schema de múltipla escolha baseado na etapa
export function createMultipleChoiceSchema(educationLevelSlug: string) {
  const rules = QUESTION_RULES[educationLevelSlug as keyof typeof QUESTION_RULES]?.MULTIPLE_CHOICE
  if (!rules) throw new Error(`Regras não encontradas para ${educationLevelSlug}`)

  return z.object({
    alternatives: z.array(z.object({
      id: z.enum(rules.allowedIds as [string, ...string[]]),
      text: z.string().min(1, 'Texto da alternativa é obrigatório'),
      isCorrect: z.boolean(),
    }))
    .length(rules.minAlternatives,
      `Deve ter exatamente ${rules.minAlternatives} alternativas para ${educationLevelSlug}`
    )
    .refine(
      alts => alts.filter(a => a.isCorrect).length === 1,
      'Deve haver exatamente uma alternativa correta'
    ),
    correctAlternativeId: z.enum(rules.allowedIds as [string, ...string[]]),
  })
}

export const TrueFalseContentSchema = z.object({
  statements: z.array(z.object({
    id: z.string(),
    text: z.string().min(1),
    isTrue: z.boolean(),
    justification: z.string().optional(),
  })).min(1).max(10),
})

export const FillBlankContentSchema = z.object({
  textWithBlanks: z.string().min(10),
  blanks: z.array(z.object({
    id: z.string(),
    correctAnswers: z.array(z.string()).min(1),
    position: z.number().int().min(0),
  })).min(1).max(5),
})

export const MatchingContentSchema = z.object({
  columnA: z.array(z.object({
    id: z.string(),
    text: z.string().min(1),
  })).min(3).max(8),
  columnB: z.array(z.object({
    id: z.string(),
    text: z.string().min(1),
  })).min(3).max(8),
  correctPairs: z.array(z.object({
    columnAId: z.string(),
    columnBId: z.string(),
  })).min(3).max(8),
})

export const ShortAnswerContentSchema = z.object({
  expectedKeywords: z.array(z.string()).min(1),
  sampleAnswer: z.string().min(1),
  maxLength: z.number().int().positive().optional(),
})

export const EssayContentSchema = z.object({
  rubric: z.array(z.object({
    criterion: z.string().min(1),
    maxPoints: z.number().positive(),
    description: z.string().min(1),
  })).min(2).max(5),
  sampleAnswer: z.string().optional(),
  minWords: z.number().int().positive().optional(),
  maxWords: z.number().int().positive().optional(),
})

export const CalculationContentSchema = z.object({
  steps: z.array(z.object({
    order: z.number().int().min(1),
    description: z.string().min(1),
    formula: z.string().optional(),
    result: z.string().min(1),
  })).min(1).max(10),
  finalAnswer: z.string().min(1),
  unit: z.string().optional(),
  acceptableVariance: z.number().optional(),
})

// ============================================
// SCHEMAS DE INPUT
// ============================================

// Schema de geração (input do usuário)
export const GenerateQuestionsSchema = z.object({
  educationLevelId: z.string().cuid(),
  gradeId: z.string().cuid(),
  subjectId: z.string().cuid(),
  bnccSkillIds: z.array(z.string().cuid()).min(1).max(3),
  type: QuestionTypeEnum,
  difficulty: DifficultyLevelEnum,
  quantity: z.number().int().min(1).max(10),
  context: z.string().max(500).optional(), // Tema/contexto opcional
})

// Schema de criação manual (admin)
export const CreateQuestionSchema = z.object({
  type: QuestionTypeEnum,
  statement: z.string().min(10).max(2000),
  supportText: z.string().max(5000).optional(),
  content: z.record(z.any()), // Validado dinamicamente por tipo
  explanation: z.string().max(2000).optional(),
  educationLevelId: z.string().cuid(),
  gradeId: z.string().cuid(),
  subjectId: z.string().cuid(),
  bnccSkillIds: z.array(z.string().cuid()).min(1).max(3),
  difficulty: DifficultyLevelEnum,
  estimatedTime: z.number().int().min(1).max(60).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

// Função de validação completa (combina schema + regras por tipo)
export async function validateQuestion(
  data: z.infer<typeof CreateQuestionSchema>,
  educationLevelSlug: string
): Promise<{ success: true } | { success: false; errors: string[] }> {
  const errors: string[] = []

  // 1. Verificar se tipo é permitido para a etapa
  const allowedTypes = AVAILABLE_TYPES_BY_LEVEL[educationLevelSlug as keyof typeof AVAILABLE_TYPES_BY_LEVEL]
  if (!allowedTypes?.includes(data.type as any)) {
    errors.push(`Tipo ${data.type} não disponível para ${educationLevelSlug}`)
  }

  // 2. Validar content específico do tipo
  const rules = QUESTION_RULES[educationLevelSlug as keyof typeof QUESTION_RULES]
  if (rules && data.type in rules) {
    // Validação específica por tipo...
    // (implementar validações detalhadas aqui)
  }

  return errors.length === 0
    ? { success: true }
    : { success: false, errors }
}

// Schema de avaliação
export const CreateAssessmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  educationLevelId: z.string().cuid(),
  gradeId: z.string().cuid(),
  subjectId: z.string().cuid(),
  totalPoints: z.number().positive().default(10),
  estimatedDuration: z.number().int().min(5).max(180).optional(),
  instructions: z.string().max(2000).optional(),
  items: z.array(z.object({
    questionId: z.string().cuid(),
    order: z.number().int().min(0),
    points: z.number().positive().default(1),
  })).min(1).max(50),
})
```

---

## Prompts de IA

### System Prompt - Ensino Fundamental 1

```typescript
// lib/ai/prompts/questions/system-ef1.ts

export const QUESTION_GENERATION_SYSTEM_PROMPT_EF1 = `
Você é um especialista em avaliação educacional para os Anos Iniciais do Ensino Fundamental (1º ao 5º ano) no Brasil.

## Diretrizes Gerais
- Linguagem clara, simples e adequada à faixa etária (6-10 anos)
- Evitar palavras complexas ou termos técnicos desnecessários
- Contextualizar questões em situações do cotidiano infantil
- Usar nomes brasileiros comuns e contextos culturais brasileiros
- Ilustrar com exemplos concretos e tangíveis

## Por Nível de Dificuldade
### Fácil
- Questões diretas que testam reconhecimento
- Uma única habilidade por questão
- Alternativas claramente distintas

### Médio
- Requer aplicação do conhecimento
- Pode combinar duas habilidades relacionadas
- Distratores plausíveis mas não enganosos

### Difícil
- Requer análise ou síntese
- Contextualização mais elaborada
- Pode envolver múltiplas etapas de raciocínio

## Por Tipo de Questão
### Múltipla Escolha (4 alternativas para EF1)
- Alternativa correta inequívoca
- Distratores baseados em erros comuns
- Evitar "nenhuma das anteriores" ou "todas as anteriores"
- Alternativas com tamanhos similares

### Verdadeiro ou Falso
- Afirmações claras e objetivas
- Evitar dupla negação
- Uma ideia por afirmação

### Completar Lacunas
- Lacunas para conceitos-chave
- Contexto suficiente para deduzir a resposta
- Preferencialmente uma palavra por lacuna

## Estrutura da Resposta
Retorne um JSON válido com a estrutura especificada.
`
```

### System Prompt - Ensino Fundamental 2

```typescript
// lib/ai/prompts/questions/system-ef2.ts

export const QUESTION_GENERATION_SYSTEM_PROMPT_EF2 = `
Você é um especialista em avaliação educacional para os Anos Finais do Ensino Fundamental (6º ao 9º ano) no Brasil.

## Diretrizes Gerais
- Linguagem clara mas com vocabulário adequado à faixa etária (11-14 anos)
- Questões podem ser mais elaboradas e exigir interpretação
- Contextualizar em situações relevantes para adolescentes
- Incluir questões que desenvolvam pensamento crítico
- Alinhar com padrões do SAEB quando aplicável

## Por Nível de Dificuldade
### Fácil
- Aplicação direta de conceitos
- Uma ou duas habilidades
- Textos de apoio curtos

### Médio
- Requer interpretação e análise
- Pode envolver gráficos, tabelas ou imagens
- Múltiplas habilidades relacionadas

### Difícil
- Questões de síntese e avaliação
- Textos de apoio mais longos
- Raciocínio em múltiplas etapas
- Conexão entre diferentes áreas do conhecimento

## Por Tipo de Questão
### Múltipla Escolha (5 alternativas para EF2)
- Padrão SAEB com 5 alternativas
- Distratores plausíveis baseados em erros conceituais
- Pode incluir texto-base para interpretação

### Dissertativa
- Enunciado claro sobre o que se espera
- Indicar extensão esperada (linhas ou parágrafos)
- Fornecer rubrica de correção

### Cálculo
- Mostrar passo a passo da resolução
- Indicar unidades de medida
- Contextualizar o problema

## Estrutura da Resposta
Retorne um JSON válido com a estrutura especificada.
`
```

---

## Integração com Sistema Existente

### Reutilização de Componentes

| Componente Existente | Uso no Banco de Questões |
|----------------------|--------------------------|
| `useEducationLevels()` | Filtrar por etapa |
| `useGrades(slug)` | Filtrar por série |
| `useSubjects(level, grade)` | Filtrar por disciplina |
| `useBnccSkills(params)` | Selecionar habilidades |
| `CrudPageShell` | Admin - listagem |
| `CrudEditDrawer` | Admin - formulário |
| `DeleteConfirmDialog` | Confirmação de exclusão |
| `useDataTable` | Gerenciar estado CRUD |
| Componentes de drawer do lesson-plans | Wizard de geração |

### Navegação

Adicionar ao menu do cliente:
```typescript
// Sidebar ou menu principal
{
  label: 'Questões',
  href: '/questions',
  icon: HelpCircle,
  children: [
    { label: 'Explorar', href: '/questions' },
    { label: 'Gerar', href: '/questions/generate' },
    { label: 'Salvos', href: '/questions/saved' },
    { label: 'Avaliações', href: '/questions/assessments' },
  ]
}
```

Adicionar ao menu admin:
```typescript
{
  label: 'Questões',
  href: '/admin/questions',
  icon: HelpCircle,
  children: [
    { label: 'Todas', href: '/admin/questions' },
    { label: 'Revisão', href: '/admin/questions/review' },
    { label: 'Analytics', href: '/admin/questions/analytics' },
  ]
}
```

---

## Fases de Implementação

> **Priorização atualizada**: Valor imediato primeiro, IA depois de base sólida.

### Fase 1: Fundação (Banco + Admin CRUD)
**Objetivo**: Base de dados e gestão administrativa

**Entregáveis**:
1. Migration Prisma com todos os modelos
2. Schemas Zod com regras por tipo/etapa
3. API Admin:
   - `GET /api/v1/admin/questions` - Listar com filtros e paginação
   - `POST /api/v1/admin/questions` - Criar questão manual
   - `GET /api/v1/admin/questions/[id]` - Detalhes
   - `PUT /api/v1/admin/questions/[id]` - Editar (respeitando status)
   - `DELETE /api/v1/admin/questions/[id]` - Excluir
4. Página Admin CRUD (`/admin/questions`)
   - Listagem com filtros: status, tipo, série, disciplina
   - Formulário de criação/edição por tipo
   - Exclusão com confirmação
5. Seed inicial com questões de exemplo (opcional)

**Critério de conclusão**: Admin consegue criar, listar, editar e excluir questões manualmente.

---

### Fase 2: Busca e Exploração (Cliente)
**Objetivo**: Professoras encontram e usam questões existentes

**Entregáveis**:
1. API Cliente:
   - `GET /api/v1/questions` - Buscar questões APPROVED
   - `GET /api/v1/questions/[id]` - Detalhes
   - `POST /api/v1/questions/saved` - Salvar favorito
   - `DELETE /api/v1/questions/saved/[id]` - Remover favorito
   - `GET /api/v1/questions/saved` - Listar favoritos
2. Página de exploração (`/questions`)
   - Filtros: série, disciplina, habilidade BNCC, tipo, dificuldade
   - Busca por texto no enunciado
   - Grid de cards de questões
   - Paginação
3. Página de detalhes (`/questions/[id]`)
   - Visualização completa da questão
   - Botão salvar/remover favorito
   - Renderização específica por tipo
4. Página de favoritos (`/questions/saved`)
5. Componentes de renderização por tipo de questão

**Critério de conclusão**: Professora busca, visualiza e salva questões aprovadas.

---

### Fase 3: Geração com IA
**Objetivo**: Gerar questões novas quando banco insuficiente

**Entregáveis**:
1. System prompts por etapa (EF1, EF2)
2. Service de geração com OpenAI Structured Outputs
3. Lógica de busca-primeiro-gera-depois
4. API de geração:
   - `POST /api/v1/questions/generate` - Gerar questões
   - `GET /api/v1/questions/usage` - Uso mensal
5. Wizard de geração (`/questions/generate` ou drawer)
   - Passo 1: Contexto (etapa, série, disciplina, BNCC)
   - Passo 2: Configuração (tipo, quantidade, dificuldade)
   - Passo 3: Resultado (preview, descartar, salvar)
6. Controle de uso mensal por role
7. Deduplicação via contentHash
8. UI mostrando breakdown (X do banco + Y geradas)

**Critério de conclusão**: Professora gera questões, vê uso restante, questões são salvas como DRAFT.

---

### Fase 4: Avaliações
**Objetivo**: Montar e exportar provas

**Entregáveis**:
1. API de avaliações:
   - `GET /api/v1/assessments` - Listar
   - `POST /api/v1/assessments` - Criar
   - `GET /api/v1/assessments/[id]` - Detalhes
   - `PUT /api/v1/assessments/[id]` - Editar
   - `DELETE /api/v1/assessments/[id]` - Excluir
   - `GET /api/v1/assessments/[id]/export` - Exportar Word
2. Página de listagem (`/questions/assessments`)
3. Builder de avaliação (`/questions/assessments/create`)
   - Informações básicas
   - Seleção de questões (busca + favoritos)
   - Ordenação com drag & drop
   - Pontuação por questão
   - Preview em tempo real
4. Exportação Word:
   - Cabeçalho customizável
   - Questões numeradas
   - Gabarito na última página

> **Notas técnicas para Fase 4:**
> - **Snapshot**: Considerar adicionar campo `questionSnapshot` (JSON) em `AssessmentItem` para preservar estado da questão no momento da criação. Evita problemas se questão original for editada/arquivada depois.
> - **Exportação PDF**: Fora do MVP. Word cobre 90% do uso inicial. Pode ser adicionado posteriormente.
> - **Interpretação de texto**: Já coberta via `supportText` no model Question. Não precisa tipo novo.

**Critério de conclusão**: Professora monta prova e exporta Word com gabarito.

---

### Fase 5: Curadoria e Revisão
**Objetivo**: Qualidade do banco através de revisão

**Entregáveis**:
1. Fila de revisão (`/admin/questions/review`)
   - Questões DRAFT e PENDING_REVIEW
   - Interface de revisão rápida
   - Aprovar/Rejeitar com motivo
   - Edição inline
   - Navegação próxima/anterior
2. Auto-promoção:
   - Questões com rating >= 4.0 e >= 5 usos → PENDING_REVIEW
3. Operações em lote:
   - Aprovar selecionadas
   - Rejeitar selecionadas
   - Arquivar selecionadas
4. Sistema de rating:
   - `POST /api/v1/questions/rate` - Avaliar questão
   - Média e contagem no card/detalhes

**Critério de conclusão**: Admin revisa e aprova questões, professoras avaliam qualidade.

---

### Fase 6: Analytics e Otimização
**Objetivo**: Insights e eficiência

**Entregáveis**:
1. Dashboard analytics (`/admin/questions/analytics`)
   - Total de questões por status
   - Distribuição por tipo, série, disciplina
   - Questões mais usadas (top 10)
   - Taxa de aprovação
   - Uso de LLM (tokens, custo estimado)
   - Crescimento do banco ao longo do tempo
2. Métricas de custo:
   - Custo por questão gerada
   - Economia por reutilização
3. Otimizações:
   - Cache de consultas frequentes
   - Algoritmo de seleção melhorado
   - Detecção de questões similares (além de hash exato)

**Critério de conclusão**: Dashboard com métricas de uso, custo e qualidade.

---

## Métricas de Sucesso

### Produto
- Questões geradas por mês
- Questões aprovadas no banco
- Taxa de uso de questões existentes vs geração
- Avaliações montadas por usuário

### Qualidade
- Rating médio das questões
- Taxa de aprovação na revisão
- Feedback negativo

### Negócio
- Redução de custo de LLM ao longo do tempo
- Engajamento (retorno de usuários)
- Conversão para assinatura (se feature premium)

---

## Considerações Técnicas

### Performance
- Índices adequados para buscas frequentes
- Cache de questões populares
- Paginação em todas as listagens
- Lazy loading de imagens

### Segurança
- Validação de permissões em todas as rotas
- Sanitização de input
- Rate limiting na geração

### Escalabilidade
- Banco de questões pode crescer significativamente
- Considerar busca full-text (PostgreSQL GIN index)
- Possível migração para ElasticSearch no futuro

---

## Resumo das Decisões Arquiteturais

| # | Ponto | Decisão |
|---|-------|---------|
| 1 | Edição de questões | Imutável para professor; edita no Word exportado |
| 2 | Gabarito | Único dentro do `content`; `answerSummary` derivado |
| 3 | Versionamento | APPROVED não edita; arquiva e cria nova |
| 4 | BNCC | Tabela de relacionamento `QuestionBnccSkill` |
| 5 | Deduplicação | Hash do enunciado + tipo; unique constraint |
| 6 | Validação | Regras duras por etapa/tipo no backend |
| 7 | Salvamento IA | Automático como DRAFT |
| 8 | Contagem uso | Apenas questões geradas por IA |
| 9 | Exportação | Word único com gabarito na última página |
| 10 | MVP | Fases 1-2 primeiro (CRUD + busca), IA depois |

---

## Conclusão

Este PRD define um módulo completo de Banco de Questões que:

1. **Resolve o problema**: Professoras economizam tempo na criação de avaliações
2. **É sustentável**: O banco cresce organicamente, reduzindo custos de LLM
3. **É escalável**: Arquitetura preparada para milhares de questões
4. **É consistente**: Segue os padrões estabelecidos do Kadernim
5. **É iterativo**: Fases claras permitem entregas incrementais de valor
6. **Decisões claras**: Todos os pontos de atenção foram definidos

### Próximos Passos

1. **Revisar** este PRD e aprovar decisões
2. **Iniciar Fase 1**: Migration Prisma + Admin CRUD
3. **Popular banco**: Criar questões manuais ou importar
4. **Fase 2**: Abrir para professoras explorarem
5. **Fase 3+**: Adicionar IA e avaliações
