# Planner — Planos de Aula a Partir de Recursos

**Versão:** 0.1 — PRD Inicial  
**Data:** 2026-04-21  
**Status:** Draft  
**Prioridade:** Alta

---

## 1. Visão Geral

Implementar um planner simples para professoras criarem **planos de aula formais a partir de um recurso existente**.

O fluxo principal nasce no detalhe do recurso: a professora acessa um material, clica em **Criar plano de aula**, informa poucos parâmetros e recebe um plano estruturado, salvo em `/planner`, com exportação em PDF e DOCX.

Este PRD não propõe restaurar a feature antiga completa de `lesson-plans`. A ideia é reaproveitar partes boas do checkpoint legado, especialmente schema de conteúdo, viewer e exportação, mas substituir o wizard complexo por um fluxo guiado pelo próprio recurso.

---

## 2. Problema

O recurso já tem informações pedagógicas importantes:
- título e descrição;
- etapa, série e disciplina;
- objetivos;
- passo a passo;
- habilidades BNCC;
- arquivos e imagens.

Mesmo assim, a professora ainda precisa transformar mentalmente esse material em uma aula completa: preparação, abertura, tempo por etapa, mediação, fechamento, avaliação e adaptações.

A feature antiga de planos de aula resolvia parte disso, mas exigia muitas escolhas manuais e podia consumir mais tokens por depender de seleção de habilidades e geração a partir de um contexto mais aberto.

---

## 3. Objetivos

- Criar plano de aula com poucos cliques a partir de um recurso.
- Reaproveitar dados pedagogicos ja cadastrados no recurso.
- Evitar busca vetorial e wizard complexo no MVP.
- Salvar planos em uma area propria: `/planner`.
- Permitir exportacao em PDF e DOCX para uso offline e edicao.
- Manter modelagem extensivel para, no futuro, tambem criar planos manuais.

---

## 4. Nao Objetivos

- Nao recriar o fluxo antigo completo de `/lesson-plans`.
- Nao implementar busca vetorial de BNCC no MVP.
- Nao pedir que a professora selecione habilidades manualmente se o recurso ja tiver BNCC vinculada.
- Nao criar calendario semanal no MVP.
- Nao editar o plano inteiro em modo rich text no MVP.
- Nao permitir colaboracao entre professoras no MVP.

---

## 5. Principio de Produto

O produto nao deve pedir para a professora "criar do zero".

O fluxo correto e:

> "Pegue este material que eu ja escolhi e transforme em um plano de aula editavel/exportavel."

O recurso e a fonte. O plano e o documento final que a professora pode guardar, exportar e adaptar.

---

## 6. UX Proposta

### 6.1 No detalhe do recurso

**Localização:** Transformar o botão "Planejar" existente em `ResourceActionSidebar.tsx` (linha 165-176)

Ao clicar em "Criar plano de aula", abrir dialog/drawer com:

- Duração:
  - `30 min`
  - `50 min`
  - `2 aulas`
- Tipo de uso:
  - `Aula completa`
  - `Revisão`
  - `Atividade em grupo`
  - `Avaliação diagnóstica`
  - `Tarefa`
- Observação opcional:
  - texto curto da professora, por exemplo "turma com dificuldade em leitura".

Ao confirmar:

- gerar plano com IA (chamada síncrona, ~10-30 segundos)
- salvar no banco com `status = GENERATED`
- redirecionar para `/planner/[id]` (sucesso imediato, sem polling)

### 6.2 Em `/planner`

Listar planos da professora:

- titulo;
- recurso de origem;
- serie/disciplina;
- tipo de uso;
- duracao;
- data de criacao;
- acoes: visualizar, exportar, arquivar.

Filtros MVP:

- busca por titulo;
- serie;
- disciplina;
- recurso de origem;
- arquivados/ativos.

### 6.3 Em `/planner/[id]`

Visualizar plano em formato de documento:

- Dados do plano;
- Objetivo da aula;
- BNCC;
- Materiais;
- Preparacao;
- Desenvolvimento;
- Fechamento;
- Avaliacao;
- Adaptacoes;
- Observacoes da professora.

Acoes:

- `Exportar PDF`;
- `Exportar DOCX`;
- `Copiar texto`;
- `Arquivar`.

---

## 7. Modelagem de Dados

### 7.1 Decisao principal

Criar uma entidade generica `LessonPlan`, com `sourceResourceId` opcional.

Racional:

- O plano pertence a professora e ao planner, nao ao recurso.
- O recurso e a origem, nao a entidade principal.
- Futuramente podemos criar planos manuais com `origin = MANUAL`.
- `/planner` lista `LessonPlan` por `userId`.
- O detalhe do recurso pode mostrar planos ja criados a partir daquele material.

### 7.2 Schema proposto

```prisma
enum LessonPlanOrigin {
  RESOURCE
  MANUAL
}

enum LessonPlanStatus {
  GENERATED
  FAILED
  ARCHIVED
}

enum LessonPlanMode {
  FULL_LESSON
  REVIEW
  GROUP_ACTIVITY
  DIAGNOSTIC
  HOMEWORK
}

model LessonPlan {
  id               String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String           @db.Uuid
  sourceResourceId String?          @db.Uuid

  title            String
  status           LessonPlanStatus @default(GENERATED)
  origin           LessonPlanOrigin @default(RESOURCE)
  mode             LessonPlanMode

  educationLevelId String?          @db.Uuid
  subjectId        String?          @db.Uuid
  gradeId          String?          @db.Uuid

  durationMinutes  Int
  classCount       Int?
  teacherNote      String?          @db.Text

  content          Json
  sourceSnapshot   Json
  generationMeta   Json?

  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  archivedAt       DateTime?

  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  sourceResource   Resource?        @relation(fields: [sourceResourceId], references: [id], onDelete: SetNull)
  educationLevel   EducationLevel?  @relation(fields: [educationLevelId], references: [id], onDelete: SetNull)
  subject          Subject?         @relation(fields: [subjectId], references: [id], onDelete: SetNull)
  grade            Grade?           @relation(fields: [gradeId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([userId, archivedAt])
  @@index([userId, sourceResourceId])
  @@index([sourceResourceId])
  @@index([educationLevelId])
  @@index([subjectId])
  @@index([gradeId])
  @@map("lesson_plan")
}
```

### 7.3 Relacoes a adicionar

```prisma
model User {
  lessonPlans LessonPlan[]
}

model Resource {
  lessonPlans LessonPlan[]
}

model EducationLevel {
  lessonPlans LessonPlan[]
}

model Subject {
  lessonPlans LessonPlan[]
}

model Grade {
  lessonPlans LessonPlan[]
}
```

### 7.4 Snapshot do recurso

`sourceSnapshot` e obrigatorio para planos gerados a partir de recurso.

Motivo: o recurso pode mudar depois. O plano salvo nao deve mudar silenciosamente quando alguem editar descricao, objetivos, passos ou BNCC do recurso.

Formato esperado:

```json
{
  "resourceId": "uuid",
  "title": "Frações equivalentes",
  "description": "...",
  "educationLevel": { "id": "uuid", "name": "Ensino Fundamental" },
  "grades": [{ "id": "uuid", "name": "4º ano" }],
  "subject": { "id": "uuid", "name": "Matemática" },
  "objectives": [{ "id": "uuid", "text": "...", "order": 1 }],
  "steps": [{ "id": "uuid", "title": "...", "content": "...", "order": 1 }],
  "bnccSkills": [{ "code": "EF04MA09", "description": "..." }],
  "files": [{ "id": "uuid", "name": "Atividade.pdf", "fileType": "pdf" }]
}
```

### 7.5 Conteudo do plano

`content` fica em JSON porque e documento pedagogico semiestruturado. Campos usados em filtro/listagem ficam em colunas.

Schema conceitual:

```ts
type LessonPlanContent = {
  overview: string
  objective: string
  bncc: Array<{ code: string; description: string }>
  materials: string[]
  preparation: string[]
  flow: Array<{
    title: string
    durationMinutes: number
    teacherActions: string[]
    studentActions: string[]
    useResourceStepIds?: string[]
  }>
  assessment: {
    evidence: string[]
    quickCheck: string
  }
  adaptations: {
    lessTime: string
    moreDifficulty: string
    groupWork: string
  }
  teacherNotes: string
}
```

---

## 8. Estratégia de IA

### 8.1 Arquitetura

Usar **Vercel AI SDK v6** (`ai@6.0.6`, já instalado) com **chamada síncrona direto na rota** — sem background jobs.

**Fluxo MVP:**
1. Usuário clica "Criar plano de aula" → POST `/api/v1/resources/[id]/lesson-plans`
2. Rota monta contexto do recurso
3. Rota chama `generateObject()` com Vercel AI SDK (Anthropic ou OpenAI)
4. Resposta validada contra schema Zod
5. Rota salva `LessonPlan` com `status = GENERATED`, `content = {...}`
6. Retorna 201 com redirect URL → `/planner/[id]`
7. Frontend navega direto (sem polling)

**Timing esperado:**
- Chamada IA: 10–30 segundos (visível no UI com loading spinner)
- Sem timeout risk (recursos típicos: 5–20 steps)
- Simples, sem complexidade infra

**Escalabilidade futura:**
- Se timeout virar problema (recursos > 50 steps), migra para async com Inngest
- Mas MVP não precisa disso

### 8.2 Entrada para o modelo

Montar contexto apenas com dados já conhecidos (sem busca vetorial):

```ts
type GenerateLessonPlanInput = {
  resourceId: string
  resourceSnapshot: {
    title: string
    description: string
    educationLevel: { id: string; name: string }
    grades: Array<{ id: string; name: string }>
    subject: { id: string; name: string }
    objectives: Array<{ id: string; text: string; order: number }>
    steps: Array<{ id: string; title: string; content: string; order: number }>
    bnccSkills: Array<{ code: string; description: string }>
    files?: Array<{ id: string; name: string; fileType: string }>
  }
  durationMinutes: number
  mode: LessonPlanMode  // FULL_LESSON | REVIEW | GROUP_ACTIVITY | DIAGNOSTIC | HOMEWORK
  teacherNote?: string
}
```

### 8.3 Prompt e validação

**Regra de geração:** IA deve transformar o recurso em plano, não inventar outro recurso.

**Prompt base:**

```
Com base exclusivamente no recurso fornecido abaixo, crie um plano de aula prático e formal em {{durationMinutes}} minutos.

**Recurso:**
- Título: {{title}}
- Descrição: {{description}}
- Série/Etapa: {{grade}} / {{educationLevel}}
- Disciplina: {{subject}}
- Objetivos: {{objectives}}
- Passo a passo: {{steps}}
- Habilidades BNCC: {{bnccSkills}}

**Modo de uso:** {{mode}}
**Observação da professora:** {{teacherNote || 'Nenhuma'}}

**Requisitos:**
1. Preserve exatamente os objetivos, BNCC e passo a passo do recurso.
2. Organize o uso do material em uma aula real com: preparação (5-10 min), desenvolvimento (usando os passos), fechamento (5 min), avaliação e adaptações.
3. Distribua o tempo total ({{durationMinutes}} min) entre as etapas.
4. Não invente habilidades BNCC além das fornecidas.
5. Responda em JSON estruturado conforme o schema fornecido.
```

### 8.4 Saída estruturada (Zod + `generateObject`)

Usar `generateObject` do Vercel AI SDK com schema Zod:

```ts
const lessonPlanContentSchema = z.object({
  overview: z.string().describe('Síntese da aula em 2-3 frases'),
  objective: z.string().describe('Objetivo geral da aula (replicar do recurso)'),
  bncc: z.array(
    z.object({
      code: z.string(),
      description: z.string(),
    })
  ).describe('Habilidades BNCC (replicar do recurso)'),
  materials: z.array(z.string()).describe('Materiais necessários (do recurso + preparação)'),
  preparation: z.array(z.string()).describe('O que preparar antes da aula'),
  flow: z.array(
    z.object({
      title: z.string().describe('Nome da etapa (ex: Abertura, Desenvolvimento, Fechamento)'),
      durationMinutes: z.number().int().min(1),
      teacherActions: z.array(z.string()).describe('O que o professor faz'),
      studentActions: z.array(z.string()).describe('O que os alunos fazem'),
      useResourceStepIds: z.array(z.string()).optional().describe('IDs dos passos do recurso usados aqui'),
    })
  ),
  assessment: z.object({
    evidence: z.array(z.string()).describe('Como observar se os alunos aprenderam'),
    quickCheck: z.string().describe('Uma pergunta rápida para verificar compreensão'),
  }),
  adaptations: z.object({
    lessTime: z.string().describe('Se sobrar pouco tempo, o que priorizar'),
    moreDifficulty: z.string().describe('Como aumentar o nível de dificuldade'),
    groupWork: z.string().describe('Como adaptar para trabalho em grupos'),
  }),
  teacherNotes: z.string().describe('Notas adicionais para o professor'),
})

type LessonPlanContent = z.infer<typeof lessonPlanContentSchema>
```

**Benefícios:**
- Validação automática pós-geração
- TypeScript type safety
- Erro claro se IA retornar formato inválido
- Compatível com exportação PDF/DOCX

---

## 9. APIs

### 9.1 Criar plano a partir do recurso

`POST /api/v1/resources/[resourceId]/lesson-plans`

Body:

```json
{
  "durationMinutes": 50,
  "mode": "FULL_LESSON",
  "teacherNote": "Turma com dificuldade em leitura"
}
```

Resposta:

```json
{
  "id": "uuid",
  "redirectUrl": "/planner/uuid"
}
```

### 9.2 Listar planos

`GET /api/v1/planner`

Query params:

- `q`;
- `gradeId`;
- `subjectId`;
- `sourceResourceId`;
- `includeArchived`;
- `limit`;
- `cursor`.

### 9.3 Detalhar plano

`GET /api/v1/planner/[id]`

Regra:

- usuario ve apenas seus proprios planos;
- admin pode visualizar qualquer plano para suporte/moderacao.

### 9.4 Arquivar plano

`PATCH /api/v1/planner/[id]`

Body:

```json
{ "archived": true }
```

### 9.5 Exportar

`GET /api/v1/planner/[id]/export/pdf`  
`GET /api/v1/planner/[id]/export/docx`

---

## 10. Permissoes

Criar e listar planos deve exigir usuario autenticado com assinatura ativa.

Regra atual do produto:

- acesso por assinatura;
- admin tem privilegios administrativos;
- nao usar ACL por recurso como criterio principal.

Implementacao recomendada:

- `isActiveSubscription(userId) || isAdmin(userId)`;
- nao depender apenas de `User.role === subscriber`, porque o modelo atual esta migrando para assinatura como fonte de acesso.

---

## 11. Reaproveitamento do Checkpoint Legado

Reaproveitar:

- `src/lib/export/pdf-template.tsx`;
- `src/lib/export/word-template.ts`;
- ideias do `PlanViewer`;
- schema Zod de plano;
- padrao de API client;
- logs de uso LLM;
- exportacao com `Content-Disposition`.

Nao reaproveitar diretamente:

- wizard antigo de 3 momentos;
- selecao manual de BNCC;
- busca de tema por IA;
- busca hibrida/vetorial de habilidades;
- paywall antigo baseado em role;
- visual antigo sem alinhamento com `docs/Kadernim`.

---

## 12. Plano de Implementação — MVP Simplificado

### Fase 1 — Schema, BD e serviços base

**Tempo estimado:** 2 dias  
**Arquivos a criar/modificar:**
- `prisma/schema.prisma` — adicionar model `LessonPlan`, enums, relações
- `src/lib/lesson-plans/schemas/lesson-plan-schemas.ts` — Zod schemas
- `src/lib/lesson-plans/services/lesson-plan-service.ts` — serviço
- Migration Prisma

**Tarefas:**
1. Adicionar enums (`LessonPlanOrigin`, `LessonPlanStatus`, `LessonPlanMode`)
2. Criar modelo `LessonPlan` com relações (User, Resource, Grade, Subject, EducationLevel)
3. Rodar migration `prisma migrate dev`
4. Criar `LessonPlanService.createFromResource()` — salva plano com conteúdo
5. Helper `buildResourceSnapshot()` — captura snapshot do recurso
6. Queries para listar/detalhar planos (com permission checks)

**Saída:** Schema pronto, testes de queries passando

---

### Fase 2 — Rota POST + Vercel AI SDK (Síncrono)

**Tempo estimado:** 2 dias  
**Arquivos a criar:**
- `src/app/api/v1/resources/[resourceId]/lesson-plans/route.ts` — POST criar plano
- `src/lib/lesson-plans/services/generate-content.ts` — chamada `generateObject()`
- `src/lib/lesson-plans/prompts/lesson-plan-prompt.ts` — template de prompt

**Tarefas:**
1. Criar handler POST:
   ```ts
   // 1. Validar auth + subscription
   // 2. Buscar resource + snapshot
   // 3. Chamar generateObject() com Vercel SDK
   // 4. Salvar LessonPlan com status GENERATED
   // 5. Retornar { id, redirectUrl: '/planner/[id]' }
   ```
2. Implementar `generateResourceLessonPlanContent()`:
   - Input: recurso + duração + modo + observação
   - Output: schema `LessonPlanContent` validado
   - Modelo: `openai('gpt-4o-mini')` ou `anthropic('claude-opus-4-7')`
   - Temperatura: 0.7
3. Testar com 2-3 fixtures (recursos reais do codebase)
4. Logar latência + tokens em `generationMeta` (opcional para MVP)

**Saída:** Rota funcional, testes com curl passando

---

### Fase 3 — APIs Listagem, Detalhe, Arquivar

**Tempo estimado:** 2 dias  
**Arquivos a criar:**
- `src/app/api/v1/planner/route.ts` — GET (listar)
- `src/app/api/v1/planner/[id]/route.ts` — GET (detalhe) + PATCH (arquivar)

**Tarefas:**

**GET `/api/v1/planner`:**
- Query params: `q`, `gradeId`, `subjectId`, `sourceResourceId`, `includeArchived`, `limit`, `offset`
- Filtrar por `userId`
- Retornar: lista de planos com metadados (título, origem, série, modo, duração, data, status)

**GET `/api/v1/planner/[id]`:**
- Validar ownership (user vê só seus planos, admin vê tudo)
- Retornar: plano completo (content, sourceSnapshot, metadata)

**PATCH `/api/v1/planner/[id]`:**
- Body: `{ archived: boolean }`
- Set `archivedAt` ou clear
- Retornar plano atualizado

**Saída:** Permissões funcionando, queries otimizadas

---

### Fase 4 — UI: Dialog "Criar plano de aula" em ResourceActionSidebar

**Tempo estimado:** 1-2 dias  
**Arquivos a criar/modificar:**
- `src/components/resources/lesson-plan-dialog.tsx` — novo componente dialog
- `src/components/design-system/resources/ResourceActionSidebar.tsx` — integrar dialog

**Tarefas:**
1. Criar componente `LessonPlanDialog`:
   - Estados: closed, loading, success, error
   - Opções: duração (30min / 50min / 2 aulas)
   - Opções: modo (Aula completa / Revisão / Atividade em grupo / Avaliação / Tarefa)
   - TextArea: observação opcional
   - Botão: "Criar" (POST a `/api/v1/resources/[id]/lesson-plans`, loading spinner)
   - On success: navigate `/planner/[id]`, toast "Plano criado! Redirecionando..."
   - On error: mostrar mensagem amigável (exemplo: "Não foi possível gerar o plano. Tente novamente.")

2. Modificar `ResourceActionSidebar.tsx`:
   - Substituir botão "Planejar" → "Criar plano de aula"
   - Abre `LessonPlanDialog` ao clicar
   - Manter estado de seleção visual (terracotta quando criando/criado)

3. Responsivo: drawer em mobile, dialog em desktop

**Saída:** Dialog funcional, botão integrado, navegação após sucesso

---

### Fase 5 — UI: `/planner` Listagem e Detalhe

**Tempo estimado:** 2-3 dias  
**Arquivos a criar:**
- `src/app/planner/page.tsx` — listagem
- `src/app/planner/[id]/page.tsx` — detalhe
- `src/components/planner/lesson-plan-card.tsx` — card
- `src/components/planner/lesson-plan-viewer.tsx` — renderização

**Tarefas:**

**Listagem:**
- Cards com: título, recurso origem, série/disciplina, modo, duração, data
- Status badge: checkmark (GENERATED), spinner (PENDING), erro (FAILED)
- Ações: botão "Visualizar", "Arquivar"
- Filtros: busca, série, disciplina, incluir arquivados (toggle)
- Empty state: "Crie seu primeiro plano de aula"

**Detalhe:**
- Se PENDING: spinner + "Gerando seu plano de aula..."
- Se GENERATED:
  - Header: título, recurso origem, série, disciplina
  - Seções renderizadas:
    - Objetivo
    - BNCC (lista de skills)
    - Materiais
    - Preparação (lista)
    - Desenvolvimento/Flow (timeline com durações)
    - Avaliação
    - Adaptações
    - Observações da professora
- Botões flutuantes/sticky:
  - Exportar PDF
  - Exportar DOCX
  - Copiar texto
  - Arquivar

**Saída:** UI polida, mobile-friendly, acessível

---

### Fase 6 — Exportação PDF e DOCX (Adaptar templates legados)

**Tempo estimado:** 1-2 dias  
**Arquivos a restaurar + adaptar:**
- `src/lib/export/pdf-template.tsx` — do git history (commit `1f28793~1`)
- `src/lib/export/word-template.ts` — do git history (commit `1f28793~1`)
- Rotas: `src/app/api/v1/planner/[id]/export/[format]/route.ts`

**Tarefas:**
1. Restaurar arquivos do git history
2. Adaptar templates para novo schema `LessonPlanContent`:
   - Renderizar seções (objetivo, BNCC, materiais, flow, avaliação, adaptações)
   - Respeitar duração total (distribuir entre etapas)
   - Manter styling Kadernim

3. Criar rotas:
   ```ts
   // GET /api/v1/planner/[id]/export/pdf
   // Renderizar PDF + stream com Content-Disposition: attachment
   
   // GET /api/v1/planner/[id]/export/docx
   // Gerar DOCX + stream
   ```

4. Testar:
   - PDF: quebras de página, tabelas, listas
   - DOCX: abrir em Word, Google Docs, mobile

**Saída:** Downloads funcionando, formatos corretos

---

### Timeline Final (MVP)

| Fase | Tempo | Bloqueadores |
|------|-------|--------------|
| 1 - Schema | 2 dias | Nenhum |
| 2 - IA Síncrona | 2 dias | Qual modelo (OpenAI vs Anthropic)? |
| 3 - APIs | 2 dias | Nenhum |
| 4 - Dialog UI | 1-2 dias | Design aprovado |
| 5 - Listagem/Detalhe | 2-3 dias | Componentes design system |
| 6 - Export | 1-2 dias | Git history acessível |
| **Total** | **~10-12 dias** | **~2 semanas** |

**Diferença da versão anterior:** -5 a -7 dias (sem Inngest, templates reutilizados)

---

## 13. Criterios de Aceitacao

- Usuario assinante consegue criar um plano a partir de um recurso.
- O plano gerado usa objetivos, passos e BNCC do recurso.
- O plano salvo aparece em `/planner`.
- O plano possui snapshot independente do recurso atual.
- Usuario nao consegue acessar plano de outro usuario.
- Admin consegue acessar para suporte.
- PDF e DOCX sao gerados com conteudo completo.
- Arquivar remove da listagem padrao sem apagar do banco.
- Build passa.

---

## 14. Metricas de Sucesso

- Taxa de clique em `Criar plano de aula` no detalhe do recurso.
- Taxa de geracao concluida com sucesso.
- Exportacoes por plano gerado.
- Planos criados por usuario ativo.
- Percentual de planos criados com observacao opcional.
- Tickets/suporte sobre "como usar este material".

---

## 15. Riscos e Mitigacoes

### Risco: IA duplicar o passo a passo

Mitigacao: prompt deve pedir para encaixar o passo a passo em uma aula completa, nao recria-lo.

### Risco: plano mudar quando recurso for editado

Mitigacao: `sourceSnapshot` obrigatorio.

### Risco: custo de IA crescer

Mitigacao: usar apenas dados do recurso, sem busca vetorial e sem etapa de refinamento no MVP.

### Risco: JSON virar deposito de dados consultaveis

Mitigacao: manter metadados de filtro em colunas (`userId`, `sourceResourceId`, `gradeId`, `subjectId`, `mode`, `durationMinutes`, `createdAt`, `archivedAt`).

### Risco: expectativa de edicao completa

Mitigacao: DOCX atende edicao no MVP; editor interno fica fora do escopo inicial.

---

## 16. Questões em Aberto

**Decisões técnicas:**

1. **Modelo de IA:** Usar OpenAI `gpt-4o-mini` (já setup) ou Anthropic Claude (muda provider)?
2. **Logging de tokens/custo:** Salvar em JSON `generationMeta` ou tabela separada `LlmUsageLog`?
3. **Retry strategy:** Quantas tentativas Inngest antes de marcar como FAILED?
4. **Exportação:** Começar com DOCX (simples/aberto) e PDF depois (v1.1)?

**Decisões de produto:**

5. O MVP deve permitir regenerar o plano ou criar um novo plano a cada tentativa?
6. O detalhe do recurso deve mostrar planos já criados com aquele material?
7. Devemos impor limite mensal de gerações ou deixar ilimitado para assinantes?
8. O plano deve poder ser tornado público/compartilhável no futuro?

---

## 17. Recomendações de Implementação

### 17.1 Arquitetura MVP

**Use Vercel AI SDK com chamada síncrona** (sem Inngest, sem background jobs).

**Por quê:**
- ✅ Tempo esperado: 10–30 segundos (aceitável para UI)
- ✅ Zero complexidade infra
- ✅ Rota simples: validação → IA → salva → retorna 201
- ✅ Sem timeouts esperados (recursos típicos < 50 steps)

**Modelo de IA:** Recomendado `openai('gpt-4o-mini')` (já setup, mais barato)

### 17.2 Scope do MVP v1.0

Implementar `LessonPlan` genérico e fluxo **criar a partir de recurso**.

**Incluir:**
- ✅ POST: criar plano via dialog no detalhe do recurso
- ✅ GET: listar planos com filtros (título, série, disciplina, origem)
- ✅ GET: detalhar plano
- ✅ PATCH: arquivar plano
- ✅ Export DOCX (templates restaurados do git history)
- ✅ Export PDF (templates restaurados do git history)
- ✅ Status visual (GENERATED, FAILED)
- ✅ UI: dialog simples, listagem, detalhe

**Excluir para v1.1+:**
- ❌ Regenerar plano (rever após feedback de usuárias)
- ❌ Planos públicos/compartilháveis (v2.0)
- ❌ Limite mensal de gerações (decisão pós-launch)
- ❌ Mostrar planos já criados no detalhe do recurso (nice-to-have)

### 17.3 Decisões Pendentes

1. **Modelo IA:** OpenAI `gpt-4o-mini` ou Anthropic Claude?
2. **Logging:** Salvar tokens/latência em `generationMeta`?
3. **Error handling:** Se IA falhar, retornar erro 500 ou salvar `status=FAILED`?

**Recomendação:** OpenAI (setup pronto), logging simples em JSON, error 500 (retry manual pelo usuário)
