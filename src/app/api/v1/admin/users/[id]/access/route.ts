import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { getUserResourceAccessService, toggleUserResourceAccessService } from '@/services/users/user-access'
import { z } from 'zod'

/**
 * GET /api/v1/admin/users/[id]/access
 * Get user's resource access list
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params

        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) return authResult

        const access = await getUserResourceAccessService(userId)
        return NextResponse.json(access)
    } catch (error) {
        console.error('[GET /api/v1/admin/users/[id]/access]', error)
        return NextResponse.json({ error: 'Failed to fetch access' }, { status: 500 })
    }
}

const ToggleAccessSchema = z.object({
    resourceId: z.string().cuid(),
    hasAccess: z.boolean()
})

/**
 * POST /api/v1/admin/users/[id]/access
 * Toggle access for a resource
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params

        // Require manage users permission
        const authResult = await requirePermission(request, 'manage:users')
        if (authResult instanceof NextResponse) return authResult

        const { userId: adminId } = authResult

        // Rate limiting
        const rl = checkRateLimit(`admin:users:access:toggle:${adminId}`, {
            windowMs: 60_000,
            limit: 100,
        })

        if (!rl.allowed) {
            return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
        }

        const body = await request.json()
        const parsed = ToggleAccessSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
        }

        await toggleUserResourceAccessService(
            userId,
            parsed.data.resourceId,
            parsed.data.hasAccess
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[POST /api/v1/admin/users/[id]/access]', error)
        return NextResponse.json({ error: 'Failed to toggle access' }, { status: 500 })
    }
}
