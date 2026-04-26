/**
 * Mapeamento BNCC → Tipos de questão recomendados
 *
 * Princípio: tipos de questão são UNIVERSAIS.
 * Cada habilidade BNCC recomenda quais tipos funcionam melhor.
 *
 * Componente curricular → tipos primários
 */

import type { SubjectComponent } from "./bncc-parser"

export type QuestionType =
  | "open_short"
  | "open_long"
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "complete_text"
  | "matching"
  | "ordering"
  | "identify"
  | "classify"
  | "comprehension"
  | "creation"
  | "problem_creation"
  | "reasoning"
  | "image_interpretation"
  | "diagram_analysis"
  | "infographic_reading"
  | "comic_interpretation"
  | "map_reading"

/**
 * Tipos recomendados por componente curricular
 * Prioridade: primary > secondary > tertiary
 */
export const COMPONENT_QUESTION_TYPES: Record<SubjectComponent, {
  primary: QuestionType[]
  secondary: QuestionType[]
  tertiary: QuestionType[]
}> = {

  lingua_portuguesa: {
    primary: [
      "comprehension",
      "creation",
      "identify",
      "classify",
      "comic_interpretation"
    ],
    secondary: [
      "true_false",
      "open_short",
      "open_long",
      "matching"
    ],
    tertiary: [
      "fill_blank",
      "multiple_choice"
    ]
  },

  arte: {
    primary: [
      "image_interpretation",
      "creation",
      "comprehension"
    ],
    secondary: [
      "reasoning",
      "open_short",
      "identify"
    ],
    tertiary: [
      "classify",
      "matching"
    ]
  },

  educacao_fisica: {
    primary: [
      "comprehension",
      "reasoning",
      "creation"
    ],
    secondary: [
      "open_short",
      "true_false",
      "identify"
    ],
    tertiary: [
      "multiple_choice",
      "classify"
    ]
  },

  lingua_inglesa: {
    primary: [
      "comprehension",
      "fill_blank",
      "complete_text",
      "matching"
    ],
    secondary: [
      "open_short",
      "identify",
      "classify"
    ],
    tertiary: [
      "creation",
      "true_false"
    ]
  },

  matematica: {
    primary: [
      "open_short",
      "problem_creation",
      "reasoning",
      "multiple_choice"
    ],
    secondary: [
      "fill_blank",
      "identify",
      "classify",
      "diagram_analysis"
    ],
    tertiary: [
      "true_false",
      "matching",
      "infographic_reading"
    ]
  },

  ciencias: {
    primary: [
      "diagram_analysis",
      "reasoning",
      "classify",
      "comprehension"
    ],
    secondary: [
      "open_short",
      "open_long",
      "image_interpretation",
      "infographic_reading"
    ],
    tertiary: [
      "matching",
      "true_false",
      "identify"
    ]
  },

  historia: {
    primary: [
      "map_reading",
      "ordering",
      "comprehension",
      "reasoning"
    ],
    secondary: [
      "open_short",
      "open_long",
      "image_interpretation",
      "matching"
    ],
    tertiary: [
      "true_false",
      "identify",
      "classify"
    ]
  },

  geografia: {
    primary: [
      "map_reading",
      "infographic_reading",
      "diagram_analysis",
      "comprehension"
    ],
    secondary: [
      "reasoning",
      "classify",
      "open_short",
      "image_interpretation"
    ],
    tertiary: [
      "matching",
      "ordering",
      "true_false"
    ]
  },

  ensino_religioso: {
    primary: [
      "comprehension",
      "reasoning",
      "open_short",
      "open_long"
    ],
    secondary: [
      "creation",
      "identify",
      "true_false"
    ],
    tertiary: [
      "classify",
      "matching"
    ]
  }
}

/**
 * Faixa etária vs tipos recomendados
 * Algumas questões são muito complexas para fases iniciais
 */
export const PHASE_QUESTION_RESTRICTIONS: Record<number, QuestionType[]> = {
  // Fase 1: 1º–2º ano — muito limitado, só coisas visuais/simples
  1: [
    "multiple_choice",
    "true_false",
    "identify",
    "image_interpretation",
    "comic_interpretation",
    "creation"
  ],

  // Fase 2: 3º–4º ano — começa a expandir
  2: [
    "multiple_choice",
    "true_false",
    "fill_blank",
    "matching",
    "open_short",
    "identify",
    "classify",
    "image_interpretation",
    "comic_interpretation",
    "creation",
    "ordering"
  ],

  // Fase 3: 5º ano — transição, maioria funciona
  3: [
    "open_short",
    "open_long",
    "multiple_choice",
    "true_false",
    "fill_blank",
    "complete_text",
    "matching",
    "ordering",
    "identify",
    "classify",
    "comprehension",
    "creation",
    "reasoning",
    "image_interpretation",
    "diagram_analysis",
    "infographic_reading",
    "comic_interpretation",
    "map_reading"
  ],

  // Fase 4: 6º–7º — todas as questões funcionam
  4: Array.from({ length: 19 }, (_, i) => i) as any, // todas

  // Fase 5: 8º–9º — todas as questões funcionam
  5: Array.from({ length: 19 }, (_, i) => i) as any
}

// Preencher fases 4 e 5 com todos os tipos
PHASE_QUESTION_RESTRICTIONS[4] = [
  "open_short", "open_long", "multiple_choice", "true_false",
  "fill_blank", "complete_text", "matching", "ordering",
  "identify", "classify", "comprehension", "creation",
  "problem_creation", "reasoning", "image_interpretation",
  "diagram_analysis", "infographic_reading", "comic_interpretation",
  "map_reading"
]
PHASE_QUESTION_RESTRICTIONS[5] = [...PHASE_QUESTION_RESTRICTIONS[4]]

/**
 * Schema visual por tipo de questão
 */
export const QUESTION_TYPE_SPECS: Record<QuestionType, {
  label: string
  icon: string
  description: string
  minLines?: number
  maxLines?: number
  contentExample: string
}> = {
  open_short: {
    label: "Resposta curta",
    icon: "✏️",
    description: "1–3 linhas. Resposta direta, não dissertativa.",
    minLines: 1,
    maxLines: 3,
    contentExample: "Como é chamado o processo de fotossíntese?"
  },
  open_long: {
    label: "Resposta longa",
    icon: "📝",
    description: "4+ linhas. Resposta dissertativa, com argumentação.",
    minLines: 4,
    maxLines: 12,
    contentExample: "Explique com detalhes como funciona o ciclo da água."
  },
  multiple_choice: {
    label: "Múltipla escolha",
    icon: "◉",
    description: "A/B/C/D (ou E). Objetivo.",
    contentExample: "Qual das alternativas descreve corretamente...?"
  },
  true_false: {
    label: "Verdadeiro / Falso",
    icon: "✓",
    description: "Afirmativas V/F. Rápido e objetivo.",
    contentExample: "Marque V ou F para cada afirmativa:"
  },
  fill_blank: {
    label: "Complete com banco",
    icon: "◯",
    description: "Lacunas + banco de palavras.",
    contentExample: "Complete as lacunas com as palavras do banco:"
  },
  complete_text: {
    label: "Complete sem banco",
    icon: "___",
    description: "Lacunas sem banco. Requer lembrança.",
    contentExample: "Complete as lacunas:"
  },
  matching: {
    label: "Ligar colunas",
    icon: "↔",
    description: "Conectar elementos de duas listas.",
    contentExample: "Ligue cada termo à sua definição:"
  },
  ordering: {
    label: "Ordenar",
    icon: "▼",
    description: "Numerar em sequência correta.",
    contentExample: "Numere os eventos na ordem correta:"
  },
  identify: {
    label: "Identificar",
    icon: "👁",
    description: "Encontrar/indicar elemento em imagem ou texto.",
    contentExample: "Identifique no mapa os continentes:"
  },
  classify: {
    label: "Classificar",
    icon: "📂",
    description: "Categorizar itens em grupos.",
    contentExample: "Classifique os animais em herbívoros e carnívoros:"
  },
  comprehension: {
    label: "Compreensão",
    icon: "💡",
    description: "Questão interpretativa sobre texto/imagem/conceito.",
    contentExample: "O que o texto quer dizer com...?"
  },
  creation: {
    label: "Produção criativa",
    icon: "🎨",
    description: "Escrever, desenhar, criar algo novo.",
    contentExample: "Crie uma história sobre..."
  },
  problem_creation: {
    label: "Criar problema",
    icon: "❓",
    description: "Aluno cria uma questão/problema (Matemática, Ciências).",
    contentExample: "Crie um problema matemático com..."
  },
  reasoning: {
    label: "Justificar/raciocinar",
    icon: "🧠",
    description: "Explicar o porquê ou o raciocínio.",
    contentExample: "Justifique sua resposta:"
  },
  image_interpretation: {
    label: "Interpretar imagem",
    icon: "🖼",
    description: "Analisar foto, quadro, fotografia.",
    contentExample: "O que você vê nesta imagem?"
  },
  diagram_analysis: {
    label: "Analisar diagrama",
    icon: "📊",
    description: "Interpretar diagrama científico ou técnico.",
    contentExample: "Descreva o que mostra este diagrama:"
  },
  infographic_reading: {
    label: "Ler infográfico",
    icon: "📈",
    description: "Extrair dados de infográfico.",
    contentExample: "De acordo com o infográfico, qual é...?"
  },
  comic_interpretation: {
    label: "Analisar tirinha",
    icon: "💬",
    description: "Interpretar HQ/tirinha/charge.",
    contentExample: "Qual é a mensagem da tirinha?"
  },
  map_reading: {
    label: "Ler mapa",
    icon: "🗺",
    description: "Interpretar mapa geográfico, político ou temático.",
    contentExample: "De acordo com o mapa, qual região...?"
  }
}

/**
 * Uso na LLM:
 * 1. Input: código BNCC (ex: EF05CI04)
 * 2. Parser: ciências (componente)
 * 3. Busca: COMPONENT_QUESTION_TYPES["ciencias"].primary
 * 4. LLM escolhe tipos de lá
 * 5. Filtra por PHASE_QUESTION_RESTRICTIONS[phase]
 * 6. Resultado: questões que fazem sentido pedagógico
 */
