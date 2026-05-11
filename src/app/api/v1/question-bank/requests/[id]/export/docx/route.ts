import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/lib/db'
import {
  generateQuestionBankDocxBuffer,
  getQuestionBankRequestSelectedItems,
} from '@/lib/question-bank/services'
import { QuestionBankDocxExportSchema } from '@/lib/question-bank/schemas'

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params
    const body = await request.json().catch(() => ({}))
    const parsed = QuestionBankDocxExportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'INVALID_EXPORT_SELECTION' }, { status: 400 })
    }

    const selectedData = await getQuestionBankRequestSelectedItems(id, userId, parsed.data.questionIds)
    if (!selectedData) return NextResponse.json({ error: 'REQUEST_NOT_FOUND' }, { status: 404 })
    if (selectedData.items.length === 0) {
      return NextResponse.json({ error: 'NO_SELECTED_QUESTIONS_FOUND' }, { status: 400 })
    }

    const buffer = await generateQuestionBankDocxBuffer(selectedData.request, selectedData.items, parsed.data.title)
    const fileName = sanitizeFileName(`question-bank-${id}`)

    await prisma.questionBankRequestExport.create({
      data: {
        requestId: selectedData.request.id,
        format: 'DOCX',
        status: 'COMPLETED',
        fileName: `${fileName}.docx`,
        createdById: userId,
      },
    })

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}.docx"`,
      },
    })
  } catch (error) {
    console.error('[POST /api/v1/question-bank/requests/:id/export/docx]', error)
    return NextResponse.json({ error: 'Erro ao exportar DOCX' }, { status: 500 })
  }
}
