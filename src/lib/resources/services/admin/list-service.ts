import { prisma } from '@/server/db'
import { Prisma } from '@/server/db'
import { ListResourcesFilter } from '@/lib/resources/schemas/admin-resource-schemas'

interface ListResourcesResponse {
  data: Array<{
    id: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    externalId: number | null
    isFree: boolean
    thumbUrl: string | null
    fileCount: number
    accessCount: number
    grades: string[]
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
    // Busca por IDs usando unaccent para suportar busca sem acento (ex: historia -> história)
    const searchPattern = `%${q}%`
    const matches = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT r.id FROM "resource" r
      LEFT JOIN "subject" s ON r."subjectId" = s.id
      WHERE unaccent(r."title" || ' ' || COALESCE(r."description", '') || ' ' || COALESCE(s."name", '')) ILIKE unaccent(${searchPattern})
    `)
    
    whereConditions.id = { in: matches.map(m => m.id) }
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
      _count: {
        select: {
          files: true,
          accessEntries: true,
        },
      },
      images: {
        where: { order: 0 },
        take: 1,
        select: { url: true },
      },
      grades: {
        include: {
          grade: {
            select: { name: true }
          }
        }
      },
    },
  })

  // Helper to get thumb URL from stored url
  const buildThumbUrl = (image: { url: string | null } | undefined): string | null => {
    return image?.url || null
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
    fileCount: resource._count.files,
    accessCount: resource._count.accessEntries,
    grades: resource.grades.map(rg => rg.grade.name),
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
