import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/server/clients/cloudinary/image-client'
import { createResourceImage, getResourceImages } from '@/services/resources/admin/image-service'
import { prisma } from '@/lib/db'

// GET /api/v1/admin/resources/[id]/images
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resourceId } = await params

    // Verify resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Get all images
    const images = await getResourceImages(resourceId)

    return NextResponse.json({ images })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get images'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/resources/[id]/images
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resourceId } = await params
    const formData = await req.formData()
    const file = formData.get('file') as File
    const altText = formData.get('alt') as string | undefined

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Verify resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file, 'resources/images', resourceId, altText)

    // Save to database
    const image = await createResourceImage({
      resourceId,
      cloudinaryPublicId: uploadResult.publicId,
      url: uploadResult.url,
      alt: altText,
    })

    return NextResponse.json(
      {
        id: image.id,
        resourceId: image.resourceId,
        cloudinaryPublicId: image.cloudinaryPublicId,
        url: uploadResult.url,
        alt: image.alt,
        order: image.order,
        createdAt: image.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
