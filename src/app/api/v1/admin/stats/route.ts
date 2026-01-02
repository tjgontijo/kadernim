import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requirePermission } from '@/server/auth/middleware'

export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'read:admin')
        if (authResult instanceof NextResponse) return authResult

        const [
            totalResources,
            totalUsers,
            freeResources,
            totalAccessGrants,
            subscribers
        ] = await Promise.all([
            prisma.resource.count(),
            prisma.user.count(),
            prisma.resource.count({ where: { isFree: true } }),
            prisma.resourceUserAccess.count(),
            prisma.user.count({ where: { role: 'subscriber' } })
        ])

        return NextResponse.json({
            totalResources,
            totalUsers,
            freeResources,
            paidResources: totalResources - freeResources,
            totalAccessGrants,
            subscribers
        })
    } catch (error) {
        console.error('[GET /api/v1/admin/stats]', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
