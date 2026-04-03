import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { logger } from '@/server/logger'
import {
  CommunityGeneratedTitlesSchema,
  type GenerateCommunityTitleRequestInput,
} from '@/lib/community/schemas'
import type { CommunityTitleOption } from '@/lib/community/types'
import {
  buildGenerateTitlePrompt,
  systemPromptGenerateTitle,
} from '@/lib/ai/prompts/community-request'
import { fail, ok, type Result } from '@/lib/shared/result'

export async function generateCommunityTitleOptions(
  input: GenerateCommunityTitleRequestInput
): Promise<Result<CommunityTitleOption[], string>> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: systemPromptGenerateTitle,
      prompt: buildGenerateTitlePrompt(input.description),
      schema: CommunityGeneratedTitlesSchema,
      temperature: 0.8,
    })

    return ok([
      { type: 'short', label: 'Curto', text: object.short },
      { type: 'descriptive', label: 'Descritivo', text: object.descriptive },
      { type: 'creative', label: 'Criativo', text: object.creative },
    ])
  } catch (error) {
    logger.error(
      { domain: 'community', error: error instanceof Error ? error.message : String(error) },
      'Failed to generate community title options'
    )
    return fail(error instanceof Error ? error.message : 'Erro ao gerar título')
  }
}
