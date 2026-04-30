# PRD: Motor Adaptativo de Composição Editorial para Apostilas em HTML/PDF

## 1. Resumo

O produto precisa evoluir de um gerador de conteúdo com paginação simples para um **motor de composição editorial adaptativo**, capaz de criar recursos didáticos visualmente consistentes, compactos, bonitos e prontos para impressão em lote.

Hoje o sistema gera bons blocos pedagógicos, mas o layout final ainda se comporta como um empacotador mecânico. Ele mede componentes, quebra páginas e exporta PDF. O resultado pode ficar pedagogicamente correto, mas editorialmente inaceitável, com páginas subutilizadas, desperdício de papel e sensação de material amador.

A ambição deve ser mais próxima de produtos como Gamma: o usuário dá uma ideia, documento ou intenção, e o sistema transforma isso em conteúdo estruturado, visualmente polido, responsivo ao formato e sem exigir trabalho manual de design. A Gamma se posiciona oficialmente como uma plataforma de criação com IA para apresentações, documentos, websites, social e gráficos, com foco em design sem necessidade de código ou experiência de design. ([Gamma][1]) Ela também destaca geração rápida, temas, layouts inteligentes, edição com IA, exportação e API para criação programática em escala. ([Gamma][1])

No nosso caso, o equivalente não é “slides bonitos”. É:

> **Apostilas pedagógicas geradas em lote, com qualidade visual de designer, densidade editorial inteligente e garantia de impressão eficiente.**

---

## 2. Problema

### 2.1 Problema observado

O sistema atual pode gerar materiais com páginas desperdiçadas. No exemplo enviado, o conteúdo ideal cabe em **3 páginas**, com texto base e conceitos na primeira, atividades 1 e 2 na segunda, atividades 3 e 4 na terceira. O HTML ideal demonstra que não é um problema de conteúdo excessivo, mas de composição e paginação. 

O comportamento atual gera risco real de rejeição pelas professoras, porque:

1. Desperdiça folhas.
2. Passa sensação de material mal diagramado.
3. Aumenta custo de impressão.
4. Reduz confiança no produto.
5. Torna geração em lote perigosa, pois erros visuais aparecem em escala.

### 2.2 Diagnóstico técnico

Pelo projeto enviado, o sistema já tem peças importantes:

1. `height-estimator.ts` para estimativa rápida.
2. `component-measurer.ts` para medição com Playwright.
3. `pdf-renderer.ts` com uma etapa de medição antes do PDF.
4. `paginator.ts` que achata o plano e repagina.
5. Agentes Mastra que geram, revisam e refinam o conteúdo.

O problema é que a composição final ainda é dominada por uma lógica de paginação sequencial. Ela mede alturas, mas não toma decisões editoriais sofisticadas.

Hoje o sistema responde:

> “Onde devo quebrar a página?”

Ele precisa responder:

> “Qual é a melhor composição possível para este recurso, dentro de limites pedagógicos, visuais e econômicos?”

---

## 3. Objetivos

### 3.1 Objetivo principal

Criar um **motor adaptativo de composição editorial** que transforme planos pedagógicos em apostilas HTML/PDF com qualidade visual consistente, baixo desperdício de página e comportamento confiável em lote.

### 3.2 Objetivos específicos

1. Reduzir desperdício de papel em recursos gerados automaticamente.
2. Evitar páginas com pouco conteúdo.
3. Evitar questões isoladas sem necessidade.
4. Adaptar densidade visual por ano, fase, disciplina e tipo de atividade.
5. Preservar qualidade pedagógica, sem cortar conteúdo essencial.
6. Permitir geração em lote com relatórios automáticos de qualidade.
7. Criar uma base para evolução futura parecida com um “design agent” editorial.

### 3.3 Não objetivos

1. Não reescrever todo o sistema Mastra.
2. Não substituir o Playwright.
3. Não depender exclusivamente de LLM para layout.
4. Não permitir que o layout altere habilidade BNCC, gabarito ou intenção pedagógica.
5. Não buscar sempre o menor número possível de páginas, se isso prejudicar legibilidade.

---

## 4. Princípios de produto

### 4.1 Qualidade editorial antes de exportação

PDF ruim não deve ser uma saída válida. O sistema pode tentar se adaptar várias vezes, mas só deve exportar quando a composição estiver dentro de padrões mínimos.

### 4.2 IA gera intenção, motor determinístico garante qualidade

Os agentes Mastra devem gerar conteúdo pedagógico, estrutura e intenção. O motor de layout deve decidir densidade, medição, paginação, compactação e aprovação.

### 4.3 Adaptação antes de bloqueio

O sistema não deve bloquear de primeira. Ele deve tentar perfis progressivos:

1. Confortável.
2. Balanceado.
3. Compacto.
4. Compacto seguro.
5. Revisão manual ou retry pedagógico.

### 4.4 Layout como produto, não como detalhe técnico

A diagramação é parte central da experiência. Para a professora, o PDF é o produto.

### 4.5 Consistência em lote

Dois recursos parecidos devem ter comportamento parecido. O sistema não pode depender de sorte, prompt ou improviso do agente.

---

## 5. Visão de experiência

### 5.1 Experiência desejada para geração unitária

O usuário pede um recurso. O sistema retorna:

```json
{
  "status": "approved",
  "pages": 3,
  "density": "balanced",
  "averageFill": 0.78,
  "worstPageFill": 0.62,
  "notes": [
    "Cabeçalho compacto aplicado após a primeira página",
    "Questões preservadas na ordem original",
    "Nenhuma página subutilizada"
  ]
}
```

### 5.2 Experiência desejada para geração em lote

O usuário pede 100 recursos. O sistema retorna um painel:

```json
{
  "total": 100,
  "approved": 71,
  "autoAdapted": 24,
  "needsReview": 5,
  "failed": 0
}
```

Cada recurso tem relatório:

```json
{
  "resourceId": "EF05HI04",
  "title": "Cidadania e Diversidade Cultural",
  "targetPages": 3,
  "generatedPages": 3,
  "selectedProfile": "balanced",
  "qualityScore": 91,
  "status": "autoAdapted"
}
```

### 5.3 Experiência desejada no editor

O editor deve mostrar:

1. Número de páginas.
2. Score de composição.
3. Pior página.
4. Motivos de adaptação.
5. Botão “Regenerar layout”.
6. Botão “Forçar mais compacto”.
7. Botão “Enviar para revisão pedagógica”.

---

## 6. Arquitetura proposta

### 6.1 Fluxo atual simplificado

```txt
Mastra gera conteúdo
↓
ResourcePlan
↓
Paginação
↓
HTML
↓
Playwright
↓
PDF
```

### 6.2 Novo fluxo proposto

```txt
Mastra gera conteúdo pedagógico
↓
ResourcePlan estruturado
↓
Normalizer
↓
Layout Policy Resolver
↓
Measurement Engine
↓
Adaptive Composition Engine
↓
Quality Evaluator
↓
Approved LayoutPlan
↓
HTML Renderer
↓
Playwright PDF Export
↓
Layout Report
```

### 6.3 Nova responsabilidade de cada camada

| Camada                      | Responsabilidade                                                               |
| --------------------------- | ------------------------------------------------------------------------------ |
| Mastra agents               | Gerar conteúdo pedagógico, revisar coerência, habilidade, gabarito e linguagem |
| Normalizer                  | Garantir ids, tipos, metadados, limites de linhas, componentes válidos         |
| Layout Policy Resolver      | Definir metas por fase, ano, disciplina e tipo de recurso                      |
| Measurement Engine          | Medir altura real dos componentes no DOM                                       |
| Adaptive Composition Engine | Testar estratégias de composição e escolher a melhor                           |
| Quality Evaluator           | Calcular score, detectar desperdício e aprovar ou rejeitar                     |
| Renderer                    | Renderizar HTML final já aprovado                                              |
| Playwright                  | Exportar PDF final, não decidir layout                                         |

---

## 7. Modelo conceitual

### 7.1 ResourcePlan

O `ResourcePlan` continua sendo o artefato principal, mas precisa carregar mais metadados.

```ts
type ResourcePlan = {
  id: string
  metadata: ResourceMetadata
  pages: PagePlan[]
  layout?: LayoutMetadata
}
```

### 7.2 Component

Cada componente precisa ter identidade estável.

```ts
type ComponentBase = {
  id: string
  type: string
  pedagogicalRole?: PedagogicalRole
  layoutHints?: ComponentLayoutHints
}
```

Exemplo:

```json
{
  "id": "q4",
  "type": "open_long",
  "pedagogicalRole": "assessment",
  "layoutHints": {
    "canShrink": true,
    "canSplit": false,
    "minLines": 6,
    "defaultLines": 8,
    "keepWithPrevious": false,
    "avoidAloneOnPage": true
  }
}
```

### 7.3 MeasuredComponent

```ts
type MeasuredComponent = {
  id: string
  type: Component['type']
  height: number
  width: number
  minHeight?: number
  maxHeight?: number
  canShrink: boolean
  canSplit: boolean
  pedagogicalWeight: number
}
```

### 7.4 LayoutAttempt

```ts
type LayoutAttempt = {
  profile: DensityProfile
  pages: PagePlanWithStats[]
  quality: LayoutQualityReport
  adaptations: LayoutAdaptation[]
}
```

### 7.5 LayoutQualityReport

```ts
type LayoutQualityReport = {
  status: 'approved' | 'auto_adapted' | 'needs_review' | 'failed'
  score: number
  targetPages: number
  generatedPages: number
  averageFillRatio: number
  worstPageFillRatio: number
  isolatedBlockCount: number
  lastPageFillRatio: number
  warnings: string[]
  errors: string[]
}
```

---

## 8. Políticas de layout

### 8.1 Policy por fase

```ts
type LayoutPolicy = {
  phase: PedagogicalPhase
  targetPages: number
  maxPages: number
  minAverageFill: number
  minWorstPageFill: number
  minLastPageFill: number
  allowedProfiles: DensityProfile[]
  answerLines: {
    openShort: { min: number; default: number; max: number }
    openLong: { min: number; default: number; max: number }
  }
  typography: {
    minFontScale: number
    maxFontScale: number
  }
  spacing: {
    minGapScale: number
    minPaddingScale: number
  }
}
```

### 8.2 Sugestão inicial por fase

| Fase | Perfil padrão | Perfis permitidos     | Preenchimento médio mínimo | Pior página mínima |    Open long |
| ---- | ------------: | --------------------- | -------------------------: | -----------------: | -----------: |
| 1    |   comfortable | comfortable, balanced |                        66% |                48% | 7 a 9 linhas |
| 2    |   comfortable | comfortable, balanced |                        68% |                50% | 7 a 8 linhas |
| 3    |      balanced | balanced, compact     |                        72% |                55% | 6 a 8 linhas |
| 4    |      balanced | balanced, compact     |                        75% |                58% | 5 a 7 linhas |
| 5    |       compact | compact               |                        78% |                60% | 5 a 6 linhas |

### 8.3 Target pages

A meta de páginas deve ser inferida, mas não cegamente.

```ts
function inferTargetPages(input: {
  phase: PedagogicalPhase
  questionCount: number
  readingBlockCount: number
  conceptBlockCount: number
  openLongCount: number
  currentBlueprintPages: number
}) {
  let score = 0

  score += input.readingBlockCount * 1.0
  score += input.conceptBlockCount * 0.35
  score += input.questionCount * 0.45
  score += input.openLongCount * 0.4

  if (input.phase === 'phase_1') score *= 1.18
  if (input.phase === 'phase_5') score *= 0.9

  const inferred = Math.ceil(score)

  return clamp(inferred, 2, Math.max(2, input.currentBlueprintPages))
}
```

Para recursos com 4 questões e um texto base moderado, a política deve mirar 3 páginas, como no caso de referência enviado. 

---

## 9. Motor adaptativo

### 9.1 Estratégia

O motor deve testar várias versões do mesmo recurso, sem alterar conteúdo pedagógico essencial.

Ordem recomendada:

1. `comfortable`
2. `balanced`
3. `compact`
4. `compact-safe`
5. Retry de estrutura com Mastra, se necessário
6. Revisão manual, se ainda falhar

### 9.2 Perfis de densidade

```ts
type DensityProfile = {
  name: 'comfortable' | 'balanced' | 'compact' | 'compact_safe'
  gapScale: number
  paddingScale: number
  fontScale: number
  answerLineScale: number
  allowCompactHeader: boolean
  allowMergeAdjacentConcepts: boolean
  allowCompactQuestionOptions: boolean
}
```

Sugestão:

```ts
const DENSITY_PROFILES = [
  {
    name: 'comfortable',
    gapScale: 1,
    paddingScale: 1,
    fontScale: 1,
    answerLineScale: 1,
    allowCompactHeader: true,
    allowMergeAdjacentConcepts: false,
    allowCompactQuestionOptions: false,
  },
  {
    name: 'balanced',
    gapScale: 0.88,
    paddingScale: 0.92,
    fontScale: 1,
    answerLineScale: 0.96,
    allowCompactHeader: true,
    allowMergeAdjacentConcepts: true,
    allowCompactQuestionOptions: false,
  },
  {
    name: 'compact',
    gapScale: 0.78,
    paddingScale: 0.84,
    fontScale: 0.97,
    answerLineScale: 0.92,
    allowCompactHeader: true,
    allowMergeAdjacentConcepts: true,
    allowCompactQuestionOptions: true,
  },
  {
    name: 'compact_safe',
    gapScale: 0.72,
    paddingScale: 0.8,
    fontScale: 0.95,
    answerLineScale: 0.9,
    allowCompactHeader: true,
    allowMergeAdjacentConcepts: true,
    allowCompactQuestionOptions: true,
  },
]
```

### 9.3 Adaptações permitidas

| Adaptação                                  | Permitida automaticamente? | Observação                    |
| ------------------------------------------ | -------------------------: | ----------------------------- |
| Cabeçalho compacto após a primeira página  |                        Sim | Já existe parcialmente        |
| Reduzir gap entre componentes              |                        Sim | Dentro da fase                |
| Reduzir padding dos cards                  |                        Sim | Dentro da fase                |
| Reduzir fonte até 95%                      |                        Sim | Só em perfis compactos        |
| Reduzir linhas de resposta                 |                        Sim | Respeitando mínimo pedagógico |
| Agrupar conceitos curtos                   |                        Sim | Se não quebrar clareza        |
| Compactar alternativas de múltipla escolha |                        Sim | Se legível                    |
| Reordenar questões                         |                        Não | Só com política explícita     |
| Remover questão                            |                        Não | Nunca automático              |
| Cortar texto base                          |                        Não | Só retry pedagógico           |
| Alterar gabarito                           |                        Não | Nunca                         |
| Alterar habilidade                         |                        Não | Nunca                         |

### 9.4 Scoring

O sistema deve escolher a melhor tentativa por score.

```ts
function scoreLayout(input: {
  generatedPages: number
  targetPages: number
  averageFill: number
  worstFill: number
  lastPageFill: number
  isolatedBlocks: number
  overflowCount: number
}) {
  let score = 100

  score -= Math.max(0, input.generatedPages - input.targetPages) * 35
  score -= Math.max(0, input.targetPages - input.generatedPages) * 4

  if (input.averageFill < 0.72) {
    score -= (0.72 - input.averageFill) * 80
  }

  if (input.worstFill < 0.52) {
    score -= (0.52 - input.worstFill) * 80
  }

  if (input.lastPageFill < 0.45) {
    score -= (0.45 - input.lastPageFill) * 60
  }

  score -= input.isolatedBlocks * 15
  score -= input.overflowCount * 40

  return Math.max(0, Math.round(score))
}
```

### 9.5 Critérios de aprovação

Um layout é aprovado quando:

1. `generatedPages <= targetPages`
2. `averageFillRatio >= minAverageFill`
3. `worstPageFillRatio >= minWorstPageFill`
4. Não há overflow.
5. Não há componente ilegível.
6. Não há questão isolada com página subutilizada.
7. Não há última página quase vazia.

---

## 10. Medição real dos componentes

### 10.1 Fonte da verdade

A fonte da verdade deve ser o navegador, via Playwright:

```ts
element.getBoundingClientRect().height
```

O sistema atual já mede elementos com wrappers `data-idx`. Isso deve evoluir para ids estáveis:

```html
<div
  data-component-id="q4"
  data-component-type="open_long"
>
  ...
</div>
```

### 10.2 Requisitos da medição

1. Esperar fontes carregarem.
2. Medir no mesmo width útil do PDF.
3. Medir header e footer separadamente.
4. Medir cada profile de densidade.
5. Guardar cache por hash do componente + profile.
6. Detectar diferenças entre estimativa e medição real.
7. Rodar medição final depois da paginação.

### 10.3 API proposta

```ts
type MeasurementInput = {
  components: Component[]
  phase: PedagogicalPhase
  subject: string
  profile: DensityProfile
}

type MeasurementOutput = {
  components: MeasuredComponent[]
  headerHeight: number
  footerHeight: number
}
```

---

## 11. Paginação

### 11.1 O que muda

O `paginator.ts` atual deve deixar de ser o único decisor. Ele vira uma função interna do motor adaptativo.

Em vez de:

```txt
flatten → pack greedy → return
```

O novo fluxo deve ser:

```txt
normalize → measure → compose → score → adapt → approve
```

### 11.2 Preservação de ordem

Por padrão, a ordem pedagógica deve ser preservada. O motor pode mover apenas elementos estruturais seguros, como divisores, quando isso não altera a leitura.

### 11.3 Regras de órfãos

O sistema deve evitar:

1. `divider_section` no final de página.
2. Questão aberta sozinha em página pouco preenchida.
3. Última página com menos de 45% de preenchimento.
4. Header + um componente pequeno + footer.
5. Separar instrução da questão.
6. Separar banco de palavras das frases no fill blank.
7. Separar texto base de uma fonte curta, quando houver fonte.

---

## 12. Integração com Mastra

### 12.1 Novo papel dos agentes

Os agentes não devem decidir pixel, gap ou quebra de página. Eles devem gerar conteúdo com metadados pedagógicos.

### 12.2 Campo novo: layout intent

O draft agent deve incluir:

```ts
type LayoutIntent = {
  expectedPages?: number
  densityPreference?: 'airy' | 'balanced' | 'compact'
  mustKeepTogether?: string[][]
  pedagogicalPriority?: Record<string, number>
}
```

### 12.3 Novo agente opcional: EditorialLayoutAgent

Esse agente não deve diagramar diretamente. Ele deve atuar quando o motor determinístico falhar.

Entrada:

```json
{
  "problem": "targetPagesExceeded",
  "targetPages": 3,
  "generatedPages": 4,
  "offendingBlocks": ["reading_1", "q4"],
  "allowedActions": [
    "shorten_reading_without_losing_core_ideas",
    "split_reading_into_shorter_paragraphs",
    "reduce_concept_count",
    "simplify_prompt"
  ],
  "forbiddenActions": [
    "remove_questions",
    "change_bncc_skill",
    "change_answer_key"
  ]
}
```

Saída:

```json
{
  "action": "rewrite_reading",
  "reason": "Texto base excede o orçamento editorial para recurso de 3 páginas",
  "updatedBlocks": [...]
}
```

### 12.4 Quando chamar o agente

Somente quando:

1. Todos os perfis seguros falharem.
2. O problema for conteúdo longo demais, não apenas espaçamento.
3. A política permitir retry pedagógico.
4. O recurso estiver em geração automática e não em edição manual.

---

## 13. Renderer e CSS

### 13.1 CSS parametrizado por profile

O HTML final deve receber variáveis de densidade:

```html
<html
  data-phase="3"
  data-subject="hist"
  data-density="balanced"
>
```

CSS:

```css
[data-density="balanced"] {
  --density-gap-scale: .88;
  --density-pad-scale: .92;
  --density-font-scale: 1;
}
```

Aplicação:

```css
.question {
  padding: calc(var(--pad) * var(--density-pad-scale));
}

.resource-page {
  gap: calc(var(--gap) * var(--density-gap-scale));
}

.q-prompt {
  font-size: calc(var(--fs-body) * var(--density-font-scale));
}
```

### 13.2 Modo medição e modo final

O renderizador deve suportar:

1. `measurement`
2. `preview`
3. `print`

```ts
type RenderMode = 'measurement' | 'preview' | 'print'
```

O modo `measurement` não deve ter sombra, shell, margem externa ou interferência de preview.

---

## 14. Quality Gate

### 14.1 Não é bloqueio inicial

O quality gate só roda depois das tentativas adaptativas.

### 14.2 Status possíveis

```ts
type LayoutStatus =
  | 'approved'
  | 'auto_adapted'
  | 'needs_review'
  | 'failed'
```

### 14.3 Regras

| Status       | Condição                                                           |
| ------------ | ------------------------------------------------------------------ |
| approved     | Passou no primeiro profile ou com adaptação mínima                 |
| auto_adapted | Passou após ajustes seguros                                        |
| needs_review | Melhor tentativa ainda viola regra leve                            |
| failed       | Overflow, erro estrutural, componente impossível ou violação grave |

### 14.4 Exemplo de saída

```json
{
  "status": "auto_adapted",
  "score": 89,
  "targetPages": 3,
  "generatedPages": 3,
  "selectedProfile": "compact",
  "averageFillRatio": 0.76,
  "worstPageFillRatio": 0.59,
  "adaptations": [
    "compact_header_after_first_page",
    "gap_scale_0_78",
    "padding_scale_0_84",
    "merged_adjacent_concepts"
  ]
}
```

---

## 15. Batch generation

### 15.1 Requisitos para lote

1. Cada recurso deve gerar relatório.
2. Recursos `approved` e `auto_adapted` podem seguir automaticamente.
3. Recursos `needs_review` entram numa fila.
4. Recursos `failed` não exportam PDF.
5. O sistema deve permitir retry automático limitado.
6. O painel deve mostrar principais causas de falha.

### 15.2 Dashboard de lote

Campos mínimos:

| Campo           | Descrição                                    |
| --------------- | -------------------------------------------- |
| Resource ID     | Identificador                                |
| Habilidade      | BNCC                                         |
| Ano             | Série                                        |
| Páginas alvo    | Meta                                         |
| Páginas geradas | Resultado                                    |
| Score           | Qualidade                                    |
| Status          | approved, auto_adapted, needs_review, failed |
| Motivo          | Principal alerta                             |
| Perfil          | Densidade usada                              |

### 15.3 Métricas agregadas

1. Média de páginas por recurso.
2. Percentual auto adaptado.
3. Percentual needs review.
4. Principais motivos de falha.
5. Economia estimada de páginas versus baseline.
6. Tempo médio de geração.
7. Tempo médio de medição.

---

## 16. Requisitos funcionais

### RF01: Medir componentes com ids estáveis

Todo componente renderizado deve possuir `data-component-id` e `data-component-type`.

### RF02: Criar políticas de layout por fase

O sistema deve resolver uma `LayoutPolicy` antes da paginação.

### RF03: Testar múltiplos perfis de densidade

O sistema deve testar perfis progressivos até encontrar layout aprovado.

### RF04: Gerar relatório de qualidade

Toda geração deve produzir `LayoutQualityReport`.

### RF05: Bloquear exportação apenas após falha adaptativa

O PDF só deve ser impedido se nenhum perfil seguro resolver.

### RF06: Preservar conteúdo pedagógico

O motor de layout não pode remover questões, alterar gabarito ou mudar habilidade.

### RF07: Suportar retry pedagógico controlado

Quando layout seguro falhar, o sistema pode pedir ao Mastra uma versão editorialmente mais compacta, com regras claras.

### RF08: Mostrar status no painel

A UI deve exibir status de layout e motivos.

### RF09: Cache de medições

A medição deve ser cacheada por hash de componente, fase, disciplina e profile.

### RF10: Compatibilidade com geração atual

O novo motor deve ser introduzido sem quebrar a API atual de geração.

---

## 17. Requisitos não funcionais

### Performance

1. Medição de um recurso deve ficar idealmente abaixo de 3 segundos.
2. Geração em lote deve paralelizar com limite de concorrência.
3. Cache deve reduzir custo em retries.

### Confiabilidade

1. Nenhum PDF deve sair com overflow.
2. Nenhum recurso deve perder componente durante adaptação.
3. O sistema deve logar todas as decisões.

### Observabilidade

Cada tentativa deve registrar:

1. Profile usado.
2. Alturas medidas.
3. Número de páginas.
4. Fill ratio por página.
5. Score.
6. Adaptações aplicadas.
7. Motivo de rejeição ou aprovação.

### Segurança pedagógica

1. Alterações de conteúdo só via agente pedagógico.
2. Alterações de layout não mudam semântica.
3. Respostas abertas respeitam mínimo por fase.

---

## 18. Plano de implementação

### Fase 1: Diagnóstico e relatório

Criar:

```txt
src/lib/resource/layout-quality.ts
src/lib/resource/layout-report.ts
```

Entregas:

1. `PagePlanWithStats`
2. `LayoutQualityReport`
3. Score de layout
4. Logs por página
5. Detecção de página vazia, última página fraca e bloco isolado

Critério de aceite:

```txt
O sistema consegue dizer que o exemplo ruim é ruim, antes de exportar.
```

### Fase 2: Medição com ids estáveis

Alterar renderizadores para incluir:

```html
data-component-id
data-component-type
```

Entregas:

1. Medição por id.
2. Cache simples.
3. Comparação estimado versus real.

Critério de aceite:

```txt
O sistema mede Q1, Q2, Q3, Q4 e sabe quanto cada bloco ocupa.
```

### Fase 3: Policies e normalização

Criar:

```txt
src/lib/resource/layout-policy.ts
src/lib/resource/layout-normalizer.ts
```

Entregas:

1. Política por fase.
2. Limites de linhas.
3. Target pages.
4. Normalização de componentes.

Critério de aceite:

```txt
Um recurso de 5º ano com 4 questões recebe alvo editorial coerente.
```

### Fase 4: Motor adaptativo

Criar:

```txt
src/lib/resource/adaptive-layout-engine.ts
```

Entregas:

1. Teste de profiles.
2. Scoring.
3. Seleção da melhor tentativa.
4. Status `approved`, `auto_adapted`, `needs_review`, `failed`.

Critério de aceite:

```txt
O sistema transforma automaticamente o caso ruim em uma versão de 3 páginas quando possível.
```

### Fase 5: Integração com PDF Renderer

Alterar:

```txt
src/lib/resource/pdf-renderer.ts
```

Entregas:

1. Medir.
2. Adaptar.
3. Validar.
4. Renderizar PDF apenas se aprovado ou auto adaptado.

Critério de aceite:

```txt
O PDF final sempre corresponde ao plano aprovado.
```

### Fase 6: Integração com Mastra retry

Alterar orchestrator de geração.

Entregas:

1. Retry pedagógico quando todos os perfis falharem.
2. Prompt objetivo para compactação editorial.
3. Limite de tentativas.

Critério de aceite:

```txt
Recursos longos demais são reescritos com segurança ou enviados para revisão.
```

### Fase 7: UI de lote

Entregas:

1. Painel de status.
2. Filtro por `needs_review`.
3. Visualização do relatório.
4. Botão de retry.
5. Botão de aprovar manualmente.

Critério de aceite:

```txt
Um lote de recursos pode ser auditado sem abrir PDF por PDF.
```

---

## 19. Critérios de aceite principais

### Caso de referência

Dado o recurso `EF05HI04` enviado:

1. O sistema deve reconhecer que 6 páginas é ruim.
2. O sistema deve tentar profiles adaptativos.
3. O sistema deve buscar composição de 3 páginas.
4. O sistema não deve remover a questão 4.
5. O sistema deve manter 6 a 8 linhas na questão aberta, conforme política.
6. O sistema deve exportar apenas se o layout passar no quality gate.

### Geração em lote

Dado um lote de 100 recursos:

1. Pelo menos 90% devem sair como `approved` ou `auto_adapted`.
2. Nenhum recurso `failed` deve gerar PDF final.
3. Todo recurso deve ter relatório.
4. O sistema deve permitir revisar apenas exceções.

---

## 20. Métricas de sucesso

### Produto

1. Redução de páginas desperdiçadas por recurso.
2. Aumento da taxa de PDFs aprovados sem revisão.
3. Redução de reclamações de layout.
4. Aumento de confiança na geração em lote.

### Técnica

1. Diferença média entre estimativa e medição real.
2. Tempo médio de layout adaptativo.
3. Taxa de cache hit de medições.
4. Percentual de retries pedagógicos.
5. Percentual de recursos bloqueados.

### Editorial

1. Média de preenchimento por página.
2. Pior preenchimento por recurso.
3. Frequência de questão isolada.
4. Frequência de última página subutilizada.
5. Distribuição de perfis usados.

---

## 21. Decisão recomendada

Eu não recomendo “só melhorar o paginator”. Isso resolve uma parte, mas não cria um produto robusto.

A recomendação é construir um **Adaptive Editorial Layout Engine** com três pilares:

1. **Medição real**
   Playwright mede o DOM e informa o tamanho real de cada componente.

2. **Adaptação progressiva**
   O sistema testa densidade, espaçamento, padding, cabeçalho compacto, linhas e agrupamentos seguros.

3. **Quality gate**
   O PDF só sai quando a composição passa no padrão mínimo.

Esse desenho mantém o Mastra onde ele é forte, que é geração pedagógica, e cria uma camada determinística para garantir qualidade visual em escala.

O resultado esperado é sair de:

```txt
Geramos conteúdo e torcemos para o PDF ficar bom.
```

para:

```txt
Geramos conteúdo, o motor compõe como um designer editorial e o PDF só sai aprovado.
```

[1]: https://gamma.app/?utm_source=chatgpt.com "Gamma | Best AI Presentation Maker & Website Builder"
