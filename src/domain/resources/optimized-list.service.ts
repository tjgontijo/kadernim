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
    // Carrega os recursos com cache
    const { resources, pagination } = await getCachedResources(query)
    
    // Se não há usuário ou recursos premium na página, retorna direto
    const hasPremiumContent = resources.some(r => !r.isFree)
    if (!userId || !hasPremiumContent) {
      return {
        resources: resources.map(r => ({
          ...r,
          hasAccess: r.isFree
        })),
        pagination
      }
    }

    // Se tem recursos premium, verifica acesso
    const premiumResourceIds = resources.filter(r => !r.isFree).map(r => r.id)
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

    const accessibleResourceIds = new Set(
      userAccess.map(access => access.resourceId)
    )

    // Mapeia os recursos com informações de acesso
    const resourcesWithAccess = resources.map(resource => ({
      ...resource,
      hasAccess: resource.isFree || accessibleResourceIds.has(resource.id)
    }))

    return {
      resources: resourcesWithAccess,
      pagination
    }
  } catch (error) {
    console.error('Error listing optimized resources:', error)
    throw new Error('Failed to load resources')
  }
}
