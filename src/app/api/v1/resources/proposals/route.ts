import { NextRequest, NextResponse } from 'next/server'
import { ActivityInputSchema } from '@/lib/resource/schemas'
import { parseBnccCode, yearToPhase } from '@/lib/resource/bncc-parser'
import { generateResourceProposals } from '@/lib/resource/orchestrator'

const DEFAULT_QUESTION_COUNT: Record<string, number> = {
  phase_1: 2, phase_2: 3, phase_3: 4, phase_4: 5, phase_5: 6,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = ActivityInputSchema.parse({ bnccCode: body.bnccCode, questionCount: body.questionCount })

    const bnccMeta = parseBnccCode(input.bnccCode)
    const phase = yearToPhase(bnccMeta.year)
    const questionCount = input.questionCount ?? DEFAULT_QUESTION_COUNT[phase]

    const proposals = await generateResourceProposals(input.bnccCode, questionCount)

    return NextResponse.json({ success: true, proposals })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Erro ao gerar propostas:', error)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}
