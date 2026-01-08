import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { prisma } from '@/lib/db'

/**
 * DELETE /api/v1/admin/resources/:id/bncc-skills/:skillId
 * Unlink a BNCC skill from a resource
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; skillId: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId } = authResult
        const { id: resourceId, skillId: bnccSkillId } = await params

        const rl = checkRateLimit(`admin:resources:bncc:${userId}`, {
            windowMs: 60_000,
            limit: 30,
        })

        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'rate_limited' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
            )
        }

        // Delete the link
        await prisma.resourceBnccSkill.deleteMany({
            where: {
                resourceId,
                bnccSkillId,
            }
        })

        return new NextResponse(null, { status: 204 })

    } catch (error) {
        console.error('[DELETE /api/v1/admin/resources/:id/bncc-skills/:skillId]', error)
        return NextResponse.json(
            { error: 'Failed to unlink BNCC skill' },
            { status: 500 }
        )
    }
}
