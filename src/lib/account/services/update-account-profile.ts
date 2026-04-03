import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { fail, ok, type Result } from '@/lib/shared/result'
import type { UpdateAccountInput } from '@/lib/account/schemas'
import type { AccountProfileSummary } from '@/lib/account/types'

export async function updateAccountProfile(
  userId: string,
  input: UpdateAccountInput
): Promise<Result<AccountProfileSummary, 'User not found' | 'Failed to update account profile'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    return fail('User not found')
  }

  try {
    const updatedUser = await prisma.user.update({
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

    return ok(updatedUser)
  } catch (error) {
    logger.error(
      { domain: 'account', userId, error: error instanceof Error ? error.message : String(error) },
      'Failed to update account profile'
    )
    return fail('Failed to update account profile')
  }
}
