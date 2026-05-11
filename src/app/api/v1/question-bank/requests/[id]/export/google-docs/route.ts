import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { prisma } from '@/lib/db'
import { createGoogleDocFromQuestionBankRequest, getQuestionBankRequestForUser } from '@/lib/question-bank/services'

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const qbRequest = await getQuestionBankRequestForUser(id, userId)
  if (!qbRequest) return NextResponse.json({ error: 'REQUEST_NOT_FOUND' }, { status: 404 })

  try {
    const doc = await createGoogleDocFromQuestionBankRequest(qbRequest)

    await prisma.questionBankRequestExport.create({
      data: {
        requestId: qbRequest.id,
        format: 'GOOGLE_DOCS',
        status: 'COMPLETED',
        googleDocId: doc.documentId,
        googleDocUrl: doc.url,
        fileName: doc.title,
        createdById: userId,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        documentId: doc.documentId,
        url: doc.url,
        title: doc.title,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GOOGLE_DOCS_EXPORT_FAILED'

    await prisma.questionBankRequestExport.create({
      data: {
        requestId: qbRequest.id,
        format: 'GOOGLE_DOCS',
        status: 'FAILED',
        errorMessage: message,
        createdById: userId,
      },
    })

    if (message === 'GOOGLE_DOCS_NOT_CONFIGURED') {
      return NextResponse.json({ error: message }, { status: 501 })
    }

    console.error('[POST /api/v1/question-bank/requests/:id/export/google-docs]', error)
    return NextResponse.json({ error: 'Erro ao exportar Google Docs' }, { status: 500 })
  }
}
