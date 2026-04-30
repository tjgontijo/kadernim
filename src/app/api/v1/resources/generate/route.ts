import { NextRequest, NextResponse } from 'next/server'
import { generateResourcePlan } from '@/lib/resource/orchestrator'
import { PdfRenderer } from '@/lib/resource/pdf-renderer'
import { ActivityInputSchema } from '@/lib/resource/schemas'
import { yearToPhase, parseBnccCode } from '@/lib/resource/bncc-parser'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Parse and validate input
    const input = ActivityInputSchema.parse({
      bnccCode: body.bnccCode,
      questionCount: body.questionCount,
    })

    // Generate pedagogical resource plan
    const plan = await generateResourcePlan(input.bnccCode, input.questionCount, body.selectedProposal ?? undefined)

    // Determine format (html preview or pdf)
    const format = body.format || 'html'

    if (format === 'pdf') {
      // Parse BNCC to get phase
      const bnccMeta = parseBnccCode(input.bnccCode)
      const phase = yearToPhase(bnccMeta.year)

      // Render to PDF
      const pdfBuffer = await PdfRenderer.render(plan, {
        phase,
        subject: mapComponentToSubject(bnccMeta.component),
      })

      // Return PDF
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`,
        },
      })
    }

    // Default: return HTML preview
    const bnccMeta = parseBnccCode(input.bnccCode)
    const phase = yearToPhase(bnccMeta.year)

    const previewHtml = PdfRenderer.generateHtml(plan, {
      phase,
      subject: mapComponentToSubject(bnccMeta.component),
    })

    return NextResponse.json({
      success: true,
      plan,
      previewHtml,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error('Erro ao gerar recurso:', error)

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    )
  }
}

/**
 * Map component code to subject code for CSS variables
 */
function mapComponentToSubject(component: string): string {
  const map: Record<string, string> = {
    lingua_portuguesa: 'pt',
    arte: 'art',
    educacao_fisica: 'ef',
    lingua_inglesa: 'ing',
    matematica: 'math',
    ciencias: 'sci',
    historia: 'hist',
    geografia: 'geo',
    ensino_religioso: 'er',
  }
  return map[component] || 'sci'
}
