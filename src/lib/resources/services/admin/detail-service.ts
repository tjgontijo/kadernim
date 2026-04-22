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
          images: {
            select: {
              id: true,
              cloudinaryPublicId: true,
              url: true,
              alt: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
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
      bnccSkills: {
        select: {
          bnccSkill: {
            select: {
              code: true,
            },
          },
        },
      },
      objectives: {
        select: {
          id: true,
          text: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      steps: {
        select: {
          id: true,
          type: true,
          title: true,
          duration: true,
          content: true,
          order: true,
        },
        orderBy: { order: 'asc' },
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
    googleDriveUrl: resource.googleDriveUrl,
    grades: resource.grades.map((grade) => grade.grade?.slug).filter(Boolean),
    bnccCodes: resource.bnccSkills.map((item) => item.bnccSkill.code),
    objectives: resource.objectives,
    steps: resource.steps.map((step) => ({
      ...step,
      duration: step.duration ?? null,
    })),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
    files: resource.files.map((file) => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
      images: file.images.map((image) => ({
        id: image.id,
        cloudinaryPublicId: image.cloudinaryPublicId,
        url: image.url ?? null,
        alt: image.alt,
        order: image.order,
      })),
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
