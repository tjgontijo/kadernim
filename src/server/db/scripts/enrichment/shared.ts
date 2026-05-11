export const ENRICH_MODEL = 'gpt-4.1'
export const ENRICH_PROMPT_VERSION = 'resource-enrichment-v2-with-material'
export const CUSTOM_ID_PREFIX = 'resource-enrichment:'

export const STEP_TYPES = [
  'WARMUP',
  'DISTRIBUTION',
  'PRACTICE',
  'CONCLUSION',
  'DISCUSSION',
  'ACTIVITY',
  'REFLECTION',
] as const

export function getResourceIdFromCustomId(customId: string) {
  if (!customId.startsWith(CUSTOM_ID_PREFIX)) {
    throw new Error(`Invalid custom_id: ${customId}`)
  }
  return customId.replace(CUSTOM_ID_PREFIX, '')
}

export function buildPrompt(payload: {
  title: string
  subjectName: string
  educationLevelName: string
  availableGrades: string[]
  materialMarkdown: string
}) {
  return `Recurso para enriquecer:
- Titulo: ${payload.title}
- Disciplina: ${payload.subjectName}
- Etapa: ${payload.educationLevelName}
- Series possiveis: ${payload.availableGrades.join(', ')}

Regras obrigatorias:
1) Use o MATERIAL abaixo como fonte principal.
2) Nao invente habilidades BNCC; use apenas codigos com alta confianca.
3) Objetivos devem ser observaveis e aplicaveis em sala.
4) Passos devem ser executaveis, com progressao didatica e linguagem clara para professor.
5) Se o material estiver fraco/incompleto, reflita isso em confidence e qualityNotes.

MATERIAL (markdown extraido do PDF):
${payload.materialMarkdown}`
}

export const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: { type: 'string', minLength: 30, maxLength: 1200 },
    objectives: {
      type: 'array',
      minItems: 3,
      maxItems: 10,
      items: { type: 'string', minLength: 5, maxLength: 280 },
    },
    bnccCodes: {
      type: 'array',
      minItems: 0,
      maxItems: 8,
      items: { type: 'string', minLength: 3, maxLength: 24 },
    },
    grades: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: { type: 'string', minLength: 2, maxLength: 40 },
    },
    steps: {
      type: 'array',
      minItems: 3,
      maxItems: 12,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', enum: [...STEP_TYPES] },
          title: { type: 'string', minLength: 3, maxLength: 180 },
          duration: { type: 'string', minLength: 2, maxLength: 40 },
          content: { type: 'string', minLength: 8, maxLength: 5000 },
        },
        required: ['type', 'title', 'duration', 'content'],
      },
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    qualityNotes: {
      type: 'array',
      minItems: 1,
      maxItems: 8,
      items: { type: 'string', minLength: 5, maxLength: 220 },
    },
  },
  required: ['description', 'objectives', 'bnccCodes', 'grades', 'steps', 'confidence', 'qualityNotes'],
} as const
