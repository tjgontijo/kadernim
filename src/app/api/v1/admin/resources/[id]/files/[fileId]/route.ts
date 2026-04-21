import { NextRequest, NextResponse } from 'next/server'
import { deleteFileService, getResourceFileById } from '@/lib/resources/services/admin'
import { requirePermission } from '@/server/auth/middleware'
import { checkRateLimit } from '@/server/utils/rate-limit'
import { deleteAsset } from '@/lib/storage/cloudinary'

/**
 * DELETE /api/v1/admin/resources/:id/files/:fileId
 * Delete a file from a resource
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    // Require manage resources permission
    const authResult = await requirePermission(request, 'manage:resources')
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const resolvedParams = await params
    const { id: resourceId, fileId } = resolvedParams


    // Get file to retrieve Cloudinary public ID
    const file = await getResourceFileById(fileId)

    if (!file) {
      console.warn(`[DELETE FILE] File not found in DB: ${fileId}`)
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    if (file.resourceId !== resourceId) {
      console.error(`[DELETE FILE] ID mismatch. File resource: ${file.resourceId}, URL resource: ${resourceId}`)
      return NextResponse.json(
        { error: 'File does not belong to this resource' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    try {
      await deleteAsset(file.cloudinaryPublicId, 'raw')
    } catch (cloudinaryError) {
      console.error('[DELETE FILE] Cloudinary deletion error:', cloudinaryError)
    }

    // Delete file record from database
    await deleteFileService(fileId, resourceId, userId)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/v1/admin/resources/:id/files/:fileId]', error)
    const message = error instanceof Error ? error.message : 'Failed to delete file'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
