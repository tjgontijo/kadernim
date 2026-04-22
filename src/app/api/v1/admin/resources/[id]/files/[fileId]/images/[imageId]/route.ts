import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminResourceRequest } from '@/app/api/v1/admin/resources/route-support'
import {
  deleteResourceFileImage,
  getResourceFileImageById,
} from '@/lib/resources/services/admin/file-service'
import { deleteAsset } from '@/lib/storage/cloudinary'

/**
 * DELETE /api/v1/admin/resources/:id/files/:fileId/images/:imageId
 * Deletes a single generated preview image from a file.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string; imageId: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:file-previews:delete',
      limit: 60,
    })

    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: resourceId, fileId, imageId } = await params

    const image = await getResourceFileImageById(imageId)
    if (!image) {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
    }

    if (image.file.id !== fileId || image.file.resourceId !== resourceId) {
      return NextResponse.json(
        { error: 'Preview does not belong to this file/resource' },
        { status: 400 }
      )
    }

    await deleteAsset(image.cloudinaryPublicId, 'image').catch((error) => {
      console.error('[DELETE FILE PREVIEW] Cloudinary deletion error:', error)
    })

    await deleteResourceFileImage(resourceId, fileId, imageId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/resources/:id/files/:fileId/images/:imageId]', error)

    if (error instanceof Error && error.message === 'FILE_IMAGE_NOT_FOUND') {
      return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
    }

    if (error instanceof Error && error.message === 'FILE_IMAGE_OWNERSHIP_MISMATCH') {
      return NextResponse.json(
        { error: 'Preview does not belong to this file/resource' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to delete preview' }, { status: 500 })
  }
}
