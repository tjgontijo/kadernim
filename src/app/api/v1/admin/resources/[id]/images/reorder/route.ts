import { NextRequest, NextResponse } from 'next/server'
import { ReorderResourceImagesSchema } from '@/lib/resources/schemas'
import { reorderResourceImagesByUpdates } from '@/lib/resources/services/admin'
import { auth } from '@/server/auth/auth'
import { z } from 'zod'

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
        const { updates } = ReorderResourceImagesSchema.parse(body)

        await reorderResourceImagesByUpdates(resourceId, updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: error.issues },
                { status: 400 }
            )
        }

        if (
            error instanceof Error &&
            error.message === 'One or more images do not belong to this resource'
        ) {
            return NextResponse.json(
                { error: 'Recurso ou imagens inválidas' },
                { status: 404 }
            )
        }

        console.error('Erro ao reordenar imagens:', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar ordem das imagens' },
            { status: 500 }
        )
    }
}
