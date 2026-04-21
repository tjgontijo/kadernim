import { Prisma as PrismaNamespace } from '@/lib/db'
import type { Prisma } from '@/lib/db'

export type UserAccessContext = {
  userId: string
  isAdmin: boolean
}

export type SubscriptionContext = {
  hasActiveSubscription: boolean
}

export type ResourceAccessInput = {
  resourceId: string
}

/**
 * Condição SQL para calcular `hasAccess` em listagens de recursos.
 */
export function buildHasAccessConditionSql(
  ctx: UserAccessContext,
  subscription: SubscriptionContext
): Prisma.Sql {
  void ctx
  void subscription
  return PrismaNamespace.sql`TRUE`
}

/**
 * Cálculo de `hasAccess` para um recurso específico (tela de detalhe).
 */
export async function computeHasAccessForResource(
  ctx: UserAccessContext,
  subscription: SubscriptionContext,
  _resource: ResourceAccessInput
): Promise<boolean> {
  void ctx
  void subscription
  return true
}
