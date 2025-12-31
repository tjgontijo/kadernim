import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/prisma'
import { ListResourcesFilter } from '@/lib/schemas/admin/resources'

interface ListResourcesResponse {
  data: Array<{
    id: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    externalId: number
    isFree: boolean
    thumbUrl: string | null
    fileCount: number
    accessCount: number
    createdAt: Date
    updatedAt: Date
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * List resources with filters and pagination
 */
export async function listResourcesService(
  filters: ListResourcesFilter
): Promise<ListResourcesResponse> {
  const {
    page,
    limit,
    q,
    educationLevel,
    subject,
    isFree,
    sortBy,
    order,
  } = filters

  // Build where conditions
  const whereConditions: Prisma.ResourceWhereInput = {}

  if (q) {
    whereConditions.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (educationLevel) {
    whereConditions.educationLevel = { slug: educationLevel }
  }

  if (subject) {
    whereConditions.subject = { slug: subject }
  }

  if (isFree !== undefined) {
    whereConditions.isFree = isFree
  }

  // Get total count
  const total = await prisma.resource.count({
    where: whereConditions,
  })

  // Calculate pagination
  const skip = (page - 1) * limit
  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  // Build order by
  type SortBy = 'title' | 'createdAt' | 'updatedAt'
  const orderByMap: Record<SortBy, Prisma.ResourceOrderByWithRelationInput> = {
    title: { title: order as Prisma.SortOrder },
    createdAt: { createdAt: order as Prisma.SortOrder },
    updatedAt: { updatedAt: order as Prisma.SortOrder },
  }

  // Fetch resources with counts
  const resources = await prisma.resource.findMany({
    where: whereConditions,
    orderBy: orderByMap[sortBy as SortBy],
    skip,
    take: limit,
    include: {
      educationLevel: true,
      subject: true,
      files: {
        select: { id: true },
      },
      accessEntries: {
        select: { id: true },
      },
      images: {
        where: { order: 0 },
        take: 1,
        select: { url: true, cloudinaryPublicId: true },
      },
    },
  })

  // Helper to build optimized Cloudinary URL for thumbnails (80x80)
  const buildThumbUrl = (image: { url: string | null; cloudinaryPublicId: string } | undefined): string | null => {
    if (!image) return null
    // Prefer stored url if available
    if (image.url) return image.url
    // Otherwise build optimized Cloudinary URL
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_80,h_80,q_auto,f_auto/${image.cloudinaryPublicId}`
  }

  const data = resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    educationLevel: resource.educationLevel.name,
    subject: resource.subject.name,
    externalId: resource.externalId,
    isFree: resource.isFree,
    thumbUrl: buildThumbUrl(resource.images[0]),
    fileCount: resource.files.length,
    accessCount: resource.accessEntries.length,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  }))

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  }
}
