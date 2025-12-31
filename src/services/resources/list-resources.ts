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
        take: 1,
        orderBy: { order: 'asc' },
        select: { cloudinaryPublicId: true },
      },
    },
  })

  // To maintain compatibility or as per requirement, we can construct a URL or just return the ID.
  // Assuming frontend can handle cloudinary ID, or we construct a full URL here if needed.
  // For now, let's map it to a 'thumbUrl' property using a helper or just returning the ID if frontend expects it.
  // Wait, frontend likely expects a full URL if it was `thumbUrl`. The previous seed used full URLs.
  // But now we are using Cloudinary. We should probably return `thumbUrl` as the full Cloudinary URL.
  // I need to import `getImageUrl` from image-service or construct it.
  // Let's import `getImageUrl` from '@/lib/cloudinary/image-service'.

  const data = resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    educationLevel: resource.educationLevel.slug,
    subject: resource.subject.slug,
    externalId: resource.externalId,
    isFree: resource.isFree,
    thumbUrl: resource.images[0]
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/${resource.images[0].cloudinaryPublicId}`
      : null,
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
