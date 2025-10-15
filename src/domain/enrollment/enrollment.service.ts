// src/domain/enrollment/enrollment.service.ts
import { prisma } from '@/lib/prisma'
import { EnrollmentInput } from '@/lib/schemas/enrollment'
import { randomPassword } from '@/lib/helpers/password'
import { auth } from '@/lib/auth/auth'

type Result =
  | { kind: 'premium'; userId: string; email: string; tempPassword?: string | null; planName: string }
  | { kind: 'individual'; userId: string; email: string; tempPassword?: string | null; hasPremium: boolean; resources: { id: string; title: string }[]; notFound: string[] }

export async function enrollUser(input: EnrollmentInput, _opts: { apiBaseUrl: string }) : Promise<Result> {
  const productIds = input.product_ids.map(String)

  return await prisma.$transaction(async tx => {
    // 1 cria ou busca usuário
    let user = await tx.user.findUnique({ where: { email: input.email } })
    let tempPassword: string | null = null

    if (!user) {
      tempPassword = randomPassword()
      const resp = await auth.api.signUpEmail({
        body: { name: input.name, email: input.email, password: tempPassword }
      })
      if (!resp) throw new Error('Falha ao criar usuário')

      user = await tx.user.findUnique({ where: { email: input.email } })
      if (!user) throw new Error('Usuário não encontrado após criação')

      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          whatsapp: input.whatsapp,
          cpf: input.cpf,
          subscriptionTier: 'free'
        }
      })
    }

    // 2 verifica plano premium
    const premiumPlan = await tx.plan.findFirst({
      where: { productId: { in: productIds } }
    })

    if (premiumPlan) {
      const expiresAt = premiumPlan.durationDays
        ? new Date(Date.now() + premiumPlan.durationDays * 24 * 60 * 60 * 1000)
        : null

      await tx.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planId: premiumPlan.id,
          productId: premiumPlan.productId,
          expiresAt,
          isActive: true,
          metadata: { purchasedAt: new Date().toISOString(), store: input.store, planName: premiumPlan.name, allProductIds: productIds }
        },
        update: {
          planId: premiumPlan.id,
          productId: premiumPlan.productId,
          expiresAt,
          isActive: true,
          purchaseDate: new Date(),
          metadata: { updatedAt: new Date().toISOString(), store: input.store, planName: premiumPlan.name, allProductIds: productIds }
        }
      })

      await tx.user.update({ where: { id: user.id }, data: { subscriptionTier: 'premium' } })

      return { kind: 'premium', userId: user.id, email: user.email, tempPassword, planName: premiumPlan.name }
    }

    // 3 recursos individuais
    const existingSub = await tx.subscription.findUnique({ where: { userId: user.id }, include: { plan: true } })
    const hasPremium = !!(existingSub?.isActive && existingSub.plan && existingSub.plan.slug !== 'free')

    const granted: { id: string; title: string }[] = []
    const notFound: string[] = []

    for (const pid of productIds) {
      const mapping = await tx.externalProductMapping.findFirst({
        where: { productId: pid, store: input.store },
        include: { resource: true }
      })
      if (!mapping) {
        notFound.push(pid)
        continue
      }

      await tx.userResourceAccess.upsert({
        where: { userId_resourceId: { userId: user.id, resourceId: mapping.resourceId } },
        update: {
          isActive: true,
          metadata: { updatedAt: new Date().toISOString(), purchasedIndividually: true, hasPremiumAtPurchase: hasPremium }
        },
        create: {
          userId: user.id,
          resourceId: mapping.resourceId,
          isActive: true,
          metadata: {
            enrolledAt: new Date().toISOString(),
            enrollmentSource: 'api',
            store: input.store,
            productId: pid,
            purchasedIndividually: true,
            hasPremiumAtPurchase: hasPremium
          }
        }
      })

      granted.push({ id: mapping.resource.id, title: mapping.resource.title })
    }

    if (!existingSub) {
      const freePlan = await tx.plan.findUnique({ where: { slug: 'free' } })
      if (freePlan) {
        await tx.subscription.create({
          data: {
            userId: user.id,
            planId: freePlan.id,
            isActive: true,
            metadata: { createdAt: new Date().toISOString(), reason: 'individual_resource_purchase' }
          }
        })
      }
    }

    return { kind: 'individual', userId: user.id, email: user.email, tempPassword, hasPremium, resources: granted, notFound }
  })
}
