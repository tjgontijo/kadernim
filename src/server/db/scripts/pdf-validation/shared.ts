export const PDF_VALIDATE_MODEL = 'gpt-4.1-nano'
export const PDF_VALIDATE_PROMPT_VERSION = 'pdf-validate-v2-chunked-full-doc'
export const PDF_VALIDATE_CUSTOM_ID_PREFIX = 'pdf-validate:'
export const PDF_VALIDATE_CHUNK_SEPARATOR = '\n\n<!-- CHUNK SPLIT -->\n\n'

export function buildChunkCustomId(docId: string, chunkIndex: number, chunkCount: number) {
  return `${PDF_VALIDATE_CUSTOM_ID_PREFIX}${docId}:${chunkIndex}:${chunkCount}`
}

export function getDocIdFromCustomId(customId: string) {
  if (!customId.startsWith(PDF_VALIDATE_CUSTOM_ID_PREFIX)) {
    throw new Error(`Invalid custom_id: ${customId}`)
  }
  const raw = customId.replace(PDF_VALIDATE_CUSTOM_ID_PREFIX, '')
  const [docId, chunkIndexRaw, chunkCountRaw] = raw.split(':')
  const chunkIndex = Number(chunkIndexRaw)
  const chunkCount = Number(chunkCountRaw)
  if (!docId || !Number.isFinite(chunkIndex) || !Number.isFinite(chunkCount)) {
    throw new Error(`Invalid chunked custom_id: ${customId}`)
  }
  return { docId, chunkIndex, chunkCount }
}

export const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    hasContent: { type: 'boolean' },
    quality: { type: 'number', minimum: 0, maximum: 1 },
    issues: { type: 'array', minItems: 0, maxItems: 12, items: { type: 'string', minLength: 3, maxLength: 220 } },
    cleanedMarkdown: { type: 'string', minLength: 1, maxLength: 200000 },
  },
  required: ['hasContent', 'quality', 'issues', 'cleanedMarkdown'],
} as const
