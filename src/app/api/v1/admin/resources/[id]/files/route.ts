import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/middleware'
import { UserRole } from '@/types/user-role'
import { checkRateLimit } from '@/lib/helpers/rate-limit'
import { prisma } from '@/lib/prisma'
import { uploadFile, getFileUrl } from '@/lib/cloudinary/file-service'

/**
 * POST /api/v1/admin/resources/:id/files
 * Upload a file to a resource
 * Expects multipart/form-data with file
 * Admin only
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role
    const authResult = await requireRole(request, UserRole.admin)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { userId } = authResult
    const { id: resourceId } = await params

    // Rate limiting: 20 requests per minute per admin
    const rl = checkRateLimit(`admin:resources:files:upload:${userId}`, {
      windowMs: 60_000,
      limit: 20,
    })

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'rate_limited' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rl.retryAfter),
          },
        }
      )
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const uploadResult = await uploadFile(file, resourceId)

    // Create file record in database
    const { createFileService } = await import('@/services/resources/file-service')
    const fileRecord = await createFileService({
      resourceId,
      name: uploadResult.fileName,
      cloudinaryPublicId: uploadResult.publicId,
      fileType: uploadResult.fileType,
      sizeBytes: uploadResult.sizeBytes,
      adminId: userId,
    })

    return NextResponse.json(
      {
        id: fileRecord.id,
        name: fileRecord.name,
        cloudinaryPublicId: fileRecord.cloudinaryPublicId,
        url: getFileUrl(fileRecord.cloudinaryPublicId),
        fileType: fileRecord.fileType,
        sizeBytes: fileRecord.sizeBytes,
        createdAt: fileRecord.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/v1/admin/resources/:id/files]', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes('not allowed') || error.message.includes('too large')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
