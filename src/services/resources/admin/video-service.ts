import { prisma } from '@/lib/db'

export interface CreateResourceVideoInput {
  resourceId: string
  title: string
  cloudinaryPublicId: string
  url?: string
  thumbnail?: string
  duration?: number
  order?: number
}

export interface UpdateResourceVideoInput {
  title?: string
  thumbnail?: string
  duration?: number
  order?: number
}

export async function createResourceVideo(input: CreateResourceVideoInput) {
  const { resourceId, title, cloudinaryPublicId, url, thumbnail, duration, order = 0 } = input

  // Verify resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  })

  if (!resource) {
    throw new Error('Resource not found')
  }

  // Create video record
  const video = await prisma.resourceVideo.create({
    data: {
      resourceId,
      title,
      cloudinaryPublicId,
      url,
      thumbnail,
      duration,
      order,
    },
  })

  return video
}

export async function updateResourceVideo(
  resourceId: string,
  videoId: string,
  input: UpdateResourceVideoInput
) {
  // Verify the video belongs to the resource
  const video = await prisma.resourceVideo.findUnique({
    where: { id: videoId },
  })

  if (!video) {
    throw new Error('Video not found')
  }

  if (video.resourceId !== resourceId) {
    throw new Error('Video does not belong to this resource')
  }

  // Update video record
  const updatedVideo = await prisma.resourceVideo.update({
    where: { id: videoId },
    data: {
      title: input.title !== undefined ? input.title : video.title,
      thumbnail: input.thumbnail !== undefined ? input.thumbnail : video.thumbnail,
      duration: input.duration !== undefined ? input.duration : video.duration,
      order: input.order !== undefined ? input.order : video.order,
    },
  })

  return updatedVideo
}

export async function deleteResourceVideo(resourceId: string, videoId: string) {
  // Verify the video belongs to the resource
  const video = await prisma.resourceVideo.findUnique({
    where: { id: videoId },
  })

  if (!video) {
    throw new Error('Video not found')
  }

  if (video.resourceId !== resourceId) {
    throw new Error('Video does not belong to this resource')
  }

  // Delete video record
  await prisma.resourceVideo.delete({
    where: { id: videoId },
  })
}

export async function getResourceVideos(resourceId: string) {
  const videos = await prisma.resourceVideo.findMany({
    where: { resourceId },
    orderBy: { order: 'asc' },
  })

  return videos
}

export async function reorderResourceVideos(
  resourceId: string,
  videoIds: string[]
) {
  // Verify all videos belong to the resource
  const videos = await prisma.resourceVideo.findMany({
    where: {
      resourceId,
      id: { in: videoIds },
    },
  })

  if (videos.length !== videoIds.length) {
    throw new Error('One or more videos do not belong to this resource')
  }

  // Update order for all videos
  const updatedVideos = await Promise.all(
    videoIds.map((id, index) =>
      prisma.resourceVideo.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  return updatedVideos
}
