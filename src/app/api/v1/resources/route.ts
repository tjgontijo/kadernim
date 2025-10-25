// src/app/api/v1/resources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { UserRoleType } from '@/types/user-role'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/roles'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

export interface UnifiedResourcesResponse {
  resources: Array<{
    id: string
    title: string
    description: string
    imageUrl: string
    subjectId: string
    subjectName: string
    educationLevelId: string
    educationLevelName: string
    isFree: boolean
    hasAccess: boolean
    hasIndividualAccess?: boolean
    createdAt: string
    updatedAt: string
  }>
  metadata: {
    subjects: Array<{
      id: string
      name: string
      resourceCount: number
    }>
    educationLevels: Array<{
      id: string
      name: string
      resourceCount: number
    }>
    stats: {
      totalResources: number
      freeResources: number
      premiumResources: number
      userAccessCount: number
    }
  }
  userInfo: {
    isPremium: boolean
    premiumExpiresAt: string | null
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const educationLevelId = searchParams.get('educationLevelId')
    const search = searchParams.get('search')

    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {}
    if (subjectId) whereClause.subjectId = subjectId
    if (educationLevelId) whereClause.educationLevelId = educationLevelId
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // Single optimized query with all data
    const [resources, subjects, educationLevels, userAccesses, userSubscription, user] = await Promise.all([
      // Resources with related data
      prisma.resource.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          subjectId: true,
          educationLevelId: true,
          isFree: true,
          createdAt: true,
          updatedAt: true,
          subject: {
            select: { name: true }
          },
          educationLevel: {
            select: { name: true }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ]
      }),

      // Subjects with resource counts
      prisma.subject.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { resources: true }
          }
        },
        orderBy: { name: 'asc' }
      }),

      // Education levels with resource counts
      prisma.educationLevel.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { resources: true }
          }
        },
        orderBy: { name: 'asc' }
      }),

      // User's resource accesses
      prisma.userResourceAccess.findMany({
        where: { 
          userId: session.user.id,
          isActive: true
        },
        select: { resourceId: true }
      }),

      // User's premium status
      prisma.subscription.findFirst({
        where: {
          userId: session.user.id,
          isActive: true
        },
        select: {
          expiresAt: true
        }
      }),

      // User data to check role and subscription tier
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          role: true,
          subscriptionTier: true
        }
      })
    ])

    // Create access lookup for O(1) performance
    const accessedResourceIds = new Set(userAccesses.map(access => access.resourceId))
    
    // Check if user is admin or premium
    // Dentro da função onde isAdmin é usado
    const userIsAdmin = isAdmin(user?.role as UserRoleType)
    const isPremium = userIsAdmin || 
      user?.subscriptionTier === 'premium' ||
      (userSubscription && 
        (!userSubscription.expiresAt || userSubscription.expiresAt > new Date()))

    // Add access information to resources
    const resourcesWithAccess = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      imageUrl: resource.imageUrl,
      subjectId: resource.subjectId,
      subjectName: resource.subject.name,
      educationLevelId: resource.educationLevelId,
      educationLevelName: resource.educationLevel.name,
      isFree: resource.isFree,
      hasAccess: resource.isFree || !!isPremium || accessedResourceIds.has(resource.id),
      hasIndividualAccess: accessedResourceIds.has(resource.id),
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString()
    }))

    // Ordenar recursos: recursos com acesso individual primeiro, depois por data de criação
    const sortedResources = resourcesWithAccess.sort((a, b) => {
      // Primeiro critério: recursos com acesso individual comprado aparecem primeiro
      if (a.hasIndividualAccess !== b.hasIndividualAccess) {
        return a.hasIndividualAccess ? -1 : 1
      }
      
      // Segundo critério: recursos com acesso (gratuitos ou premium) aparecem antes dos bloqueados
      if (a.hasAccess !== b.hasAccess) {
        return a.hasAccess ? -1 : 1
      }
      
      // Terceiro critério: manter ordem por data de criação (mais recentes primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Calculate stats
    const totalResources = sortedResources.length
    const freeResources = sortedResources.filter(r => r.isFree).length
    const premiumResources = totalResources - freeResources
    const userAccessCount = accessedResourceIds.size

    const response: UnifiedResourcesResponse = {
      resources: sortedResources,
      metadata: {
        subjects: subjects.map(subject => ({
          id: subject.id,
          name: subject.name,
          resourceCount: subject._count.resources
        })),
        educationLevels: educationLevels.map(level => ({
          id: level.id,
          name: level.name,
          resourceCount: level._count.resources
        })),
        stats: {
          totalResources,
          freeResources,
          premiumResources,
          userAccessCount
        }
      },
      userInfo: {
        isPremium: !!isPremium,
        premiumExpiresAt: userSubscription?.expiresAt?.toISOString() || null
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching unified resources:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}