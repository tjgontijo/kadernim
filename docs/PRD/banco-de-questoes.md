# PRD: Banco de Questoes Kadernim

**Versao:** 0.1 - PRD Inicial  
**Data:** 2026-05-02  
**Status:** Draft  
**Prioridade:** Alta

---

## 1. Visao Geral

Criar um **banco de questoes reutilizavel**, persistido em banco de dados, que permita a professoras solicitar questoes por ano, disciplina, dificuldade e quantidade.

O sistema deve sempre buscar primeiro questoes existentes e aprovadas. A LLM so deve ser acionada quando o banco nao tiver cobertura suficiente para o recorte solicitado. Cada nova questao gerada passa por validacao, e as questoes aprovadas alimentam o banco para usos futuros.

O ativo principal desta feature e a **questao estruturada e curada**, nao um `Resource`. Recursos, apostilas, listas, provas e PDFs podem ser saidas futuras montadas a partir das questoes.

Rota proposta para professora: `/question-bank` ou `/banco-questoes`.

Rota admin/editorial proposta: `/admin/question-bank`.

---

## 2. Contexto Atual do Projeto

### 2.1 Dominios existentes relevantes

O projeto ja possui dominios que devem ser reaproveitados:

- `src/lib/bncc`
  - schemas e servicos para listar e detalhar habilidades BNCC.
  - usa `BnccSkill`, `EducationLevel`, `Grade` e `Subject`.
- `src/lib/taxonomy`
  - servicos e hooks para etapas, anos e disciplinas.
  - `TaxonomyService.listEducationLevels`, `listGrades`, `listSubjects`.
- `src/lib/resource`
  - contratos de componentes pedagogicos e renderizacao de PDF/HTML.
  - hoje e orientado a `ResourcePlan`, nao a banco de questoes.
- `src/lib/resources`
  - catalogo editorial de materiais publicados.
  - nao deve ser a base desta feature.
- `src/lib/lesson-plans`
  - bom exemplo de dominio proprio com schema, services, api-client e UI.
- `src/mastra/agents/generate-resource`
  - fluxo atual de geracao de recurso/apostila.
- `src/mastra/agents/generate-resource-qa`
  - fluxo ja mais proximo de questoes, mas ainda retorna `ResourcePlan`.

### 2.2 Schema existente relevante

O schema Prisma ja possui:

- `EducationLevel`
- `Grade`
- `Subject`
- `GradeSubject`
- `BnccSkill`
- `ResourceBnccSkill`
- `User`
- `Resource`
- `LessonPlan`

Para o MVP do banco de questoes sera necessario adicionar novos modelos. Nao e recomendado adaptar `Resource`, porque ele representa material publicado, arquivos, imagens, reviews, downloads e curadoria editorial de catalogo.

### 2.3 UI e navegacao existentes

O dashboard ja possui:

- Biblioteca: `/resources`
- Favoritos: `/favorites`
- Planos de Aula: `/planner`
- BNCC: `/bncc`
- Gerador admin: `/admin/generate-resource`
- Recursos admin: `/admin/resources`

O banco de questoes deve nascer como area propria no dashboard, junto de Biblioteca, Planner e BNCC. A tela admin deve ficar separada para revisao, moderacao e metricas.

### 2.4 Templates visuais ja definidos

O arquivo `docs/Kadernim/modelos-questoes-banco.html` passa a ser referencia de produto para os modelos visuais do banco.

Templates considerados para o MVP:

- `reading_context`
- `table_interpretation`
- `multiple_choice`
- `multiple_select`
- `true_false`
- `fill_blank`
- `matching`
- `ordering`
- `classification`
- `open_text`
- `short_answer`

Templates fora do MVP:

- `calculation`
- `scale`

Motivo:

- `calculation` reintroduz Matematica e aumenta complexidade de template/correcao.
- `scale` e mais diagnostico/opiniao do que questao curricular reutilizavel.

---

## 3. Problema

Hoje o produto consegue gerar recursos e planos, mas nao possui um ativo reaproveitavel de questoes.

Isso cria quatro problemas:

1. Cada nova geracao tende a consumir LLM novamente.
2. Questao boa gerada uma vez nao vira patrimonio reutilizavel do produto.
3. Nao ha sinal sistematico de qualidade por avaliacao de professoras.
4. Nao ha cobertura mensuravel por ano, disciplina, habilidade BNCC, dificuldade e tipo de questao.

O objetivo nao e apenas gerar atividades. O objetivo e construir um banco que melhore com o uso.

---

## 4. Objetivos

1. Criar um dominio novo de banco de questoes.
2. Persistir questoes estruturadas por tipo/template.
3. Reaproveitar BNCC e taxonomia existentes.
4. Suportar apenas Fundamental 2 no MVP.
5. Suportar apenas disciplinas com templates textuais seguros.
6. Classificar toda questao por dificuldade: facil, media ou dificil.
7. Permitir avaliacao da questao por professoras.
8. Buscar primeiro no banco e gerar com LLM apenas o deficit.
9. Registrar pedidos, reuso, geracao e cobertura.
10. Preparar base para lista/prova/apostila/PDF no futuro.

---

## 5. Nao Objetivos

- Nao criar banco para Fundamental 1 no MVP.
- Nao incluir Matematica no MVP.
- Nao gerar questoes que dependam de imagem, mapa real, grafico real ou desenho.
- Nao transformar automaticamente questoes em `Resource`.
- Nao implementar editor visual completo de questoes no primeiro passo.
- Nao implementar correcao automatica de respostas discursivas no MVP.
- Nao usar LLM para gerar HTML final.
- Nao permitir tipos livres de questao fora do contrato.
- Nao fazer busca vetorial no MVP.

---

## 6. Escopo do MVP

### 6.1 Etapa e anos

Etapa:

- Ensino Fundamental 2

Anos:

- 6o ano
- 7o ano
- 8o ano
- 9o ano

Mapeamento visual:

- 6o e 7o ano: `data-phase="4"`
- 8o e 9o ano: `data-phase="5"`

### 6.2 Disciplinas

Entram no MVP:

- Lingua Portuguesa
- Historia
- Geografia
- Ciencias

As disciplinas devem ser resolvidas pela taxonomia real do banco (`Subject`) e nao por strings hardcoded na regra de negocio. Para o contrato de renderizacao, usar os codigos visuais:

- Lingua Portuguesa: `pt`
- Historia: `hist`
- Geografia: `geo`
- Ciencias: `sci`

### 6.3 Dificuldade

Toda questao deve ter:

- `EASY`
- `MEDIUM`
- `HARD`

Definicao inicial:

- `EASY`: reconhecimento, localizacao de informacao, identificacao, conceito direto.
- `MEDIUM`: aplicacao, comparacao, inferencia simples, relacao causa/consequencia direta.
- `HARD`: inferencia mais abstrata, justificativa, comparacao entre conceitos, analise com mais de uma etapa.

Distribuicao padrao quando a professora nao escolher:

- 40% facil
- 40% media
- 20% dificil

### 6.4 Tipos de questao no MVP

Permitidos:

- `multiple_choice`
- `multiple_select`
- `true_false`
- `fill_blank`
- `matching`
- `ordering`
- `classification`
- `open_text`
- `short_answer`
- `table_interpretation`

Permitido como bloco de apoio:

- `reading_context`

Fora do MVP:

- `calculation`
- `scale`

### 6.5 Regras por disciplina

Lingua Portuguesa:

- Priorizar `reading_context`, `multiple_choice`, `short_answer`, `open_text`, `fill_blank`.
- Pode usar `classification` para classes gramaticais, generos textuais e elementos da lingua.

Historia:

- Priorizar `ordering`, `multiple_choice`, `true_false`, `short_answer`, `open_text`.
- Pode usar `reading_context` para fonte historica curta.

Geografia:

- Priorizar `multiple_choice`, `classification`, `table_interpretation`, `true_false`, `short_answer`.
- Nao usar mapas reais no MVP.

Ciencias:

- Priorizar `multiple_choice`, `true_false`, `matching`, `ordering`, `classification`, `short_answer`.
- Nao usar diagramas, experimentos visuais ou calculos no MVP.

---

## 7. Principios de Produto

### 7.1 Banco antes de geracao

O fluxo correto e:

```txt
professora pede questoes
->
sistema consulta banco
->
se houver cobertura suficiente, retorna do banco
->
se faltar, gera somente o deficit
->
valida, persiste e retorna
```

### 7.2 Questao estruturada, nao HTML

A LLM deve gerar JSON estruturado conforme schema. O renderizador transforma esse JSON em HTML usando os templates aprovados.

### 7.3 BNCC obrigatoria internamente

A professora pode nao escolher uma habilidade BNCC na UI, mas cada questao deve ser vinculada a uma ou mais habilidades BNCC por baixo.

### 7.4 Qualidade acumulada

O banco deve priorizar questoes:

1. aprovadas por professora;
2. bem avaliadas;
3. usadas sem flag;
4. com status automatico aprovado;
5. recem-geradas, apenas quando faltar cobertura.

### 7.5 Templates fechados

O sistema nao deve aceitar tipo de questao fora da lista permitida para o MVP. Isso evita quebra de renderizacao, PDF e manutencao.

---

## 8. Experiencia da Professora

### 8.1 Entrada principal

Nova tela no dashboard:

- titulo: `Banco de Questoes`
- rota sugerida: `/question-bank`

Filtros principais:

- ano: 6o, 7o, 8o, 9o
- disciplina: Lingua Portuguesa, Historia, Geografia, Ciencias
- dificuldade: qualquer, facil, media, dificil, distribuicao mista
- quantidade
- tipo de questao opcional
- habilidade BNCC opcional em modo avancado

Acao principal:

- `Buscar questoes`

Texto de apoio:

- A UI deve deixar claro se as questoes vieram do banco ou se algumas foram geradas agora.

### 8.2 Resultado

Exibir lista de questoes renderizadas com o template visual.

Cada item deve mostrar:

- tipo
- dificuldade
- disciplina
- ano
- codigo BNCC
- origem: banco ou gerada agora
- status de qualidade quando aplicavel

Acoes por questao:

- avaliar como boa
- sinalizar problema
- trocar questao
- copiar
- ver gabarito

### 8.3 Feedback da professora

Feedback rapido:

- `Boa questao`
- `Problema`

Motivos para problema:

- muito facil
- muito dificil
- confusa
- erro conceitual
- fora da BNCC
- gabarito ruim
- inadequada para o ano
- problema de portugues

Comentario opcional:

- texto livre curto.

### 8.4 Estados

Loading:

- skeleton de filtros e lista.

Sem cobertura:

- se o banco nao tiver questoes e a geracao estiver disponivel, iniciar geracao do deficit.
- se a geracao falhar, mostrar erro claro e permitir tentar novamente.

Erro:

- mensagem curta.
- manter filtros selecionados.

---

## 9. Experiencia Admin/Editorial

Rota proposta:

- `/admin/question-bank`

Objetivos:

- revisar questoes geradas;
- filtrar por status, disciplina, ano, dificuldade e tipo;
- ver questoes sinalizadas;
- aprovar, rejeitar ou editar metadados;
- acompanhar cobertura por recorte;
- acompanhar taxa de reuso vs geracao.

Estados de moderacao:

- `DRAFT_AI`
- `APPROVED_AI`
- `APPROVED_TEACHER`
- `FLAGGED`
- `REJECTED`
- `ARCHIVED`

No MVP, a tela admin pode ser simples e focada em lista + detalhe.

---

## 10. Modelagem de Dados

### 10.1 Enums propostos

```prisma
enum QuestionBankDifficulty {
  EASY
  MEDIUM
  HARD
}

enum QuestionBankStatus {
  DRAFT_AI
  APPROVED_AI
  APPROVED_TEACHER
  FLAGGED
  REJECTED
  ARCHIVED
}

enum QuestionBankFeedbackRating {
  POSITIVE
  NEGATIVE
}

enum QuestionBankFeedbackReason {
  TOO_EASY
  TOO_HARD
  UNCLEAR
  CONCEPTUAL_ERROR
  OUT_OF_BNCC
  BAD_ANSWER_KEY
  GRADE_MISMATCH
  LANGUAGE_PROBLEM
  OTHER
}

enum QuestionBankRequestStatus {
  COMPLETED
  PARTIAL
  FAILED
}

```

### 10.2 QuestionBankQuestion

```prisma
model QuestionBankQuestion {
  id               String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid

  educationLevelId String                     @db.Uuid
  gradeId          String                     @db.Uuid
  subjectId        String                     @db.Uuid

  questionTypeId   String                     @db.Uuid
  difficulty       QuestionBankDifficulty
  status           QuestionBankStatus         @default(DRAFT_AI)
  questionSourceId String                     @db.Uuid

  prompt           String                     @db.Text
  instruction      String?                    @db.Text
  payload          Json
  answerKey        Json
  explanation      String?                    @db.Text
  rubric           Json?

  contextId        String?                    @db.Uuid

  fingerprint      String                     @unique
  generatorVersion String?
  modelName        String?
  reviewMeta       Json?

  usageCount       Int                        @default(0)
  positiveCount    Int                        @default(0)
  negativeCount    Int                        @default(0)
  flaggedCount     Int                        @default(0)

  createdById      String?                    @db.Uuid
  approvedById     String?                    @db.Uuid
  approvedAt       DateTime?
  createdAt        DateTime                   @default(now())
  updatedAt        DateTime                   @updatedAt
  archivedAt       DateTime?

  educationLevel   EducationLevel             @relation(fields: [educationLevelId], references: [id], onDelete: Restrict)
  grade            Grade                      @relation(fields: [gradeId], references: [id], onDelete: Restrict)
  subject          Subject                    @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  questionType     QuestionBankQuestionType   @relation(fields: [questionTypeId], references: [id], onDelete: Restrict)
  questionSource   QuestionBankSource         @relation(fields: [questionSourceId], references: [id], onDelete: Restrict)
  context          QuestionBankContext?       @relation(fields: [contextId], references: [id], onDelete: SetNull)
  createdBy        User?                      @relation("QuestionBankCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  approvedBy       User?                      @relation("QuestionBankApprovedBy", fields: [approvedById], references: [id], onDelete: SetNull)

  skills           QuestionBankQuestionSkill[]
  feedback         QuestionBankFeedback[]
  requestItems     QuestionBankRequestItem[]

  @@index([educationLevelId, gradeId, subjectId, status])
  @@index([subjectId, gradeId, difficulty, status])
  @@index([questionTypeId, status])
  @@index([questionSourceId, status])
  @@index([status, createdAt])
  @@index([contextId])
  @@map("question_bank_question")
}
```

### 10.3 QuestionBankQuestionType (model)

```prisma
model QuestionBankQuestionType {
  id          String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String                @unique
  name        String
  description String?               @db.Text
  isActive    Boolean               @default(true)
  sortOrder   Int                   @default(0)
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  questions   QuestionBankQuestion[]

  @@index([isActive, sortOrder])
  @@map("question_bank_question_type")
}
```

### 10.4 QuestionBankSource (model)

```prisma
model QuestionBankSource {
  id          String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  code        String                @unique
  name        String
  description String?               @db.Text
  isActive    Boolean               @default(true)
  sortOrder   Int                   @default(0)
  appliesToQuestions Boolean        @default(true)
  appliesToRequestItems Boolean     @default(true)
  createdAt   DateTime              @default(now())
  updatedAt   DateTime              @updatedAt

  questions   QuestionBankQuestion[]
  requestItems QuestionBankRequestItem[]

  @@index([isActive, sortOrder])
  @@map("question_bank_source")
}
```

### 10.5 QuestionBankQuestionSkill

```prisma
model QuestionBankQuestionSkill {
  id         String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  questionId String               @db.Uuid
  bnccSkillId String              @db.Uuid

  question   QuestionBankQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  bnccSkill  BnccSkill            @relation(fields: [bnccSkillId], references: [id], onDelete: Cascade)

  @@unique([questionId, bnccSkillId])
  @@index([bnccSkillId])
  @@map("question_bank_question_skill")
}
```

### 10.6 QuestionBankContext

Usado para `reading_context`. Um contexto pode alimentar uma ou mais questoes.

```prisma
model QuestionBankContext {
  id               String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  educationLevelId String         @db.Uuid
  gradeId          String         @db.Uuid
  subjectId        String         @db.Uuid

  title            String
  body             String         @db.Text
  source           String?
  payload          Json?
  fingerprint      String         @unique

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
  archivedAt       DateTime?

  educationLevel   EducationLevel @relation(fields: [educationLevelId], references: [id], onDelete: Restrict)
  grade            Grade          @relation(fields: [gradeId], references: [id], onDelete: Restrict)
  subject          Subject        @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  questions        QuestionBankQuestion[]

  @@index([educationLevelId, gradeId, subjectId])
  @@map("question_bank_context")
}
```

### 10.7 QuestionBankFeedback

```prisma
model QuestionBankFeedback {
  id         String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  questionId String                     @db.Uuid
  userId     String                     @db.Uuid

  rating     QuestionBankFeedbackRating
  reason     QuestionBankFeedbackReason?
  comment    String?                    @db.Text

  createdAt  DateTime                   @default(now())

  question   QuestionBankQuestion       @relation(fields: [questionId], references: [id], onDelete: Cascade)
  user       User                       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([questionId, createdAt])
  @@index([userId, createdAt])
  @@map("question_bank_feedback")
}
```

### 10.8 QuestionBankRequest e QuestionBankRequestItem

Registra pedidos e permite medir reuso vs geracao.

```prisma
model QuestionBankRequest {
  id               String                    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String                    @db.Uuid
  educationLevelId String                    @db.Uuid
  gradeId          String                    @db.Uuid
  subjectId        String                    @db.Uuid

  requestedCount   Int
  reusedCount      Int                       @default(0)
  generatedCount   Int                       @default(0)
  returnedCount    Int                       @default(0)

  difficultyMix    Json?
  typeMix          Json?
  filters          Json
  paramsHash       String
  status           QuestionBankRequestStatus
  errorMessage     String?

  createdAt        DateTime                  @default(now())

  user             User                      @relation(fields: [userId], references: [id], onDelete: Cascade)
  educationLevel   EducationLevel            @relation(fields: [educationLevelId], references: [id], onDelete: Restrict)
  grade            Grade                     @relation(fields: [gradeId], references: [id], onDelete: Restrict)
  subject          Subject                   @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  items            QuestionBankRequestItem[]

  @@index([userId, createdAt])
  @@index([educationLevelId, gradeId, subjectId, createdAt])
  @@index([paramsHash])
  @@map("question_bank_request")
}

model QuestionBankRequestItem {
  id         String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  requestId  String               @db.Uuid
  questionId String               @db.Uuid
  sourceId   String               @db.Uuid
  order      Int

  request    QuestionBankRequest  @relation(fields: [requestId], references: [id], onDelete: Cascade)
  question   QuestionBankQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  source     QuestionBankSource   @relation(fields: [sourceId], references: [id], onDelete: Restrict)

  @@unique([requestId, questionId])
  @@index([questionId])
  @@index([sourceId])
  @@map("question_bank_request_item")
}
```

### 10.9 Relacoes a adicionar

Adicionar relacoes em:

- `User`
- `EducationLevel`
- `Grade`
- `Subject`
- `BnccSkill`

Os nomes das relacoes devem evitar conflito com `Resource`, `LessonPlan` e outros dominios existentes.

---

## 11. Contratos de Payload por Tipo

O backend deve validar `payload` e `answerKey` com Zod antes de persistir.

### 11.1 multiple_choice

```ts
{
  instruction?: string
  alternatives: Array<{ id: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }>
}
```

`answerKey`:

```ts
{ correctAlternativeId: 'A' | 'B' | 'C' | 'D' | 'E' }
```

### 11.2 multiple_select

```ts
{
  instruction?: string
  alternatives: Array<{ id: 'A' | 'B' | 'C' | 'D' | 'E'; text: string }>
}
```

`answerKey`:

```ts
{ correctAlternativeIds: Array<'A' | 'B' | 'C' | 'D' | 'E'> }
```

### 11.3 true_false

```ts
{
  statements: Array<{ id: string; text: string }>
}
```

`answerKey`:

```ts
{ answers: Array<{ id: string; value: boolean; explanation?: string }> }
```

### 11.4 fill_blank

```ts
{
  textWithBlanks: string
  wordBank?: string[]
}
```

`answerKey`:

```ts
{ answers: string[] }
```

### 11.5 matching

```ts
{
  left: Array<{ id: string; text: string }>
  right: Array<{ id: string; text: string }>
}
```

`answerKey`:

```ts
{ pairs: Array<{ leftId: string; rightId: string }> }
```

### 11.6 ordering

```ts
{
  items: Array<{ id: string; text: string }>
  criterion?: string
}
```

`answerKey`:

```ts
{ orderedItemIds: string[] }
```

### 11.7 classification

```ts
{
  items: Array<{ id: string; text: string }>
  categories: Array<{ id: string; label: string }>
}
```

`answerKey`:

```ts
{ classifications: Array<{ itemId: string; categoryId: string }> }
```

### 11.8 open_text

```ts
{
  answerLines: number
  instruction?: string
}
```

`answerKey`:

```ts
{
  expectedAnswer: string
  rubric: string[]
}
```

### 11.9 short_answer

```ts
{
  expectedFormat?: 'word' | 'phrase' | 'sentence'
}
```

`answerKey`:

```ts
{
  expectedAnswer: string
  aliases?: string[]
  caseSensitive?: boolean
}
```

### 11.10 table_interpretation

```ts
{
  tableTitle: string
  columns: string[]
  rows: string[][]
  answerMode: 'short_answer' | 'multiple_choice' | 'open_text'
  answerPayload?: Json
}
```

`answerKey`:

```ts
{
  expectedAnswer?: string
  correctAlternativeId?: string
  rubric?: string[]
}
```

### 11.11 reading_context

`reading_context` deve usar `QuestionBankContext`, nao `QuestionBankQuestion`.

```ts
{
  title: string
  body: string
  source?: string
}
```

---

## 12. Servicos e API

### 12.1 Estrutura de arquivos proposta

```txt
src/lib/question-bank/
  api-client/
  schemas/
  services/
  types/
```

Servicos principais:

```txt
src/lib/question-bank/services/question-bank-query-service.ts
src/lib/question-bank/services/question-bank-generation-service.ts
src/lib/question-bank/services/question-bank-feedback-service.ts
src/lib/question-bank/services/question-bank-admin-service.ts
src/lib/question-bank/services/question-bank-coverage-service.ts
```

Schemas:

```txt
src/lib/question-bank/schemas/question-bank-schemas.ts
src/lib/question-bank/schemas/question-payload-schemas.ts
```

### 12.2 Endpoint de geracao/reuso

```txt
POST /api/v1/question-bank/requests
```

Input:

```ts
{
  gradeSlug: string
  subjectSlug: string
  count: number
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
  difficultyMix?: { easy: number; medium: number; hard: number }
  questionTypes?: string[]
  bnccSkillIds?: string[]
}
```

Resposta:

```ts
{
  requestId: string
  reusedCount: number
  generatedCount: number
  items: QuestionBankQuestionDTO[]
}
```

### 12.3 Endpoint de listagem

```txt
GET /api/v1/question-bank/questions
```

Filtros:

- grade
- subject
- difficulty
- type
- status
- bnccSkillId
- page
- limit

### 12.4 Endpoint de feedback

```txt
POST /api/v1/question-bank/questions/:id/feedback
```

Input:

```ts
{
  rating: 'positive' | 'negative'
  reason?: string
  comment?: string
}
```

### 12.5 Endpoints admin

```txt
GET /api/v1/admin/question-bank/questions
GET /api/v1/admin/question-bank/questions/:id
PUT /api/v1/admin/question-bank/questions/:id/status
GET /api/v1/admin/question-bank/coverage
```

No MVP, edicao completa de payload pode ficar fora. Status e revisao ja resolvem o essencial.

### 12.6 Exportacao no MVP

Endpoints MVP:

```txt
POST /api/v1/question-bank/requests/:id/export/docx
POST /api/v1/question-bank/requests/:id/export/google-docs
```

Comportamento:

- `docx`: gera arquivo conforme **preview selecionado pelo professor** (ordem + subconjunto de questoes), com capa simples, enunciados, espaco de resposta e gabarito opcional em secao separada.
- `google-docs`: cria documento em pasta configurada, com link de retorno.

Dependencias:

- reutilizar `src/lib/export` para `docx` quando possivel;
- encapsular cliente Google em `src/lib/question-bank/services/question-bank-google-docs-service.ts`.

---

## 13. Algoritmo de Busca e Geracao

### 13.1 Entrada

O servico recebe:

- `userId`
- `gradeSlug`
- `subjectSlug`
- `count`
- dificuldade ou mix
- tipos opcionais
- habilidades opcionais

### 13.2 Resolucao de taxonomia

1. Resolver `Grade` por slug.
2. Resolver `Subject` por slug.
3. Confirmar que o ano pertence ao Fundamental 2.
4. Confirmar que a disciplina esta no escopo MVP.
5. Buscar habilidades BNCC elegiveis para `gradeId + subjectId`.

### 13.3 Consulta ao banco

Buscar questoes com:

- `status in (APPROVED_TEACHER, APPROVED_AI)`
- `archivedAt = null`
- mesmo ano/disciplina
- dificuldade pedida
- tipo permitido
- habilidade BNCC quando informada

Ordenacao recomendada:

1. `APPROVED_TEACHER`
2. maior razao positiva
3. menor `flaggedCount`
4. menor `usageCount` para variar resultados
5. mais recentes como criterio final

### 13.4 Calculo de deficit

Se `available >= requestedCount`, retornar do banco.

Se `available < requestedCount`, gerar apenas:

```txt
deficit = requestedCount - available
```

### 13.5 Geracao

Gerar questoes por habilidade BNCC elegivel, distribuindo:

- dificuldade;
- tipos permitidos;
- habilidades com menor cobertura;
- evitando duplicacao por `fingerprint`.

### 13.6 Validacao antes de persistir

Cada questao gerada deve passar por:

1. schema Zod do tipo;
2. validacao de template permitido;
3. validacao de disciplina/ano escopo;
4. validacao de BNCC vinculada;
5. validacao de dificuldade;
6. fingerprint para deduplicacao;
7. reviewer Mastra ou regra deterministica de consistencia;
8. persistencia com `APPROVED_AI` ou `DRAFT_AI`.

No MVP, a regra recomendada e persistir como `APPROVED_AI` apenas se o reviewer nao apontar erro alto. Caso contrario, `DRAFT_AI` ou `REJECTED`.

---

## 14. Mastra

### 14.1 Nova area Mastra

Criar agente/fluxo proprio:

```txt
src/mastra/agents/question-bank/
  index.ts
  shared/schemas.ts
  shared/template-catalog.ts
  shared/skills.ts
  planner/
  writer/
  reviewer/
  orchestrators/generate-question-bank-items.ts
```

Observacao obrigatoria para implementacao:

- antes de alterar codigo Mastra, consultar a skill `mastra`;
- verificar APIs instaladas em `node_modules/@mastra`;
- registrar export em `src/mastra/index.ts`.

### 14.2 Responsabilidades

Planner:

- recebe recorte curricular;
- escolhe habilidades BNCC e distribuicao de tipos/dificuldades;
- evita tipos proibidos por disciplina.

Writer:

- gera questoes em JSON estruturado;
- nao gera HTML;
- respeita payload schemas.

Reviewer:

- valida alinhamento BNCC;
- valida dificuldade;
- detecta ambiguidade;
- confere gabarito;
- marca severidade de problemas.

### 14.3 Contrato de saida

Saida do Mastra deve ser uma lista:

```ts
{
  questions: Array<{
    type: QuestionBankQuestionType
    difficulty: QuestionBankDifficulty
    prompt: string
    instruction?: string
    payload: unknown
    answerKey: unknown
    explanation?: string
    rubric?: unknown
    bnccSkillCodes: string[]
  }>
  contexts?: Array<{
    title: string
    body: string
    source?: string
    questionIndexes: number[]
  }>
}
```

### 14.4 Relacao com generate-resource-qa

O fluxo `generate-resource-qa` pode servir como referencia, mas nao deve ser usado diretamente como fonte final, porque ele ainda trabalha com `ResourcePlan`.

O banco de questoes precisa de:

- tipos fechados pelo arquivo `modelos-questoes-banco.html`;
- persistencia individual;
- feedback e status;
- reuso por recorte.

---

## 15. UI

### 15.1 Estrutura de rotas

Professora:

```txt
src/app/(dashboard)/question-bank/page.tsx
src/app/(dashboard)/question-bank/loading.tsx
```

Admin:

```txt
src/app/(dashboard)/admin/question-bank/page.tsx
src/app/(dashboard)/admin/question-bank/loading.tsx
```

### 15.2 Componentes

```txt
src/components/dashboard/question-bank/question-bank-filter-panel.tsx
src/components/dashboard/question-bank/question-bank-results.tsx
src/components/dashboard/question-bank/question-card.tsx
src/components/dashboard/question-bank/question-feedback-actions.tsx
src/components/dashboard/question-bank/question-answer-key.tsx
src/components/dashboard/question-bank/templates/
```

Templates React:

```txt
multiple-choice-question.tsx
multiple-select-question.tsx
true-false-question.tsx
fill-blank-question.tsx
matching-question.tsx
ordering-question.tsx
classification-question.tsx
open-text-question.tsx
short-answer-question.tsx
table-interpretation-question.tsx
reading-context.tsx
```

Os templates devem ser implementados em React usando o contrato visual do HTML aprovado.

### 15.3 Navegacao

Adicionar item no `AppSidebar`:

- titulo: `Banco de Questoes`
- href: `/question-bank`
- icone sugerido: `ClipboardList`, `ListChecks` ou `FileQuestion`

Admin:

- adicionar item em Administracao, se necessario.

### 15.4 Layout da pagina da professora

Topo:

- titulo: `Banco de Questoes`
- subtitulo curto: `Monte listas a partir de questoes reutilizaveis e alinhadas a BNCC.`

Filtros:

- ano;
- disciplina;
- quantidade;
- dificuldade;
- tipos avancados;
- habilidade BNCC avancada.

Resultado:

- resumo: `8 questoes encontradas no banco, 2 geradas agora`;
- lista renderizada;
- acoes por questao.

### 15.5 Nao transformar em landing page

A primeira tela deve ser a ferramenta de selecao e resultado, nao uma pagina explicativa.

---

## 16. Exportacao e Relacao com Resources

No MVP, exportacao `docx` e Google Docs faz parte do escopo.

Nao faz parte do MVP transformar o resultado em `Resource`.

Futuro possivel:

- salvar uma selecao como `QuestionSet`;
- exportar PDF;
- transformar uma lista em `Resource` editorial;
- montar prova com cabecalho, gabarito e folha do professor.

Para nao bloquear esse futuro, os contratos de questao devem ser independentes de HTML e de `Resource`.

---

## 17. Permissoes

MVP:

- usuarios autenticados podem buscar/gerar questoes;
- feedback pertence ao usuario autenticado;
- admin/manager/editor podem acessar moderacao.

Permissao futura:

- adicionar `QuestionBank` em `PermissionSubject`.

Se o MVP precisar ser rapido, a API pode checar role diretamente como ja fazem algumas rotas, mas a implementacao ideal e extender `permissions.ts`.

---

## 18. Observabilidade e Metricas

Registrar:

- total de pedidos;
- questoes solicitadas;
- questoes retornadas do banco;
- questoes geradas por LLM;
- taxa de reuso;
- falhas de geracao;
- questoes por status;
- feedback positivo/negativo;
- cobertura por ano/disciplina/habilidade/dificuldade.

Metricas importantes:

```txt
reuseRate = reusedCount / returnedCount
generationRate = generatedCount / returnedCount
positiveRate = positiveCount / (positiveCount + negativeCount)
coverage = approvedQuestions / targetCoverage
```

---

## 19. Fases de Implementacao

### Fase 0 - Decisoes finais de produto

Entregaveis:

- aprovar nome da rota;
- aprovar lista final de templates MVP;
- aprovar se `table_interpretation` entra como questao ou bloco + questao;
- aprovar papel de `reading_context`;
- aprovar se questoes geradas entram como `APPROVED_AI` ou `DRAFT_AI`.

### Fase 1 - Base

Escopo:

- adicionar enums Prisma;
- converter `QuestionBankQuestionType` e `QuestionBankSource` para models com `code`, `name`, `description`;
- adicionar modelos Prisma;
- adicionar relacoes em `User`, `EducationLevel`, `Grade`, `Subject`, `BnccSkill`;
- criar migration;
- criar schemas Zod;
- criar tipos DTO;
- criar helpers de fingerprint;
- criar validadores por template.

Arquivos esperados:

```txt
prisma/schema.prisma
src/lib/question-bank/schemas/
src/lib/question-bank/types/
src/lib/question-bank/services/
```

Validacao:

- `npm run build`
- teste manual de Prisma Client gerado.

### Fase 2 - Servicos e API

Escopo:

- resolver taxonomia e escopo MVP;
- listar questoes;
- buscar questoes aprovadas;
- calcular deficit;
- registrar request;
- registrar feedback;
- endpoints publicos autenticados;
- endpoints admin basicos.
- endpoint `docx` recebe `questionIds[]` (selecionados no preview) e exporta exatamente esse conjunto na ordem enviada.

Arquivos esperados:

```txt
src/app/api/v1/question-bank/requests/route.ts
src/app/api/v1/question-bank/questions/route.ts
src/app/api/v1/question-bank/questions/[id]/feedback/route.ts
src/app/api/v1/admin/question-bank/questions/route.ts
src/app/api/v1/admin/question-bank/coverage/route.ts
src/app/api/v1/question-bank/requests/[id]/export/docx/route.ts
src/app/api/v1/question-bank/requests/[id]/export/google-docs/route.ts
```

Validacao:

- requests sem usuario retornam 401;
- filtros invalidos retornam 400;
- request sem deficit nao chama Mastra;
- feedback atualiza agregados.

### Fase 3 - Mastra

Escopo:

- criar `question-bank` agent/workflow;
- criar schemas de saida;
- criar template catalog fechado;
- implementar planner/writer/reviewer;
- implementar orquestrador de geracao de deficit;
- registrar export em `src/mastra/index.ts`;
- integrar com service.

Cuidados:

- consultar docs locais do Mastra antes de implementar;
- verificar modelos disponiveis com provider registry se escolher/alterar modelo;
- manter saida estruturada com `structuredOutput`;
- nao permitir tipos fora do MVP.

Validacao:

- gerar 3 questoes para cada disciplina MVP;
- validar Zod;
- validar persistencia;
- validar que `calculation` e `scale` nao aparecem.

### Fase 4 - UI da Professora

Escopo:

- criar pagina `/question-bank`;
- criar filtros;
- criar chamada `POST /requests`;
- renderizar templates React;
- exibir gabarito;
- implementar feedback rapido;
- adicionar item no sidebar.

Validacao:

- fluxo completo por disciplina;
- responsivo desktop/mobile;
- estados de loading/empty/error;
- nenhuma quebra visual com textos longos.

### Fase 5 - Admin e Qualidade

Escopo:

- criar `/admin/question-bank`;
- listar questoes por status;
- aprovar/rejeitar/sinalizar;
- painel de cobertura simples;
- ver feedbacks.

Validacao:

- role sem permissao nao acessa;
- status altera ranking de busca;
- questoes `FLAGGED` nao sao retornadas para professoras.

### Fase 6 - Exportacao futura

Pos-MVP:

- salvar `QuestionSet`;
- exportar PDF;
- gerar variacoes avancadas de gabarito do professor;
- transformar selecao em `Resource`;
- montar listas por habilidades especificas.

---

## 20. Riscos

### 20.1 Gabarito incorreto

Mitigacao:

- reviewer Mastra;
- schemas rigorosos;
- feedback rapido;
- status `FLAGGED`;
- admin review.

### 20.2 Banco crescer com questoes ruins

Mitigacao:

- ranking por feedback;
- nao priorizar `DRAFT_AI`;
- limitar geracao por deficit;
- coverage dashboard.

### 20.3 Duplicacao semantica

Mitigacao:

- fingerprint normalizado;
- evitar repetir mesma habilidade/tipo/dificuldade;
- futuramente adicionar similaridade textual.

### 20.4 Templates quebrando com texto longo

Mitigacao:

- limites por schema;
- renderizador React com truncamento controlado quando necessario;
- testes visuais nos templates.

### 20.5 Ciencias gerar questao visual

Mitigacao:

- catalogo fechado;
- prompt proibindo diagrama, imagem, grafico real e calculo;
- reviewer rejeitando dependencia visual.

---

## 21. Questoes em Aberto

1. O nome publico sera `Banco de Questoes`, `Questoes` ou `Atividades`?
2. A rota deve ser em ingles (`/question-bank`) ou portugues (`/banco-questoes`)?
3. Questao gerada e aprovada automaticamente deve entrar como `APPROVED_AI` ou `DRAFT_AI`?
4. `table_interpretation` deve ser uma questao unica ou um bloco de tabela com questoes vinculadas?
5. A professora pode salvar um conjunto ja no MVP ou apenas gerar/usar/copiar?
6. Usuarios free podem gerar deficit com LLM ou apenas usar banco existente?

---

## 22. Criterios de Aceite MVP

1. Professora autenticada consegue pedir questoes de Fundamental 2 para Lingua Portuguesa, Historia, Geografia ou Ciencias.
2. O sistema retorna questoes existentes antes de gerar novas.
3. Quando falta cobertura, o sistema gera apenas o deficit.
4. Toda questao persistida tem ano, disciplina, dificuldade, tipo, BNCC, payload, gabarito e status.
5. Nenhuma questao de Matematica e gerada no MVP.
6. Nenhum tipo `calculation` ou `scale` e retornado no MVP.
7. Professora consegue avaliar questao como boa ou problematica.
8. Feedback negativo impede ou reduz prioridade da questao nas proximas buscas.
9. Admin consegue listar questoes e filtrar por status.
10. `npm run build` passa.
