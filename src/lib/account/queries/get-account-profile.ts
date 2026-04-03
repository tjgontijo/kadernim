import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import type { AccountProfile, AccountVersionInfo } from '@/lib/account/types'

const VersionInfoSchema = z.object({
  version: z.string(),
  buildAt: z.string(),
})

async function readLatestVersion(): Promise<AccountVersionInfo | null> {
  const versionPath = path.join(process.cwd(), 'public/version.json')

  try {
    const file = await readFile(versionPath, 'utf8')
    const parsed = VersionInfoSchema.safeParse(JSON.parse(file))

    if (!parsed.success) {
      logger.warn(
        { domain: 'account', file: versionPath, issues: parsed.error.issues },
        'Invalid version manifest payload'
      )
      return null
    }

    return parsed.data
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : null

    if (errorCode !== 'ENOENT') {
      logger.warn(
        { domain: 'account', file: versionPath, error: error instanceof Error ? error.message : String(error) },
        'Failed to read version manifest'
      )
    }

    return null
  }
}

export async function getAccountProfile(userId: string): Promise<AccountProfile | null> {
  const [user, latestVersion] = await Promise.all([
    prisma.user.findUnique({
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
    }),
    readLatestVersion(),
  ])

  if (!user) {
    return null
  }

  return {
    ...user,
    latestVersion,
  }
}
