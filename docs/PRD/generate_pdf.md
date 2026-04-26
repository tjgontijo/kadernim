# PRD: Gerador Inteligente de Atividades Pedagógicas (PDF)

## 1. Visão

Construir uma engine que transforma inputs pedagógicos em apostilas diagramadas profissionalmente, prontas para impressão — sem intervenção de designers.

```
Usuário informa:       →   ano escolar + código de habilidade BNCC
Sistema infere:        →   área do conhecimento, componente curricular, descrição
LLM decide:            →   estrutura, conteúdo, tipos de atividade
Engine executa:        →   layout, diagramação, exportação PDF
```

---

## 2. Problema

Produção manual de atividades pedagógicas é:

| Problema | Impacto |
|---|---|
| Feita em Canva/Word | Não escala, sem padrão |
| Dependente de designer | Caro, lento |
| Inconsistente | Cada professor faz do seu jeito |
| Não reutilizável | Trabalho refeito a cada turma |
| Desconectada da BNCC | Difícil rastreabilidade pedagógica |

---

## 3. Solução

Separação clara de responsabilidades:

```
LLM        →  decisões pedagógicas + conteúdo
Engine     →  layout, validação, renderização, exportação
```

A LLM **nunca** toca em pixels. A engine **nunca** toca em pedagogia.

---

## 4. Público-alvo

| Perfil | Uso principal |
|---|---|
| Professor | Gera atividades rápidas para aula |
| Coordenador pedagógico | Cria material padronizado para escola |
| Editora educacional | Produção em lote por coleção |
| Edtech | Integra via API no seu produto |

---

## 5. Fluxo do usuário

A BNCC organiza assim: **Área → Componente → Habilidade**. O código da habilidade já carrega tudo — o sistema não precisa que o usuário informe disciplina separadamente.

```
1. Usuário seleciona:
   - Ano escolar (1º ao 9º)
   - Habilidade BNCC (ex: EF05CI04)
     ↳ Sistema infere automaticamente:
       · EF = Ensino Fundamental
       · 05 = 5º ano
       · CI = Ciências (componente curricular)
       · Área: Ciências da Natureza
       · Descrição: "Fotossíntese e cadeia alimentar"

2. Opcionalmente ajusta número de questões

3. Clica "Gerar atividade"

4. Sistema:
   └─ Parser BNCC extrai metadados do código
   └─ LLM gera PagePlan estruturado
   └─ Engine valida e organiza layout
   └─ Renderiza preview HTML

5. Usuário visualiza preview interativo

6. Aprova → exporta PDF
   ou
   Regenera → volta ao passo 3 (com novo seed)
   ou
   Edita conteúdo pontualmente (MVP+)
```

---

## 6. Arquitetura

```
Frontend (Next.js)
   │
   ├─ Formulário de input
   ├─ Preview interativo
   └─ Botão exportar
         │
         ▼
   API Route (Next.js)
         │
         ▼
   Orquestrador
   ├─ Constrói prompt (input + catálogo de componentes)
   ├─ Chama LLM (structured output via Zod)
   ├─ Valida resposta
   └─ Passa para engine
         │
         ▼
   Layout Engine
   ├─ AutoLayout (grid 12×18)
   ├─ Overflow Guard
   └─ Page Breaker
         │
         ▼
   Renderer
   ├─ Monta HTML/CSS
   └─ Playwright → PDF
```

---

## 7. Design System — Catálogo de Componentes

A LLM escolhe componentes **exclusivamente** deste catálogo. Componentes fora do catálogo são rejeitados na validação.

---

### 7.1 Estruturais (obrigatórios por página)

#### `page_header`
Cabeçalho da apostila. Aparece no topo de cada página.

```
┌─────────────────────────────────────────────────┐
│  [ícone disciplina]  TÍTULO DA ATIVIDADE         │
│  Disciplina • Ano • Habilidade BNCC              │
│  Prof: ___________  Aluno: _________  Data: ___  │
└─────────────────────────────────────────────────┘
```

- Posição: fixa no topo, cols 1–12, rows 1–3
- Conteúdo obrigatório: title, subject, year, bncc_code
- Conteúdo opcional: teacher_field, student_field, date_field, school_field

---

#### `page_footer`
Rodapé com informações pedagógicas e número de página.

```
┌─────────────────────────────────────────────────┐
│  Competência: [texto]  │  Habilidade: EF05MA01  │  Página 1/2  │
└─────────────────────────────────────────────────┘
```

- Posição: fixa no rodapé, cols 1–12, rows 17–18
- Conteúdo: bncc_skill, competency_area, page_number

---

### 7.2 Introdução e contexto

#### `activity_intro`
Bloco de contextualização antes das questões. Define o cenário do exercício.

```
┌─────────────────────────────────────────────────┐
│  Leia o texto abaixo e responda às questões:     │
│                                                  │
│  [Texto de até 600 chars ou imagem]              │
│                                                  │
│  Fonte: [opcional]                               │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 3 rows, max 12 cols × 6 rows
- Conteúdo: instruction_text (max 600 chars), body_text (max 1200 chars), source (opcional)
- Variantes: `text_only`, `image_only`, `text_with_image`

---

#### `concept_box`
Definição ou conceito-chave destacado visualmente. Usado para introduzir vocabulário ou teoria.

```
┌─────────────────────────────────────────────────┐
│  💡  CONCEITO                                   │
│  ─────────────────────────────────────────────  │
│  [Definição em até 300 chars]                   │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 2 rows, max 8 cols × 4 rows
- Cor de fundo: azul suave (padrão) ou cor da disciplina
- Conteúdo: term (max 60 chars), definition (max 300 chars)

---

#### `tip_box`
Dica de resolução ou orientação metodológica.

```
┌─────────────────────────────────────────────────┐
│  📌  DICA                                       │
│  ─────────────────────────────────────────────  │
│  [Dica em até 200 chars]                        │
└─────────────────────────────────────────────────┘
```

- Grid: min 3 cols × 2 rows, max 6 cols × 3 rows
- Conteúdo: tip_text (max 200 chars)

---

#### `vocabulary_box`
Lista de termos com definições curtas. Útil para línguas, ciências, história.

```
┌─────────────────────────────────────────────────┐
│  📖  VOCABULÁRIO                                │
│  ─────────────────────────────────────────────  │
│  • Fotossíntese: processo pelo qual...          │
│  • Clorofila: pigmento responsável por...       │
│  • Estômato: abertura na folha que...           │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 3 rows, max 8 cols × 6 rows
- Conteúdo: items[] onde cada item = { term, definition } (max 5 itens, definition max 80 chars)

---

### 7.3 Tipos de questão

**Princípio:** Tipos universais que funcionam em qualquer disciplina. O que muda é o conteúdo, não a estrutura.

Todos os tipos compartilham a estrutura base:

```ts
type BaseQuestion = {
  number: number          // numeração sequencial
  prompt: string          // enunciado (max 400 chars)
  instruction?: string    // instrução específica (max 100 chars)
}

type QuestionType =
  | "open_short"          // resposta curta (1–3 linhas)
  | "open_long"           // resposta longa (4+ linhas)
  | "multiple_choice"     // A/B/C/D (ou E)
  | "true_false"          // V/F afirmativas
  | "fill_blank"          // complete com banco de palavras
  | "complete_text"       // complete sem banco
  | "matching"            // ligar colunas
  | "ordering"            // numerar em sequência
  | "identify"            // identificar elemento em imagem/texto
  | "classify"            // classificar itens em categorias
  | "comprehension"       // questão interpretativa
  | "creation"            // produção criativa (texto, desenho, etc)
  | "problem_creation"    // criar um problema/questão
  | "reasoning"           // explicar raciocínio/justificar
  | "image_interpretation" // analisar imagem/foto
  | "diagram_analysis"    // interpretar diagrama
  | "infographic_reading" // ler infográfico
  | "comic_interpretation"// analisar tirinha/HQ
  | "map_reading"         // ler e interpretar mapa
```

---

#### `open_short`
Questão com alternativas A/B/C/D (ou E). Tipo mais comum em avaliações.

```
┌─────────────────────────────────────────────────┐
│  01. Qual é a capital do Brasil?                │
│                                                  │
│  (A) São Paulo                                  │
│  (B) Brasília                                   │
│  (C) Rio de Janeiro                             │
│  (D) Belo Horizonte                             │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 4 rows, max 12 cols × 7 rows
- Conteúdo: prompt (max 400 chars), options[] (min 3, max 5, cada option max 120 chars)
- Regra: opções devem ser mutuamente exclusivas

---

#### `question_open`
Questão discursiva com linhas de resposta.

```
┌─────────────────────────────────────────────────┐
│  02. Explique com suas palavras o que é...      │
│                                                  │
│  _______________________________________________  │
│  _______________________________________________  │
│  _______________________________________________  │
│  _______________________________________________  │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 4 rows, max 12 cols × 8 rows
- Conteúdo: prompt (max 400 chars), lines (min 2, max 8)

---

#### `question_true_false`
Lista de afirmativas para classificar como V ou F.

```
┌─────────────────────────────────────────────────┐
│  03. Marque V (verdadeiro) ou F (falso):        │
│                                                  │
│  (  )  A Terra é o maior planeta do sistema...  │
│  (  )  O Sol é uma estrela.                     │
│  (  )  A Lua tem atmosfera própria.             │
│  (  )  Plutão é considerado planeta.            │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 4 rows, max 12 cols × 8 rows
- Conteúdo: prompt (max 200 chars), statements[] (min 3, max 8, cada statement max 150 chars)

---

#### `question_fill_blank`
Texto com lacunas para completar. Usado em língua portuguesa, vocabulário, fórmulas.

```
┌─────────────────────────────────────────────────┐
│  04. Complete as lacunas com as palavras:       │
│  [ fotossíntese / clorofila / luz solar ]       │
│                                                  │
│  As plantas realizam _____________ usando a     │
│  _____________ e a _____________.               │
└─────────────────────────────────────────────────┘
```

- Grid: min 5 cols × 4 rows, max 12 cols × 7 rows
- Conteúdo: prompt (max 200 chars), word_bank[] (max 8 palavras), sentence_template (usa `___` para lacunas, max 600 chars)

---

#### `question_match_columns`
Conectar itens de duas colunas. Usado em datas/eventos, termos/definições, causas/efeitos.

```
┌─────────────────────────────────────────────────┐
│  05. Ligue cada elemento ao seu correspondente: │
│                                                  │
│  A. Raiz          (  ) Absorve luz solar        │
│  B. Caule         (  ) Absorve água e sais      │
│  C. Folha         (  ) Transporta seiva         │
└─────────────────────────────────────────────────┘
```

- Grid: min 6 cols × 4 rows, max 12 cols × 8 rows
- Conteúdo: prompt (max 200 chars), left_items[] (min 3, max 6, max 40 chars), right_items[] (mesmo tamanho, max 60 chars)
- Regra: left e right devem ter mesmo número de itens

---

#### `question_ordering`
Ordenar etapas, eventos ou palavras em sequência correta.

```
┌─────────────────────────────────────────────────┐
│  06. Numere os eventos em ordem cronológica:    │
│                                                  │
│  (  )  Proclamação da República                 │
│  (  )  Independência do Brasil                  │
│  (  )  Chegada dos portugueses                  │
│  (  )  Abolição da escravidão                   │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 4 rows, max 12 cols × 8 rows
- Conteúdo: prompt (max 200 chars), items[] (min 3, max 8, cada item max 120 chars)

---

#### `question_calculation`
Questão com espaço dedicado para desenvolvimento de conta/cálculo.

```
┌─────────────────────────────────────────────────┐
│  07. Resolva:  3x + 7 = 22  →  x = ?           │
│                                                  │
│  Desenvolvimento:                               │
│  ┌────────────────────────────────────────┐     │
│  │                                        │     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│  Resposta: ________________________________      │
└─────────────────────────────────────────────────┘
```

- Grid: min 5 cols × 5 rows, max 12 cols × 9 rows
- Conteúdo: prompt (max 300 chars), development_lines (min 4, max 10), has_answer_line: boolean

---

### 7.4 Enriquecimento visual

#### `timeline`
Linha do tempo horizontal ou vertical para eventos históricos ou sequências.

```
┌─────────────────────────────────────────────────┐
│  ●────────●────────●────────●────────●          │
│  1500     1822     1888     1889     2023        │
│  Chegada  Indep.   Abolição  Rep.   Hoje        │
└─────────────────────────────────────────────────┘
```

- Grid: min 8 cols × 3 rows, max 12 cols × 5 rows
- Conteúdo: events[] (min 3, max 7), cada event = { date: string, label: string (max 30 chars) }
- Variantes: `horizontal`, `vertical`

---

#### `data_table`
Tabela de dados simples para organizar informações.

```
┌─────────────────────────────────────────────────┐
│  País        │ Capital     │ Idioma              │
│ ─────────────┼─────────────┼───────────────────  │
│  Brasil      │ Brasília    │ Português           │
│  Argentina   │ Buenos Aires│ Espanhol            │
│  Chile       │ Santiago    │ Espanhol            │
└─────────────────────────────────────────────────┘
```

- Grid: min 6 cols × 3 rows, max 12 cols × 8 rows
- Conteúdo: headers[] (max 5 colunas, max 30 chars), rows[] (max 8 linhas, max 5 células, max 40 chars/célula)

---

#### `image_placeholder`
Reserva espaço para imagem com instrução para o professor inserir manualmente (MVP) ou URL futura.

```
┌─────────────────────────────────────────────────┐
│  ┌────────────────────────┐                     │
│  │   [Inserir imagem aqui]│  Observe a imagem   │
│  │   Mapa do Brasil       │  ao lado e responda │
│  └────────────────────────┘                     │
└─────────────────────────────────────────────────┘
```

- Grid: min 3 cols × 3 rows, max 8 cols × 8 rows
- Conteúdo: caption (max 80 chars), description (max 120 chars, instrução para professor)

---

#### `challenge_box`
Atividade extra para alunos que terminam antes. Diferenciado visualmente.

```
┌─────────────────────────────────────────────────┐
│  ⭐  DESAFIO                                    │
│  ═════════════════════════════════════════════  │
│  [Enunciado do desafio, max 400 chars]          │
│                                                  │
│  _______________________________________________  │
│  _______________________________________________  │
└─────────────────────────────────────────────────┘
```

- Grid: min 4 cols × 4 rows, max 12 cols × 8 rows
- Conteúdo: challenge_text (max 400 chars), lines (min 2, max 6)
- Visual: borda dourada, ícone estrela

---

#### `divider_section`
Divisor visual entre seções da apostila.

```
┌─────────────────────────────────────────────────┐
│  ───────────  PARTE 2: INTERPRETAÇÃO  ─────────  │
└─────────────────────────────────────────────────┘
```

- Grid: 12 cols × 1 row (fixo)
- Conteúdo: section_title (max 50 chars)

---

## 8. Escala de Maturidade Visual por Faixa Etária

O sistema adapta automaticamente identidade visual e linguagem com base no ano escolar. A escala vai de **muito infantil** (1º ano) a **jovem-adulto** (9º ano). Não existe um estilo único — cada faixa tem sua própria personalidade.

---

### 8.1 Faixas e perfis

| Faixa | Anos | Idade | Perfil |
|---|---|---|---|
| **Fase 1** | 1º–2º ano | 6–8 anos | Muito infantil: descoberta, brincar, mundo concreto |
| **Fase 2** | 3º–4º ano | 8–10 anos | Infantil com estrutura: já lê e escreve, mais organização |
| **Fase 3** | 5º ano | 10–11 anos | Transição: saindo do universo infantil, mais autonomia |
| **Fase 4** | 6º–7º ano | 12–13 anos | Pré-adolescente: quer ser levado a sério, menos fofice |
| **Fase 5** | 8º–9º ano | 13–15 anos | Jovem: identidade própria, estética mais sóbria |

---

### 8.2 Dimensões de adaptação

#### Tipografia

| Dimensão | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Fase 5 |
|---|---|---|---|---|---|
| Fonte | Nunito (arredondada) | Nunito | Nunito → Inter | Inter | Inter |
| Tamanho corpo | 16px | 15px | 14px | 13px | 13px |
| Tamanho enunciado | 20px Bold | 18px Bold | 16px Bold | 15px Bold | 14px Bold |
| Linhas de resposta | altura dupla | altura dupla | altura normal | altura normal | altura normal |
| Espaçamento entre linhas | 2.0 | 1.8 | 1.6 | 1.5 | 1.4 |

> **Por quê?** Crianças em alfabetização precisam de letras maiores, linhas mais espaçadas. A escrita ainda está se formando — espaço é funcional, não estético.

---

#### Estilo visual dos componentes

| Dimensão | Fase 1–2 | Fase 3 | Fase 4–5 |
|---|---|---|---|
| Bordas | muito arredondadas (24px radius) | arredondadas (12px) | levemente arredondadas (6px) |
| Traços/linhas | espessos (3px) | médios (2px) | finos (1px) |
| Ícones | ilustrados, cartoon, coloridos | flat coloridos | flat monocromáticos |
| Sombras | coloridas e pronunciadas | leves | quase sem sombra |
| Padrão de fundo | manchas de cor, texturas lúdicas | leve textura | neutro |
| Decorações | personagens, estrelas, balões | elementos geométricos | sem decoração |

---

#### Paleta de cores

| Fase | Saturação | Estilo |
|---|---|---|
| Fase 1–2 | Alta (cores primárias puras) | Vibrante, quase primário |
| Fase 3 | Média-alta | Viva mas harmonizada |
| Fase 4 | Média | Contemporânea |
| Fase 5 | Média-baixa | Sóbria, quase editorial |

A paleta por disciplina (seção 12) existe nas 5 variações de saturação. O sistema seleciona automaticamente com base na faixa.

---

#### Linguagem e instrução da LLM

| Dimensão | Fase 1 | Fase 2 | Fase 3 | Fase 4–5 |
|---|---|---|---|---|
| Instrução das questões | "Ligue os pontinhos:" / "Pinte:" / "Escreva o nome:" | "Escreva / Marque / Escolha:" | "Responda / Classifique:" | "Analise / Explique / Justifique:" |
| Vocabulário | Simples, concreto, cotidiano | Simples com novos termos explicados | Vocabulário ampliado | Vocabulário técnico da disciplina |
| Frases no enunciado | Curtas, uma ideia por vez (max 80 chars) | Médias (max 150 chars) | Médias-longas (max 250 chars) | Longas e complexas (max 400 chars) |
| Tom | Lúdico, encorajador ("Que legal!") | Encorajador mas direto | Direto | Acadêmico mas acessível |

---

#### Densidade por página

| Dimensão | Fase 1–2 | Fase 3 | Fase 4–5 |
|---|---|---|---|
| Questões por página | 2–3 | 3–4 | 4–6 |
| Elementos por página | max 4 | max 5 | max 7 |
| Espaço em branco | Muito (respira) | Médio | Compacto |
| Imagens/ilustrações | Sempre presente | Frequente | Quando necessário |

---

#### Tipos de questão por faixa

Nem todos os tipos de questão fazem sentido para todas as faixas:

| Tipo de questão | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Fase 5 |
|---|---|---|---|---|---|
| `question_multiple_choice` | Não (ainda aprendendo a ler) | Sim (simples) | Sim | Sim | Sim |
| `question_open` | Limitado (1–2 linhas) | Sim (3–4 linhas) | Sim | Sim | Sim (mais linhas) |
| `question_true_false` | Sim (V/F com imagem) | Sim | Sim | Sim | Sim |
| `question_fill_blank` | Sim (palavra única) | Sim | Sim | Sim | Menos comum |
| `question_match_columns` | Sim (com imagens) | Sim | Sim | Sim | Sim |
| `question_ordering` | Não | Sim (simples) | Sim | Sim | Sim |
| `question_calculation` | Limitado (contas simples) | Sim | Sim | Sim | Sim |
| `timeline` | Não | Sim (3–4 eventos) | Sim | Sim | Sim |
| `data_table` | Não | Não | Sim (simples) | Sim | Sim |
| `vocabulary_box` | Sim (1–3 palavras) | Sim | Sim | Sim | Sim |
| `challenge_box` | Sim (visual, simples) | Sim | Sim | Sim | Sim |

---

### 8.3 Como o sistema aplica

O ano escolar entra como parâmetro no input. O orquestrador:

1. Mapeia ano → faixa (1º–2º → Fase 1, etc.)
2. Injeta no prompt: perfil da faixa + restrições de tipos de questão + guia de linguagem
3. Passa a faixa para a engine de layout (tipografia, bordas, saturação)
4. A engine seleciona o tema visual correto do design system

```ts
type AgePhase = "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5"

function yearToPhase(year: string): AgePhase {
  const map: Record<string, AgePhase> = {
    "1": "phase_1", "2": "phase_1",
    "3": "phase_2", "4": "phase_2",
    "5": "phase_3",
    "6": "phase_4", "7": "phase_4",
    "8": "phase_5", "9": "phase_5",
  }
  return map[year]
}
```

---

## 9. Schema TypeScript

```ts
// ---- Estrutura BNCC ----

type KnowledgeArea =
  | "linguagens"
  | "matematica"
  | "ciencias_natureza"
  | "ciencias_humanas"
  | "ensino_religioso"

type SubjectComponent =
  | "lingua_portuguesa"   // LP — Linguagens
  | "arte"                // AR — Linguagens
  | "educacao_fisica"     // EF — Linguagens
  | "lingua_inglesa"      // LI — Linguagens (F2 em diante)
  | "matematica"          // MA — Matemática
  | "ciencias"            // CI — Ciências da Natureza
  | "historia"            // HI — Ciências Humanas
  | "geografia"           // GE — Ciências Humanas
  | "ensino_religioso"    // ER — Ensino Religioso

type BNCCSkill = {
  code: string            // ex: "EF05CI04"
  year: number            // 5
  component: SubjectComponent  // "ciencias"
  area: KnowledgeArea          // "ciencias_natureza"
  description: string     // "Fotossíntese e cadeia alimentar"
}

// ---- Layout ----

type ElementId =
  | "page_header"
  | "page_footer"
  | "activity_intro"
  | "concept_box"
  | "tip_box"
  | "vocabulary_box"
  | "question_multiple_choice"
  | "question_open"
  | "question_true_false"
  | "question_fill_blank"
  | "question_match_columns"
  | "question_ordering"
  | "question_calculation"
  | "timeline"
  | "data_table"
  | "image_placeholder"
  | "challenge_box"
  | "divider_section"

type GridPosition = {
  col: number      // 1–12
  row: number      // 1–18
  colSpan: number
  rowSpan: number
}

type DesignElement = {
  id: ElementId
  position?: GridPosition  // undefined = AutoLayout decide
  content: Record<string, unknown>
}

// ---- Plano gerado pela LLM ----

type PagePlan = {
  title: string
  skill: BNCCSkill         // dados completos inferidos pelo parser
  pages: {
    pageNumber: number
    elements: DesignElement[]
  }[]
}

// ---- Input do usuário ----

type ActivityInput = {
  bnccCode: string         // ex: "EF05CI04" — único campo obrigatório
  questionCount?: number   // opcional, LLM decide se ausente
}
```

---

## 9. Prompt da LLM

O orquestrador monta o prompt assim:

```
[SYSTEM]
Você é um designer pedagógico especializado em criar atividades escolares.
Dado um input BNCC, retorne um PagePlan válido usando APENAS os elementos
do catálogo fornecido.

Regras:
- page_header e page_footer são obrigatórios em cada página
- Numere questões sequencialmente (1, 2, 3...)
- Equilibre tipos de questão (não use só múltipla escolha)
- Adapte linguagem e complexidade ao ano escolar e à fase pedagógica
- NÃO defina posições — o AutoLayout fará isso
- Use o nome do componente curricular, não da área (ex: "Ciências", não "Ciências da Natureza")

[CATÁLOGO DE ELEMENTOS]
<json com schema e limites de cada elemento>

[PERFIL DA FASE]
<perfil de linguagem, tipos permitidos e restrições para a fase atual>

[USER]
Área do conhecimento: Ciências da Natureza
Componente curricular: Ciências
Ano: 5º ano
Código BNCC: EF05CI04
Habilidade: "Selecionar argumentos que justifiquem a importância da cobertura vegetal para a manutenção do ciclo da água..."
Número de questões: 5
```

Resposta da LLM é um JSON validado por Zod contra `PagePlan`.

---

## 10. Pipeline de geração

```
1. Input validado (código BNCC, nº questões opcional)
        │
        ▼
2. Orquestrador monta prompt com catálogo completo
        │
        ▼
3. LLM retorna PagePlan (structured output)
        │
        ▼
4. Validação Zod
   ├─ Elementos existem no catálogo? → rejeita e re-gera (max 2 tentativas)
   ├─ Conteúdo dentro dos limites? → trunca com aviso
   └─ Questões numeradas sequencialmente? → corrige
        │
        ▼
5. AutoLayout Engine
   ├─ page_header → row 1–3, cols 1–12
   ├─ page_footer → rows 17–18, cols 1–12
   ├─ Elementos restantes em grid 12×14 (rows 4–16)
   ├─ First Fit Decreasing: elementos maiores primeiro
   └─ Se não couber → quebra nova página
        │
        ▼
6. Overflow Guard
   ├─ Mede altura real de cada elemento (via headless render)
   └─ Se overflow → aumenta rowSpan ou move para próxima página
        │
        ▼
7. Render HTML/CSS com design system
        │
        ▼
8. Playwright → PDF (A4, 300dpi, printBackground: true)
```

---

## 11. AutoLayout Engine

### Grid

```
Página A4:  210mm × 297mm
Margens:    20mm (todos os lados)
Grid:       12 colunas × 18 linhas
Col width:  ~14.2mm
Row height: ~14.3mm
```

### Algoritmo

```
Algoritmo: First Fit Decreasing (FFD)

1. Ordena elementos por área (maior primeiro)
2. Para cada elemento:
   a. Tenta encaixar na posição mais à esquerda e acima disponível
   b. Respeita minSize e maxSize do elemento
   c. Se não couber na página atual → cria nova página
3. page_header e page_footer são alocados antes do FFD
   (fixam rows 1–3 e 17–18)
```

### Regras adicionais

- Elementos de questão nunca são cortados entre páginas
- `divider_section` sempre inicia nova linha
- `challenge_box` preferencial no final da última página
- `concept_box` e `tip_box` podem ser posicionados lado a lado (6+6 cols)

---

## 12. Design System Visual

### Paleta por disciplina

| Disciplina | Cor primária | Cor secundária |
|---|---|---|
| Matemática | #2563EB (azul) | #DBEAFE |
| Português | #7C3AED (roxo) | #EDE9FE |
| Ciências | #059669 (verde) | #D1FAE5 |
| História | #D97706 (âmbar) | #FEF3C7 |
| Geografia | #0891B2 (ciano) | #CFFAFE |
| Artes | #DB2777 (rosa) | #FCE7F3 |

### Tipografia

```
Fonte principal: Inter (Google Fonts)
Fonte destaque:  Inter Bold

Título atividade:  24px Bold
Número questão:    18px Bold, cor primária da disciplina
Enunciado:         14px Regular
Alternativas:      13px Regular
Instrução:         12px Italic, cor cinza
Rodapé:            10px Regular, cor cinza
```

### Tratamento de ícones

Cada tipo de componente tem ícone SVG fixo:

| Componente | Ícone |
|---|---|
| concept_box | Lâmpada |
| tip_box | Alfinete |
| vocabulary_box | Livro aberto |
| challenge_box | Estrela |
| timeline | Relógio |
| data_table | Grade |

---

## 13. Validações

| Validação | Quando | Comportamento se falhar |
|---|---|---|
| Elemento existe no catálogo | Pós-LLM | Re-gera (max 2x), depois erro |
| Conteúdo dentro dos limites de chars | Pós-LLM | Trunca com `...` |
| Número mínimo de questões | Pós-LLM | Re-gera |
| Questões numeradas sequencialmente | Pós-LLM | Corrige automaticamente |
| Elemento cabe na grid | AutoLayout | Move para próxima página |
| Overflow real de conteúdo | Overflow Guard | Aumenta rowSpan ou quebra página |
| BNCC code existe | Pré-LLM | Erro para o usuário |

---

## 14. Renderização

```
Stack:  Next.js → HTML/CSS → Playwright → PDF

Configurações Playwright:
  format:          "A4"
  printBackground: true
  margin:          { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" }
  scale:           1.0
```

Preview no frontend: iframe com HTML renderizado (mesmas classes CSS do PDF).

---

## 15. Não objetivos (MVP)

- Editor visual drag-and-drop
- Edição manual de conteúdo no preview
- Múltiplas apostilas em lote
- Upload de imagens pelo usuário
- Personalização de paleta de cores
- Geração de gabarito automático

---

## 16. Métricas de sucesso

| Métrica | Meta MVP |
|---|---|
| Tempo de geração (input → PDF) | < 8 segundos |
| Taxa de layout quebrado | < 2% |
| Taxa de re-geração por erro de schema | < 5% |
| PDFs gerados por dia | 100 (MVP) |
| Satisfação do professor (1–5) | ≥ 4.0 |

---

## 17. Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| LLM gera elemento fora do catálogo | Alta | Re-geração automática + schema enforcement |
| Overflow de texto não detectado | Média | Overhead render + Overflow Guard |
| Layout inconsistente entre preview e PDF | Média | Mesma renderização HTML para ambos |
| LLM ignora limites de chars | Alta | Truncamento pós-validação |
| Performance > 8s | Média | Cache de prompts base, otimizar Playwright |

---

## 18. Roadmap

### Fase 1 — MVP
- 3 disciplinas (Matemática, Português, Ciências)
- 6 tipos de questão
- 1–2 páginas por atividade
- 8 componentes visuais
- Exportação PDF

### Fase 2
- Todas as disciplinas
- Todos os componentes do catálogo
- Gabarito automático
- Histórico de atividades geradas
- Edição pontual de conteúdo

### Fase 3
- Geração em lote (sequência de aulas)
- Plano de aula gerado junto com a atividade
- Banco de questões reutilizáveis
- API pública para integrações

---

## Essência do produto

```
LLM projeta a atividade como um pedagogo
Sistema garante que ela é válida, bonita e imprimível
```
