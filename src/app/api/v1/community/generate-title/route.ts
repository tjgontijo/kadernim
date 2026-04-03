import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/server/logger'
import { GenerateCommunityTitleRequestSchema } from '@/lib/community/schemas'
import { generateCommunityTitleOptions } from '@/lib/community/services'

export async function POST(request: Request) {
  try {
    const { description } = GenerateCommunityTitleRequestSchema.parse(await request.json())
    const result = await generateCommunityTitleOptions({ description })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        titles: result.data,
      },
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/generate-title', error: error instanceof Error ? error.message : String(error) },
      'Failed to generate community titles'
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao gerar título' },
      { status: 500 }
    )
  }
}
