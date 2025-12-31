import { prisma } from '@/lib/prisma'

export interface SearchUsersFilter {
  query: string
  limit?: number
}

export interface UserSearchResult {
  id: string
  name: string
  email: string
}

/**
 * Search users by name or email
 */
export async function searchUsersService(
  filters: SearchUsersFilter
): Promise<UserSearchResult[]> {
  const { query, limit = 10 } = filters

  if (!query || query.trim().length < 2) {
    return []
  }

  const users = await prisma.user.findMany({
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

  return users
}
