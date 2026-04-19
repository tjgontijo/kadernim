import { Prisma as PrismaNamespace } from '@/lib/db'
import type { Prisma } from '@/lib/db'
import { prisma } from '@/lib/db'

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
 *
 * Regra do PRD:
 * - Usuário é admin
 * - OU usuário possui assinatura ativa
 */
export function buildHasAccessConditionSql(
  ctx: UserAccessContext,
  subscription: SubscriptionContext
): Prisma.Sql {
  if (ctx.isAdmin) {
    // Admin sempre tem acesso
    return PrismaNamespace.sql`TRUE`
  }

  const hasFullAccess = subscription.hasActiveSubscription

  return PrismaNamespace.sql`${hasFullAccess}`
}

/**
 * Cálculo de `hasAccess` para um recurso específico (tela de detalhe).
 *
 * Implementa a mesma regra da listagem, mas em TS/Prisma, para ser usada
 * fora de SQL raw (por exemplo em `GET /api/v1/resources/[id]`).
 */
export async function computeHasAccessForResource(
  ctx: UserAccessContext,
  subscription: SubscriptionContext,
  _resource: ResourceAccessInput
): Promise<boolean> {
  if (ctx.isAdmin) {
    return true
  }

  if (subscription.hasActiveSubscription) {
    return true
  }

  return false
}
