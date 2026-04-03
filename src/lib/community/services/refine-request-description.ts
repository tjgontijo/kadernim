import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { logger } from '@/server/logger'
import { RefinedDescriptionsSchema, type RefineCommunityRequestInput } from '@/lib/community/schemas'
import type { CommunityRefinementOption } from '@/lib/community/types'
import {
  buildRefineDescriptionPrompt,
  systemPromptRefineDescription,
} from '@/lib/ai/prompts/community-request'
import { fail, ok, type Result } from '@/lib/shared/result'

export async function refineRequestDescription(
  params: RefineCommunityRequestInput
): Promise<Result<CommunityRefinementOption[], string>> {
  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      system: systemPromptRefineDescription,
      prompt: buildRefineDescriptionPrompt(params),
      schema: RefinedDescriptionsSchema,
      temperature: 0.7,
    })

    return ok([
      { type: 'format', label: 'Formato & Design', text: object.format },
      { type: 'usability', label: 'Aplicação em Aula', text: object.usability },
      { type: 'pedagogy', label: 'Objetivo Pedagógico', text: object.pedagogy },
    ])
  } catch (error) {
    logger.error(
      { domain: 'community', error: error instanceof Error ? error.message : String(error) },
      'Failed to refine community request description'
    )

    if (
      error instanceof Error &&
      (error.message.includes('429') || error.message.includes('rate limit'))
    ) {
      return fail('Limite de requisições atingido. Tente novamente em alguns segundos.')
    }

    return fail('Erro ao refinar descrição. Tente novamente.')
  }
}
