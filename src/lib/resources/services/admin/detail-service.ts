import { prisma } from '@/server/db'
import {
  ResourceDetailResponseSchema,
  type ResourceDetailResponse,
} from '@/lib/resources/schemas/admin-resource-schemas'

export async function assertAdminResourceExists(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { id: true },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }
}

export async function getAdminResourceDetail(resourceId: string): Promise<ResourceDetailResponse> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      educationLevel: true,
      subject: true,
      files: {
        select: {
          id: true,
          name: true,
          cloudinaryPublicId: true,
          url: true,
          fileType: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
      images: {
        select: {
          id: true,
          cloudinaryPublicId: true,
          url: true,
          alt: true,
          order: true,
          createdAt: true,
        },
        orderBy: { order: 'asc' },
      },
      videos: {
        select: {
          id: true,
          title: true,
          cloudinaryPublicId: true,
          url: true,
          thumbnail: true,
          duration: true,
          order: true,
          createdAt: true,
        },
      },
      grades: {
        include: {
          grade: {
            select: { slug: true },
          },
        },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  return ResourceDetailResponseSchema.parse({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    educationLevel: resource.educationLevel?.slug,
    subject: resource.subject?.slug,
    thumbUrl: resource.thumbUrl,
    thumbPublicId: resource.thumbPublicId,
    grades: resource.grades.map((grade) => grade.grade?.slug).filter(Boolean),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
    files: resource.files.map((file) => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
    })),
    images: resource.images.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
    })),
    videos: resource.videos.map((video) => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
    })),
    stats: {
      totalDownloads: resource.downloadCount,
      averageRating: resource.averageRating,
    },

  })
}
