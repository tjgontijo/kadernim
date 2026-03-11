import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { LinkBnccSkillSchema } from '@/schemas/resources/admin-resource-schemas'
import {
    linkResourceBnccSkill,
    listResourceBnccSkills,
} from '@/services/resources/admin'

/**
 * POST /api/v1/admin/resources/:id/bncc-skills
 * Link a BNCC skill to a resource
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { userId } = authResult
        const { id: resourceId } = await params

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

        const body = await request.json()
        const parsed = LinkBnccSkillSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', issues: parsed.error.format() },
                { status: 400 }
            )
        }

        const { bnccSkillId } = parsed.data

        const link = await linkResourceBnccSkill(resourceId, bnccSkillId)

        return NextResponse.json({
            id: link.id,
            bnccSkill: link.bnccSkill,
        }, { status: 201 })

    } catch (error) {
        if (error instanceof Error && error.message === 'Resource not found') {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        if (error instanceof Error && error.message === 'BNCC skill not found') {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        console.error('[POST /api/v1/admin/resources/:id/bncc-skills]', error)
        return NextResponse.json(
            { error: 'Failed to link BNCC skill' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/v1/admin/resources/:id/bncc-skills
 * Get all BNCC skills linked to a resource
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) {
            return authResult
        }

        const { id: resourceId } = await params

        const skills = await listResourceBnccSkills(resourceId)

        return NextResponse.json({
            skills,
        })

    } catch (error) {
        console.error('[GET /api/v1/admin/resources/:id/bncc-skills]', error)
        return NextResponse.json(
            { error: 'Failed to fetch BNCC skills' },
            { status: 500 }
        )
    }
}
