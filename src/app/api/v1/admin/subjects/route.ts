import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { UserRole } from '@/types/user-role'
import { prisma } from '@/lib/db'
import { SubjectSchema } from '@/lib/schemas/admin/subjects'

export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const q = searchParams.get('q') || ''

        const where = q ? {
            OR: [
                { name: { contains: q, mode: 'insensitive' as const } },
                { slug: { contains: q, mode: 'insensitive' as const } }
            ]
        } : {}

        const [data, total] = await Promise.all([
            prisma.subject.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { resources: true }
                    }
                }
            }),
            prisma.subject.count({ where })
        ])

        return NextResponse.json({
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        })
    } catch (error) {
        console.error('[GET /api/v1/admin/subjects]', error)
        return NextResponse.json({ error: 'Erro ao buscar matérias' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const body = await request.json()
        const parsed = SubjectSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.format() }, { status: 400 })
        }

        const subject = await prisma.subject.create({
            data: parsed.data
        })

        return NextResponse.json(subject, { status: 201 })
    } catch (error) {
        console.error('[POST /api/v1/admin/subjects]', error)
        return NextResponse.json({ error: 'Erro ao criar matéria' }, { status: 500 })
    }
}
