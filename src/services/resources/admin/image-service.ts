import { prisma } from '@/lib/db'

export interface CreateResourceImageInput {
  resourceId: string
  cloudinaryPublicId: string
  url?: string
  alt?: string
  order?: number
}

export interface UpdateResourceImageInput {
  alt?: string
  order?: number
}

export async function createResourceImage(input: CreateResourceImageInput) {
  const { resourceId, cloudinaryPublicId, url, alt, order = 0 } = input

  // Verify resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  })

  if (!resource) {
    throw new Error('Resource not found')
  }

  // Create image record
  const image = await prisma.resourceImage.create({
    data: {
      resourceId,
      cloudinaryPublicId,
      url,
      alt,
      order,
    },
  })

  return image
}

export async function updateResourceImage(
  resourceId: string,
  imageId: string,
  input: UpdateResourceImageInput
) {
  // Verify the image belongs to the resource
  const image = await prisma.resourceImage.findUnique({
    where: { id: imageId },
  })

  if (!image) {
    throw new Error('Image not found')
  }

  if (image.resourceId !== resourceId) {
    throw new Error('Image does not belong to this resource')
  }

  // Update image record
  const updatedImage = await prisma.resourceImage.update({
    where: { id: imageId },
    data: {
      alt: input.alt !== undefined ? input.alt : image.alt,
      order: input.order !== undefined ? input.order : image.order,
    },
  })

  return updatedImage
}

export async function deleteResourceImage(resourceId: string, imageId: string) {
  // Verify the image belongs to the resource
  const image = await prisma.resourceImage.findUnique({
    where: { id: imageId },
  })

  if (!image) {
    throw new Error('Image not found')
  }

  if (image.resourceId !== resourceId) {
    throw new Error('Image does not belong to this resource')
  }

  // Delete image record
  await prisma.resourceImage.delete({
    where: { id: imageId },
  })
}

export async function getResourceImages(resourceId: string) {
  const images = await prisma.resourceImage.findMany({
    where: { resourceId },
    orderBy: { order: 'asc' },
  })

  return images
}

export async function reorderResourceImages(
  resourceId: string,
  imageIds: string[]
) {
  // Verify all images belong to the resource
  const images = await prisma.resourceImage.findMany({
    where: {
      resourceId,
      id: { in: imageIds },
    },
  })

  if (images.length !== imageIds.length) {
    throw new Error('One or more images do not belong to this resource')
  }

  // Update order for all images
  const updatedImages = await Promise.all(
    imageIds.map((id, index) =>
      prisma.resourceImage.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  return updatedImages
}
