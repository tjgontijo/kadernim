import { NextRequest, NextResponse } from 'next/server'
import { deleteImage } from '@/lib/cloudinary/image-service'
import { updateResourceImage, deleteResourceImage } from '@/services/resources/image-service'
import { prisma } from '@/lib/prisma'

// PUT /api/v1/admin/resources/[id]/images/[imageId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: resourceId, imageId } = await params
    const { alt, order } = await req.json()

    // Verify image exists and belongs to resource
    const image = await prisma.resourceImage.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    if (image.resourceId !== resourceId) {
      return NextResponse.json(
        { error: 'Image does not belong to this resource' },
        { status: 400 }
      )
    }

    // Update image metadata
    const updatedImage = await updateResourceImage(resourceId, imageId, {
      alt,
      order,
    })

    return NextResponse.json({
      id: updatedImage.id,
      resourceId: updatedImage.resourceId,
      cloudinaryPublicId: updatedImage.cloudinaryPublicId,
      alt: updatedImage.alt,
      order: updatedImage.order,
      createdAt: updatedImage.createdAt.toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/resources/[id]/images/[imageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: resourceId, imageId } = resolvedParams

    console.log(`[DELETE IMAGE] Resource: ${resourceId}, Image: ${imageId}`)

    // Verify image exists and belongs to resource
    const image = await prisma.resourceImage.findUnique({
      where: { id: imageId },
    })

    if (!image) {
      console.warn(`[DELETE IMAGE] Image not found in DB: ${imageId}`)
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    if (image.resourceId !== resourceId) {
      console.error(`[DELETE IMAGE] ID mismatch. Image resource: ${image.resourceId}, URL resource: ${resourceId}`)
      return NextResponse.json(
        { error: 'Image does not belong to this resource' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    try {
      console.log(`[DELETE IMAGE] Deleting from Cloudinary: ${image.cloudinaryPublicId}`)
      await deleteImage(image.cloudinaryPublicId)
    } catch (cloudinaryError) {
      // We log but continue, because if it's already gone from Cloudinary, 
      // we still need to clean up our DB.
      console.error('[DELETE IMAGE] Cloudinary deletion error:', cloudinaryError)
    }

    // Delete from database
    console.log(`[DELETE IMAGE] Deleting from DB: ${imageId}`)
    await deleteResourceImage(resourceId, imageId)

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('[DELETE IMAGE] unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
