import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/db'
import type { UpdateAccountInput } from '@/schemas/account/account-schemas'

export async function getAccountProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      subscription: {
        select: {
          id: true,
          isActive: true,
          purchaseDate: true,
          expiresAt: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const versionPath = path.join(process.cwd(), 'public/version.json')
  let latestVersion: unknown = null

  try {
    if (fs.existsSync(versionPath)) {
      latestVersion = JSON.parse(fs.readFileSync(versionPath, 'utf-8'))
    }
  } catch (error) {
    console.error('[AccountService] Error reading version.json', error)
  }

  return { ...user, latestVersion }
}

export async function updateAccountProfile(userId: string, input: UpdateAccountInput) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
    },
  })
}

export async function updateAccountAvatar(userId: string, imageUrl: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      image: imageUrl,
    },
    select: {
      image: true,
    },
  })

  return user.image
}

export async function listAccountSessions(userId: string, currentSessionId?: string | null) {
  const sessions = await prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return sessions.map((session) => ({
    ...session,
    isCurrent: session.id === currentSessionId,
  }))
}

export async function revokeAccountSessions(
  userId: string,
  currentSessionId: string,
  revokeAll: boolean
) {
  return prisma.session.deleteMany({
    where: revokeAll
      ? { userId }
      : {
          userId,
          id: { not: currentSessionId },
        },
  })
}
