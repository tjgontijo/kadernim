import { NextResponse } from 'next/server'
import { z } from 'zod'
import { RefineCommunityRequestSchema } from '@/lib/community/schemas'
import { refineRequestDescription } from '@/lib/community/services'
import { logger } from '@/server/logger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = RefineCommunityRequestSchema.parse(body)
    const result = await refineRequestDescription(validated)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { refined: result.data },
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/refine-request', error: error instanceof Error ? error.message : String(error) },
      'Failed to refine community request'
    )

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao processar com IA' },
      { status: 500 }
    )
  }
}
