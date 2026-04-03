import { prisma } from '@/lib/db'
import type { UserSearchResult } from '@/lib/users/types'

export interface SearchUsersFilter {
  query: string
  limit?: number
}

export async function searchUsersService(filters: SearchUsersFilter): Promise<UserSearchResult[]> {
  const { query, limit = 10 } = filters

  if (!query || query.trim().length < 2) {
    return []
  }

  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: limit,
  })
}
