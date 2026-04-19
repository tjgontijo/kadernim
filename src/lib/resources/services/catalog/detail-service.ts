import { prisma } from '@/server/db'
import { isStaff } from '@/lib/auth/roles'
import { ResourceDetailSchema } from '@/lib/resources/schemas/resource-schemas'
import {
  computeHasAccessForResource,
  type SubscriptionContext,
  type UserAccessContext,
} from '@/services/auth/access-service'

export async function getResourceAccessContext(userId: string, role: string | null) {
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  })

  const userContext: UserAccessContext = {
    userId,
    isAdmin: isStaff(role as never),
  }

  const subscriptionContext: SubscriptionContext = {
    hasActiveSubscription: Boolean(activeSubscription),
  }

  return {
    user: userContext,
    subscription: subscriptionContext,
  }
}

export async function getResourceDetailForUser(params: {
  resourceId: string
  userId: string
  role: string | null
}) {
  const resource = await prisma.resource.findUnique({
    where: { id: params.resourceId },
    select: {
      id: true,
      title: true,
      description: true,
      educationLevel: { select: { slug: true } },
      subject: { select: { slug: true } },
      isFree: true,
      slug: true,
      isCurated: true,
      curatedAt: true,
      resourceType: true,
      pagesCount: true,
      estimatedDurationMinutes: true,
      reviewCount: true,
      averageRating: true,
      downloadCount: true,
      pedagogicalContent: true,
      author: {
        select: {
          id: true,
          displayName: true,
          displayRole: true,
          location: true,
          verified: true,
        },
      },
      bnccSkills: {
        select: {
          bnccSkill: {
            select: {
              id: true,
              code: true,
              description: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
      images: {
        select: {
          id: true,
          alt: true,
          order: true,
          url: true,
        },
        orderBy: { order: 'asc' },
      },
      videos: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          duration: true,
          order: true,
          url: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  const access = await getResourceAccessContext(params.userId, params.role)
  const hasAccess = await computeHasAccessForResource(access.user, access.subscription, {
    resourceId: resource.id,
    isFree: resource.isFree,
  })

  return ResourceDetailSchema.parse({
    ...resource,
    educationLevel: resource.educationLevel.slug,
    subject: resource.subject.slug,
    hasAccess,
    thumbUrl: resource.images?.[0]?.url || null,
    curatedAt: resource.curatedAt?.toISOString() || null,
    bnccSkills: resource.bnccSkills.map((bs) => bs.bnccSkill),
    pedagogicalContent: resource.pedagogicalContent as any, // Cast to any as Prisma JsonValue doesn't match Zod output exactly but structure does
    files: resource.files.map((file) => ({
      id: file.id,
      name: file.name,
      createdAt: file.createdAt.toISOString(),
    })),
    images: resource.images.map((img) => ({
      id: img.id,
      alt: img.alt,
      order: img.order,
      url: img.url,
    })),
    videos: resource.videos.map((vid) => ({
      id: vid.id,
      title: vid.title,
      thumbnail: vid.thumbnail,
      duration: vid.duration,
      order: vid.order,
      url: vid.url,
    })),
  })
}

export async function getResourceDownloadGrant(params: {
  userId: string
  role: string | null
  resourceId: string
  fileId: string
}) {
  const file = await prisma.resourceFile.findFirst({
    where: {
      id: params.fileId,
      resourceId: params.resourceId,
    },
    select: {
      id: true,
      name: true,
      url: true,
      resource: {
        select: {
          id: true,
          isFree: true,
        },
      },
    },
  })

  if (!file) {
    throw new Error('RESOURCE_FILE_NOT_FOUND')
  }

  const access = await getResourceAccessContext(params.userId, params.role)
  const hasAccess = await computeHasAccessForResource(access.user, access.subscription, {
    resourceId: params.resourceId,
    isFree: file.resource.isFree,
  })

  if (!hasAccess) {
    throw new Error('RESOURCE_FORBIDDEN')
  }

  return file
}

export async function resolveResourceDownloadByToken(params: {
  userId: string
  resourceId: string
  fileId: string
}) {
  const file = await prisma.resourceFile.findFirst({
    where: {
      id: params.fileId,
      resourceId: params.resourceId,
    },
    select: {
      id: true,
      url: true,
      resource: {
        select: {
          id: true,
          isFree: true,
        },
      },
    },
  })

  if (!file) {
    throw new Error('RESOURCE_FILE_NOT_FOUND')
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { role: true },
  })

  const access = await getResourceAccessContext(params.userId, user?.role ?? null)
  const hasAccess = await computeHasAccessForResource(access.user, access.subscription, {
    resourceId: file.resource.id,
    isFree: file.resource.isFree,
  })

  if (!hasAccess) {
    throw new Error('RESOURCE_FORBIDDEN')
  }

  if (!file.url) {
    throw new Error('RESOURCE_FILE_URL_MISSING')
  }

  return file.url
}

export async function getResourceMetaForUser(userId: string | null, role: string | null) {
  const subscription = userId
    ? await prisma.subscription.findFirst({
        where: {
          userId,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true },
      })
    : null

  return {
    role,
    isAdmin: isStaff(role as never),
    isSubscriber: Boolean(subscription),
  }
}
