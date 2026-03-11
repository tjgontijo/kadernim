import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/server/clients/cloudinary/image-client'
import {
  assertAdminResourceExists,
  createResourceImage,
  getResourceImages,
} from '@/services/resources/admin'

// GET /api/v1/admin/resources/[id]/images
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resourceId } = await params

    await assertAdminResourceExists(resourceId)

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

    await assertAdminResourceExists(resourceId)

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
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
