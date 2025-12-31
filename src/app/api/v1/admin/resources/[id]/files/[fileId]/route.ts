import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/lib/helpers/rate-limit'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/cloudinary/file-service'

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
    // Require admin role
    const authResult = await requireRole(request, UserRole.admin)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const resolvedParams = await params
    const { id: resourceId, fileId } = resolvedParams

    console.log(`[DELETE FILE] Resource: ${resourceId}, File: ${fileId}`)

    // Get file to retrieve Cloudinary public ID
    const file = await prisma.resourceFile.findUnique({
      where: { id: fileId },
    })

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
      console.log(`[DELETE FILE] Deleting from Cloudinary: ${file.cloudinaryPublicId}`)
      await deleteFile(file.cloudinaryPublicId)
    } catch (cloudinaryError) {
      console.error('[DELETE FILE] Cloudinary deletion error:', cloudinaryError)
    }

    // Delete file record from database
    console.log(`[DELETE FILE] Deleting from DB: ${fileId}`)
    const { deleteFileService } = await import('@/services/resources/file-service')
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
