import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authorizeAdminResourceRequest } from '@/app/api/v1/admin/resources/route-support'
import { reorderResourceFileImagesByUpdates } from '@/lib/resources/services/admin/file-service'

const ReorderResourceFileImagesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().nonnegative(),
    })
  ),
})

/**
 * PUT /api/v1/admin/resources/:id/files/:fileId/images/reorder
 * Reorders generated preview images for a given file.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:file-previews:reorder',
      limit: 120,
    })

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: resourceId, fileId } = await params
    const body = await request.json()
    const { updates } = ReorderResourceFileImagesSchema.parse(body)

    await reorderResourceFileImagesByUpdates(resourceId, fileId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'FILE_IMAGE_NOT_FOUND') {
      return NextResponse.json({ error: 'Preview não encontrado' }, { status: 404 })
    }

    if (error instanceof Error && error.message === 'FILE_IMAGE_OWNERSHIP_MISMATCH') {
      return NextResponse.json(
        { error: 'Preview não pertence ao arquivo/recurso informado' },
        { status: 400 }
      )
    }

    console.error('[PUT /api/v1/admin/resources/:id/files/:fileId/images/reorder]', error)
    return NextResponse.json({ error: 'Erro ao reordenar previews' }, { status: 500 })
  }
}
