import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { getQuestionBankCoverageSnapshot, listQuestionBankStatusCounts } from '@/lib/question-bank/services'

const ADMIN_ROLES = new Set(['admin', 'manager', 'editor'])

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const user = session?.user
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.has(user.role ?? '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [coverage, statuses] = await Promise.all([
      getQuestionBankCoverageSnapshot(),
      listQuestionBankStatusCounts(),
    ])

    return NextResponse.json({
      data: {
        coverage,
        statuses,
      },
    })
  } catch (error) {
    console.error('[GET /api/v1/admin/question-bank/coverage]', error)
    return NextResponse.json({ error: 'Erro ao carregar cobertura' }, { status: 500 })
  }
}
