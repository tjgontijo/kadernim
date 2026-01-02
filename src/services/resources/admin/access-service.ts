import { prisma } from '@/lib/db'

export interface GrantAccessInput {
  resourceId: string
  userId: string
  expiresAt?: Date
}

export interface AccessData {
  id: string
  userId: string
  resourceId: string
  user: {
    id: string
    name: string
    email: string
  }
  source: string | null
  grantedAt: string
  expiresAt: string | null
}

/**
 * Grant access to a resource for a user
 */
export async function grantAccessService(
  input: GrantAccessInput
): Promise<AccessData> {
  const { resourceId, userId, expiresAt } = input

  // Verify resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  })

  if (!resource) {
    throw new Error('Resource not found')
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Check if access already exists
  const existingAccess = await prisma.resourceUserAccess.findUnique({
    where: {
      userId_resourceId: {
        userId,
        resourceId,
      },
    },
  })

  if (existingAccess) {
    throw new Error('User already has access to this resource')
  }

  // Create access record
  const access = await prisma.resourceUserAccess.create({
    data: {
      userId,
      resourceId,
      source: 'manual',
      expiresAt,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return {
    id: access.id,
    userId: access.userId,
    resourceId: access.resourceId,
    user: access.user,
    source: access.source,
    grantedAt: access.grantedAt.toISOString(),
    expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null,
  }
}

/**
 * Revoke access to a resource for a user
 */
export async function revokeAccessService(
  resourceId: string,
  accessId: string
): Promise<void> {
  // Verify the access record exists and belongs to the resource
  const access = await prisma.resourceUserAccess.findUnique({
    where: { id: accessId },
  })

  if (!access) {
    throw new Error('Access record not found')
  }

  if (access.resourceId !== resourceId) {
    throw new Error('Access does not belong to this resource')
  }

  // Delete the access record
  await prisma.resourceUserAccess.delete({
    where: { id: accessId },
  })
}

/**
 * Get all access records for a resource
 */
export async function getResourceAccessService(
  resourceId: string
): Promise<AccessData[]> {
  const access = await prisma.resourceUserAccess.findMany({
    where: { resourceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { grantedAt: 'desc' },
  })

  return access.map((a) => ({
    id: a.id,
    userId: a.userId,
    resourceId: a.resourceId,
    user: a.user,
    source: a.source,
    grantedAt: a.grantedAt.toISOString(),
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
  }))
}
