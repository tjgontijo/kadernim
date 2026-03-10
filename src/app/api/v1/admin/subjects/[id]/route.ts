import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { TaxonomyService } from '@/services/taxonomy/taxonomy.service'
import { SubjectSchema } from '@/schemas/subjects/subject-schemas'

/**
 * PUT /api/v1/admin/subjects/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params
        const body = await request.json()
        const parsed = SubjectSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.format() }, { status: 400 })
        }

        const subject = await TaxonomyService.updateSubject(id, parsed.data)

        return NextResponse.json(subject)
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar matéria' }, { status: 500 })
    }
}

/**
 * DELETE /api/v1/admin/subjects/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        await TaxonomyService.deleteSubject(id)

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        if (error.message === 'HAS_RESOURCES') {
            return NextResponse.json({
                error: 'Não é possível excluir uma matéria que possui recursos vinculados.'
            }, { status: 400 })
        }
        return NextResponse.json({ error: 'Erro ao excluir matéria' }, { status: 500 })
    }
}
