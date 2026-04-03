import { prisma } from '@/lib/db'

export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user.role
}
