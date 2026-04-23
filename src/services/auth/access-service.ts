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
  // Se for admin, sempre tem acesso. Caso contrário, depende da assinatura ativa.
  if (ctx.isAdmin) {
    return PrismaNamespace.sql`TRUE`
  }

  return subscription.hasActiveSubscription 
    ? PrismaNamespace.sql`TRUE` 
    : PrismaNamespace.sql`FALSE`
}

/**
 * Cálculo de `hasAccess` para um recurso específico (tela de detalhe).
 */
export async function computeHasAccessForResource(
  ctx: UserAccessContext,
  subscription: SubscriptionContext,
  _resource: ResourceAccessInput
): Promise<boolean> {
  // Se for admin, sempre tem acesso. Caso contrário, depende da assinatura ativa.
  return ctx.isAdmin || subscription.hasActiveSubscription
}
