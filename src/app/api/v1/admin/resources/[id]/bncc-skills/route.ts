import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const LinkBnccSkillSchema = z.object({
    bnccSkillId: z.string().min(1),
})

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

        // Verify resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
            select: { id: true }
        })

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
        }

        // Verify skill exists
        const skill = await prisma.bnccSkill.findUnique({
            where: { id: bnccSkillId },
            select: { id: true }
        })

        if (!skill) {
            return NextResponse.json({ error: 'BNCC skill not found' }, { status: 404 })
        }

        // Create link (upsert to avoid duplicates)
        const link = await prisma.resourceBnccSkill.upsert({
            where: {
                resourceId_bnccSkillId: {
                    resourceId,
                    bnccSkillId,
                }
            },
            create: {
                resourceId,
                bnccSkillId,
            },
            update: {},
            include: {
                bnccSkill: {
                    select: { id: true, code: true, description: true }
                }
            }
        })

        return NextResponse.json({
            id: link.id,
            bnccSkill: link.bnccSkill,
        }, { status: 201 })

    } catch (error) {
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

        const links = await prisma.resourceBnccSkill.findMany({
            where: { resourceId },
            include: {
                bnccSkill: {
                    select: { id: true, code: true, description: true }
                }
            }
        })

        return NextResponse.json({
            skills: links.map(l => l.bnccSkill)
        })

    } catch (error) {
        console.error('[GET /api/v1/admin/resources/:id/bncc-skills]', error)
        return NextResponse.json(
            { error: 'Failed to fetch BNCC skills' },
            { status: 500 }
        )
    }
}
