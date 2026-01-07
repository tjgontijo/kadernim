import { NextRequest, NextResponse } from 'next/server'
import { uploadVideo, getVideoThumbnail } from '@/server/clients/cloudinary/video-client'
import { createResourceVideo, getResourceVideos } from '@/services/resources/admin/video-service'
import { prisma } from '@/lib/db'

// GET /api/v1/admin/resources/[id]/videos
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

    // Get all videos
    const videos = await getResourceVideos(resourceId)

    return NextResponse.json({ videos })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get videos'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// POST /api/v1/admin/resources/[id]/videos
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resourceId } = await params
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file || !title) {
      return NextResponse.json(
        { error: 'File and title are required' },
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
    const uploadResult = await uploadVideo(file, 'resources/videos', resourceId, title)

    // Generate thumbnail
    const thumbnail = getVideoThumbnail(uploadResult.publicId, 0)

    // Save to database
    const video = await createResourceVideo({
      resourceId,
      title,
      cloudinaryPublicId: uploadResult.publicId,
      url: uploadResult.url,
      thumbnail,
      duration: uploadResult.duration,
    })

    return NextResponse.json(
      {
        id: video.id,
        resourceId: video.resourceId,
        title: video.title,
        cloudinaryPublicId: video.cloudinaryPublicId,
        url: uploadResult.url,
        thumbnail: video.thumbnail,
        duration: video.duration,
        order: video.order,
        createdAt: video.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload video'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
