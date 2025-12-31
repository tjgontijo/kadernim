import { Prisma as PrismaNamespace } from '@/lib/prisma'
import type { Prisma } from '@/lib/prisma'

import { prisma } from '@/lib/prisma'

export type UserAccessContext = {
  userId: string
  isAdmin: boolean
}

export type SubscriptionContext = {
  hasActiveSubscription: boolean
}

export type ResourceAccessInput = {
  resourceId: string
  isFree: boolean
}

/**
 * Condição SQL para calcular `hasAccess` em listagens de recursos.
 *
 * Regra (PRD + implementação atual):
 * - isFree = true
 * - OU usuário é admin
 * - OU usuário possui assinatura ativa
 * - OU existe registro em user_resource_access não expirado
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

  return PrismaNamespace.sql`(
    r."isFree"
    OR ${hasFullAccess}
    OR EXISTS(
      SELECT 1
      FROM "user_resource_access" ura
      WHERE ura."resourceId" = r.id
        AND ura."userId" = ${ctx.userId}
        AND (ura."expiresAt" IS NULL OR ura."expiresAt" > NOW())
    )
  )`
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
  resource: ResourceAccessInput
): Promise<boolean> {
  if (ctx.isAdmin) {
    return true
  }

  if (resource.isFree) {
    return true
  }

  if (subscription.hasActiveSubscription) {
    return true
  }

  const accessEntry = await prisma.userResourceAccess.findFirst({
    where: {
      userId: ctx.userId,
      resourceId: resource.resourceId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { id: true },
  })

  return Boolean(accessEntry)
}
