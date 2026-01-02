import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/server/auth/middleware'
import { prisma } from '@/lib/db'
import { SubjectSchema } from '@/lib/schemas/admin/subjects'

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

        const subject = await prisma.subject.update({
            where: { id },
            data: parsed.data
        })

        return NextResponse.json(subject)
    } catch (error) {
        console.error('[PUT /api/v1/admin/subjects/:id]', error)
        return NextResponse.json({ error: 'Erro ao atualizar matéria' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requirePermission(request, 'manage:resources')
        if (authResult instanceof NextResponse) return authResult

        const { id } = await params

        // Check if there are resources linked
        const resourceCount = await prisma.resource.count({
            where: { subjectId: id }
        })

        if (resourceCount > 0) {
            return NextResponse.json({
                error: 'Não é possível excluir uma matéria que possui recursos vinculados.'
            }, { status: 400 })
        }

        await prisma.subject.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[DELETE /api/v1/admin/subjects/:id]', error)
        return NextResponse.json({ error: 'Erro ao excluir matéria' }, { status: 500 })
    }
}
