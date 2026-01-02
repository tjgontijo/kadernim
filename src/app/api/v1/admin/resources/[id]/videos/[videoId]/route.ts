import { NextRequest, NextResponse } from 'next/server'
import { deleteVideo } from '@/server/clients/cloudinary/video-client'
import { updateResourceVideo, deleteResourceVideo } from '@/services/resources/admin/video-service'
import { prisma } from '@/lib/db'

// PUT /api/v1/admin/resources/[id]/videos/[videoId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const { id: resourceId, videoId } = await params
    const { title, order } = await req.json()

    // Verify video exists and belongs to resource
    const video = await prisma.resourceVideo.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (video.resourceId !== resourceId) {
      return NextResponse.json(
        { error: 'Video does not belong to this resource' },
        { status: 400 }
      )
    }

    // Update video metadata
    const updatedVideo = await updateResourceVideo(resourceId, videoId, {
      title,
      order,
    })

    return NextResponse.json({
      id: updatedVideo.id,
      resourceId: updatedVideo.resourceId,
      title: updatedVideo.title,
      cloudinaryPublicId: updatedVideo.cloudinaryPublicId,
      thumbnail: updatedVideo.thumbnail,
      duration: updatedVideo.duration,
      order: updatedVideo.order,
      createdAt: updatedVideo.createdAt.toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update video'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/admin/resources/[id]/videos/[videoId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: resourceId, videoId } = resolvedParams

    console.log(`[DELETE VIDEO] Resource: ${resourceId}, Video: ${videoId}`)

    // Verify video exists and belongs to resource
    const video = await prisma.resourceVideo.findUnique({
      where: { id: videoId },
    })

    if (!video) {
      console.warn(`[DELETE VIDEO] Video not found in DB: ${videoId}`)
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    if (video.resourceId !== resourceId) {
      console.error(`[DELETE VIDEO] ID mismatch. Video resource: ${video.resourceId}, URL resource: ${resourceId}`)
      return NextResponse.json(
        { error: 'Video does not belong to this resource' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    try {
      console.log(`[DELETE VIDEO] Deleting from Cloudinary: ${video.cloudinaryPublicId}`)
      await deleteVideo(video.cloudinaryPublicId)
    } catch (cloudinaryError) {
      console.error('[DELETE VIDEO] Cloudinary deletion error:', cloudinaryError)
    }

    // Delete from database
    console.log(`[DELETE VIDEO] Deleting from DB: ${videoId}`)
    await deleteResourceVideo(resourceId, videoId)

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('[DELETE VIDEO] unexpected error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete video'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
