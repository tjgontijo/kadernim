import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth/auth'
import { z } from 'zod'

const ReorderImagesSchema = z.object({
    updates: z.array(
        z.object({
            id: z.string(),
            order: z.number().int().nonnegative(),
        })
    ),
})

export async function PUT(
    req: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        const userId = session?.user?.id
        const role = session?.user?.role ?? null

        if (!userId || role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: resourceId } = await ctx.params
        const body = await req.json()
        const { updates } = ReorderImagesSchema.parse(body)

        // Verify resource exists
        const resource = await prisma.resource.findUnique({
            where: { id: resourceId },
        })

        if (!resource) {
            return NextResponse.json(
                { error: 'Recurso não encontrado' },
                { status: 404 }
            )
        }

        // Perform updates in a transaction
        await prisma.$transaction(
            updates.map((update) =>
                prisma.resourceImage.update({
                    where: { id: update.id, resourceId }, // Ensure image belongs to resource
                    data: { order: update.order },
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            )
        }

        console.error('Erro ao reordenar imagens:', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar ordem das imagens' },
            { status: 500 }
        )
    }
}
