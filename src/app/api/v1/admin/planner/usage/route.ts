import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { getPlannerUsageReport } from '@/lib/lesson-plans/services'

export const dynamic = 'force-dynamic'

function parsePeriod(value: string | null): '7d' | '30d' | '90d' {
  if (value === '7d' || value === '90d') return value
  return '30d'
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const period = parsePeriod(request.nextUrl.searchParams.get('period'))
    const report = await getPlannerUsageReport(period)

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('[GET /api/v1/admin/planner/usage] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar custos de IA do planner' },
      { status: 500 }
    )
  }
}
