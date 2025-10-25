// src/services/resources.service.ts
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { UserRoleType } from '@/types/user-role'
import { isAdmin } from '@/lib/auth/roles'

export interface ResourceFilters {
  subjectId?: string
  educationLevelId?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface ResourceWithDetails {
  id: string
  title: string
  description: string
  imageUrl: string
  isFree: boolean
  subjectId: string
  subjectName: string
  educationLevelId: string
  educationLevelName: string
  hasAccess: boolean
}

/**
 * Busca a biblioteca completa do usuário (recursos que ele tem acesso)
 */
export async function getMyLibrary(
  userId: string,
  filters: ResourceFilters,
  _pagination: PaginationParams
) {
  // Construir condições de filtro
  const filterConditions: Prisma.ResourceWhereInput[] = []

  if (filters.subjectId) {
    filterConditions.push({ subjectId: filters.subjectId })
  }

  if (filters.educationLevelId) {
    filterConditions.push({ educationLevelId: filters.educationLevelId })
  }

  // Verificar se o usuário é admin ou tem assinatura premium
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

  // Nas funções onde isAdmin é usado
  const userIsAdmin = isAdmin(user?.role as UserRoleType)
  const isPremium = Boolean(
    user?.subscriptionTier === 'premium' ||
    (user?.subscription?.isActive &&
      (user.subscription.expiresAt === null || user.subscription.expiresAt >= new Date()) &&
      user.subscription.plan?.slug &&
      user.subscription.plan.slug !== 'free')
  )

  // Buscar recursos onde o usuário tem acesso individual
  const userAccessIds = await prisma.userResourceAccess.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    },
    select: { resourceId: true }
  })
  const accessedResourceIds = userAccessIds.map(a => a.resourceId)

  // Construir where clause
  const where: Prisma.ResourceWhereInput = filterConditions.length > 0
    ? { AND: filterConditions }
    : {}

  // Query otimizada: buscar recursos com acesso + amostra de bloqueados
  const [accessedResources, otherResources, total] = await prisma.$transaction([
    // 1. Recursos que o usuário tem acesso (poucos)
    prisma.resource.findMany({
      where: {
        ...where,
        OR: [
          { isFree: true },
          { id: { in: accessedResourceIds } }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        isFree: true,
        subjectId: true,
        subject: { select: { name: true } },
        educationLevelId: true,
        educationLevel: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    // 2. Outros recursos (limitado a 100 para performance)
    prisma.resource.findMany({
      where: {
        ...where,
        isFree: false,
        id: { notIn: accessedResourceIds }
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        isFree: true,
        subjectId: true,
        subject: { select: { name: true } },
        educationLevelId: true,
        educationLevel: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limitar para performance
    }),
    // 3. Total count
    prisma.resource.count({ where })
  ])

  // Combinar resultados
  const resources = [...accessedResources, ...otherResources]

  // Mapear recursos
  const mappedResources = resources.map(r => {
    // Determinar se o usuário tem acesso
    const hasIndividualAccess = accessedResourceIds.includes(r.id)
    const hasAccess = userIsAdmin || isPremium || r.isFree || hasIndividualAccess

    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      imageUrl: r.imageUrl,
      isFree: r.isFree,
      subjectId: r.subjectId,
      subjectName: r.subject.name,
      educationLevelId: r.educationLevelId,
      educationLevelName: r.educationLevel.name,
      hasAccess
    }
  })

  // Ordenar: recursos com acesso individual primeiro, depois recursos com acesso, depois por data de criação
  const sortedResources = mappedResources.sort((a, b) => {
    // Primeiro critério: recursos com acesso individual comprado aparecem primeiro
    const aHasIndividualAccess = accessedResourceIds.includes(a.id) && !a.isFree
    const bHasIndividualAccess = accessedResourceIds.includes(b.id) && !b.isFree
    
    if (aHasIndividualAccess !== bHasIndividualAccess) {
      return aHasIndividualAccess ? -1 : 1
    }
    
    // Segundo critério: recursos com acesso (gratuitos ou premium) aparecem antes dos bloqueados
    if (a.hasAccess !== b.hasAccess) {
      return a.hasAccess ? -1 : 1
    }
    
    // Terceiro critério: manter ordem original (já ordenado por createdAt desc)
    return 0
  })

  return {
    resources: sortedResources,
    pagination: {
      page: 1,
      pageSize: total,
      totalPages: 1,
      totalItems: total
    }
  }
}

/**
 * Busca recursos recentemente adquiridos pelo usuário
 */
export async function getRecentlyAcquired(userId: string, limit = 10) {
  const recentAccesses = await prisma.userResourceAccess.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } }
      ]
    },
    select: {
      resourceId: true,
      grantedAt: true,
      resource: {
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          isFree: true,
          subjectId: true,
          subject: { select: { name: true } },
          educationLevelId: true,
          educationLevel: { select: { name: true } }
        }
      }
    },
    orderBy: { grantedAt: 'desc' },
    take: limit
  })

  return recentAccesses.map(access => ({
    id: access.resource.id,
    title: access.resource.title,
    description: access.resource.description || '',
    imageUrl: access.resource.imageUrl,
    isFree: access.resource.isFree,
    subjectId: access.resource.subjectId,
    subjectName: access.resource.subject.name,
    educationLevelId: access.resource.educationLevelId,
    educationLevelName: access.resource.educationLevel.name,
    hasAccess: true,
    acquiredAt: access.grantedAt
  }))
}

/**
 * Busca recursos recentemente adicionados ao sistema
 */
export async function getRecentlyAdded(limit = 10) {
  const resources = await prisma.resource.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      isFree: true,
      createdAt: true,
      subjectId: true,
      subject: { select: { name: true } },
      educationLevelId: true,
      educationLevel: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description || '',
    imageUrl: r.imageUrl,
    isFree: r.isFree,
    subjectId: r.subjectId,
    subjectName: r.subject.name,
    educationLevelId: r.educationLevelId,
    educationLevelName: r.educationLevel.name,
    createdAt: r.createdAt,
    hasAccess: false // Será determinado pelo frontend
  }))
}

/**
 * Busca metadados para filtros (subjects e education levels)
 */
export async function getFilterMetadata() {
  const [subjects, educationLevels] = await prisma.$transaction([
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.educationLevel.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  return { subjects, educationLevels }
}

/**
 * Busca estatísticas da biblioteca do usuário
 */
export async function getLibraryStats(userId: string) {
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

  const userIsAdmin = isAdmin(user?.role as UserRoleType)
  const isPremium = Boolean(
    user?.subscriptionTier === 'premium' ||
    (user?.subscription?.isActive &&
      (user.subscription.expiresAt === null || user.subscription.expiresAt >= new Date()) &&
      user.subscription.plan?.slug &&
      user.subscription.plan.slug !== 'free')
  )

  return {
    isPremium,
    isAdmin: userIsAdmin
  }
}
