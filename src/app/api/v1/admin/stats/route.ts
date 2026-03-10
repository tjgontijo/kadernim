import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { StatsService } from '@/services/stats/stats.service'

export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'read:admin')
        if (authResult instanceof NextResponse) return authResult

        const stats = await StatsService.getAdminSummary()

        return NextResponse.json(stats)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
