// src/domain/resources/optimized-list.service.ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { ResourcesQueryDTO } from '@/lib/schemas/resource'

export type Resource = {
  id: string
  title: string
  imageUrl: string
  isFree: boolean
  subjectId: string
  subjectName: string
  educationLevelId: string
  educationLevelName: string
  hasAccess: boolean
  description: string
  fileCount: number
}

type ResourcesQuery = z.infer<typeof ResourcesQueryDTO>

// 🔹 Construir WHERE clause otimizada
function buildWhere(q: ResourcesQuery): Prisma.ResourceWhereInput {
  const conditions: Prisma.ResourceWhereInput[] = []
  
  if (q.subjectId) conditions.push({ subjectId: q.subjectId })
  if (q.educationLevelId) conditions.push({ educationLevelId: q.educationLevelId })
  
  if (q.q) {
    conditions.push({
      OR: [
        { title: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } }
      ]
    })
  }
  
  if (q.bnccCodes?.length) {
    conditions.push({
      bnccCodes: {
        some: { bnccCode: { code: { in: q.bnccCodes } } }
      }
    })
  }
  
  return conditions.length ? { AND: conditions } : {}
}

async function fetchResourcesPage(q: ResourcesQuery) {
  const where = buildWhere(q)
  const skip = (q.page - 1) * q.limit

  const [total, resources] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        isFree: true,
        subjectId: true,
        subject: { select: { name: true } },
        educationLevelId: true,
        educationLevel: { select: { name: true } },
        _count: { select: { files: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: q.limit
    })
  ])

  return {
    resources: resources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      imageUrl: r.imageUrl,
      isFree: r.isFree,
      subjectId: r.subjectId,
      subjectName: r.subject.name,
      educationLevelId: r.educationLevelId,
      educationLevelName: r.educationLevel.name,
      fileCount: r._count.files,
      hasAccess: r.isFree // Será atualizado posteriormente
    } as Resource)),
    pagination: {
      total,
      page: q.page,
      limit: q.limit,
      hasMore: skip + resources.length < total
    }
  }
}

// 🔹 Função principal com cache
const getCachedResources = unstable_cache(
  fetchResourcesPage,
  ['resources', 'list'],
  { 
    // 1 hora de cache para os mesmos parâmetros
    revalidate: 3600,
    tags: ['resources']
  }
)

export async function listOptimizedResources(
  userId: string | undefined,
  query: ResourcesQuery
) {
  try {
    const shouldUseCache =
      !query.subjectId &&
      !query.educationLevelId &&
      !query.q &&
      (!query.bnccCodes || query.bnccCodes.length === 0) &&
      query.page === 1

    const { resources, pagination } = shouldUseCache
      ? await getCachedResources(query)
      : await fetchResourcesPage(query)

    const premiumResourceIds = resources.filter(r => !r.isFree).map(r => r.id)

    const baseAccessible = resources
      .filter(r => r.isFree)
      .map(r => ({ ...r, hasAccess: true }))

    const baseRestricted = resources
      .filter(r => !r.isFree)
      .map(r => ({ ...r, hasAccess: false }))

    if (!userId) {
      return {
        accessibleResources: baseAccessible,
        restrictedResources: baseRestricted,
        pagination
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        subscriptionTier: true,
        subscription: {
          select: {
            isActive: true,
            expiresAt: true,
            plan: { select: { slug: true } }
          }
        }
      }
    })

    if (user?.role === 'admin') {
      return {
        accessibleResources: resources.map(r => ({ ...r, hasAccess: true })),
        restrictedResources: [],
        pagination
      }
    }

    const subscription = user?.subscription
    const isPremium = Boolean(
      user?.subscriptionTier === 'premium' ||
      (subscription?.isActive &&
        (subscription.expiresAt === null || subscription.expiresAt >= new Date()) &&
        subscription.plan?.slug &&
        subscription.plan.slug !== 'free')
    )

    if (isPremium) {
      return {
        accessibleResources: resources.map(r => ({ ...r, hasAccess: true })),
        restrictedResources: [],
        pagination
      }
    }

    if (!premiumResourceIds.length) {
      return {
        accessibleResources: baseAccessible,
        restrictedResources: [],
        pagination
      }
    }

    const userAccess = await prisma.userResourceAccess.findMany({
      where: {
        userId,
        resourceId: { in: premiumResourceIds },
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      select: { resourceId: true }
    })

    const accessibleResourceIds = new Set(userAccess.map(access => access.resourceId))

    const accessibleResources = resources
      .filter(resource => resource.isFree || accessibleResourceIds.has(resource.id))
      .map(resource => ({ ...resource, hasAccess: true }))

    const restrictedResources = resources
      .filter(resource => !resource.isFree && !accessibleResourceIds.has(resource.id))
      .map(resource => ({ ...resource, hasAccess: false }))

    return {
      accessibleResources,
      restrictedResources,
      pagination
    }
  } catch (error) {
    console.error('Error listing optimized resources:', error)
    throw new Error('Failed to load resources')
  }
}
