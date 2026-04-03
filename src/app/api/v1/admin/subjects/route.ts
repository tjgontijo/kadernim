import { NextRequest, NextResponse } from 'next/server'
import { SubjectSchema } from '@/lib/taxonomy/schemas'
import { TaxonomyService } from '@/lib/taxonomy/services'
import { requirePermission } from '@/server/auth/middleware'

/**
 * GET /api/v1/admin/subjects
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '15')
        const q = searchParams.get('q') || undefined

        const result = await TaxonomyService.listSubjectsAdmin({ page, limit, search: q })

        return NextResponse.json({
            data: result.subjects,
            pagination: result.pagination
        })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar matérias' }, { status: 500 })
    }
}

/**
 * POST /api/v1/admin/subjects
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const body = await request.json()
        const parsed = SubjectSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.format() }, { status: 400 })
        }

        const subject = await TaxonomyService.createSubject(parsed.data)

        return NextResponse.json(subject, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar matéria' }, { status: 500 })
    }
}
