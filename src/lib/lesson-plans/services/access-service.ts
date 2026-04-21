import { NextRequest } from 'next/server'
import { isStaff } from '@/lib/auth/roles'
import { prisma } from '@/lib/db'
import { auth } from '@/server/auth/auth'

export type PlannerAccess = {
  userId: string
  role: string | null
  isAdmin: boolean
  hasSubscription: boolean
}

export async function getPlannerAccess(request: NextRequest): Promise<PlannerAccess | null> {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  const role = session.user.role ?? null
  const admin = isStaff(role as never)

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  })

  return {
    userId,
    role,
    isAdmin: admin,
    hasSubscription: Boolean(subscription),
  }
}

export function hasPlannerAccess(access: PlannerAccess) {
  return access.isAdmin || access.hasSubscription
}
