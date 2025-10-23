// src/domain/enrollment/enrollment.service.ts
import { prisma } from '@/lib/prisma'
import { EnrollmentInput } from '@/lib/schemas/enrollment'
import { randomPassword } from '@/lib/helpers/password'
import { auth } from '@/lib/auth/auth'
import { Prisma } from '@prisma/client'
import { isWhatsAppNumberValid } from '@/services/whatsapp/uazapi/check'

type Result =
  | {
      kind: 'premium'
      userId: string
      email: string
      tempPassword?: string | null
      whatsapp?: string | null
      planName: string
      isNewUser: boolean
    }
  | {
      kind: 'individual'
      userId: string
      email: string
      tempPassword?: string | null
      whatsapp?: string | null
      hasPremium: boolean
      resources: { id: string; title: string }[]
      notFound: string[]
      isNewUser: boolean
    }

export class EnrollmentError extends Error {
  constructor(message: string, public code: string, public status: number = 400) {
    super(message)
    this.name = 'EnrollmentError'
  }
}

const UNIQUE_WHATSAPP_KEYS = ['user_whatsapp_key', 'User_whatsapp_key', 'whatsapp']
const UNIQUE_EMAIL_KEYS = ['user_email_key', 'User_email_key', 'email']

export async function enrollUser(
  input: EnrollmentInput,
  _opts: { apiBaseUrl: string }
): Promise<Result> {
  const productIds = input.product_ids.map(String)

  let user = await prisma.user.findUnique({ where: { email: input.email } })
  let tempPassword: string | null = user?.temporaryPassword ?? null
  let isNewUser = false

  if (input.whatsapp) {
    // Verificar se o número de WhatsApp é válido
    const isValid = await isWhatsAppNumberValid(input.whatsapp)
    if (!isValid) {
      throw new EnrollmentError('Número de WhatsApp inválido', 'invalid_whatsapp', 400)
    }
    
    // Verificar se já existe um usuário com este WhatsApp
    const existingByWhatsapp = await prisma.user.findUnique({ where: { whatsapp: input.whatsapp } })
    if (existingByWhatsapp && (!user || existingByWhatsapp.id !== user.id)) {
      throw new EnrollmentError('WhatsApp já cadastrado para outro usuário', 'duplicate_whatsapp', 409)
    }
  }

  if (!user) {
    tempPassword = randomPassword()
    try {
      const resp = await auth.api.signUpEmail({
        body: { name: input.name, email: input.email, password: tempPassword }
      })
      if (!resp) {
        throw new EnrollmentError('Falha ao criar usuário via auth', 'auth_signup_failed')
      }
    } catch (err) {
      console.error('Erro ao criar usuário via auth', err)
      throw new EnrollmentError('Falha ao criar usuário via auth', 'auth_signup_failed')
    }

    user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user) {
      throw new EnrollmentError('Usuário não encontrado após criação', 'user_not_found_after_auth')
    }

    isNewUser = true
  }

  let existingUser = user
  const passwordTempToReturn = isNewUser ? tempPassword : null

  try {
    return await prisma.$transaction(async tx => {
      if (isNewUser) {
        // Atualizar o usuário e obter o resultado atualizado
        const updatedUser = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            whatsapp: input.whatsapp,
            cpf: input.cpf,
            subscriptionTier: 'free',
            temporaryPassword: tempPassword
          }
        })
        
        // Atualizar a referência do usuário existente com os dados atualizados
        existingUser = updatedUser
      } else {
        // Para usuários existentes, atualizar whatsapp e outros campos se necessário
        // Definir um tipo específico para os campos que podem ser atualizados
        const updateData: {
          temporaryPassword?: null;
          whatsapp?: string;
          cpf?: string;
        } = {};
        
        if (existingUser.temporaryPassword) {
          updateData.temporaryPassword = null;
        }
        
        // Atualizar whatsapp se fornecido
        if (input.whatsapp) {
          updateData.whatsapp = input.whatsapp;
        }
        
        // Atualizar cpf se fornecido
        if (input.cpf) {
          updateData.cpf = input.cpf;
        }
        
        if (Object.keys(updateData).length > 0) {
          // Atualizar o usuário e obter o resultado atualizado
          const updatedUser = await tx.user.update({
            where: { id: existingUser.id },
            data: updateData
          });
          
          // Atualizar a referência do usuário existente
          existingUser = updatedUser;
        }
      }

      const premiumPlan = await tx.plan.findFirst({
        where: { productId: { in: productIds } }
      })

      if (premiumPlan) {
        const expiresAt = premiumPlan.durationDays
          ? new Date(Date.now() + premiumPlan.durationDays * 24 * 60 * 60 * 1000)
          : null

        await tx.subscription.upsert({
          where: { userId: existingUser.id },
          create: {
            userId: existingUser.id,
            planId: premiumPlan.id,
            productId: premiumPlan.productId,
            expiresAt,
            isActive: true,
            metadata: {
              purchasedAt: new Date().toISOString(),
              store: input.store,
              planName: premiumPlan.name,
              allProductIds: productIds
            }
          },
          update: {
            planId: premiumPlan.id,
            productId: premiumPlan.productId,
            expiresAt,
            isActive: true,
            purchaseDate: new Date(),
            metadata: {
              updatedAt: new Date().toISOString(),
              store: input.store,
              planName: premiumPlan.name,
              allProductIds: productIds
            }
          }
        })

        await tx.user.update({ where: { id: existingUser.id }, data: { subscriptionTier: 'premium' } })

        return {
          kind: 'premium',
          userId: existingUser.id,
          email: existingUser.email,
          whatsapp: existingUser.whatsapp,
          tempPassword: passwordTempToReturn,
          planName: premiumPlan.name,
          isNewUser
        }
      }

      const existingSub = await tx.subscription.findUnique({
        where: { userId: existingUser.id },
        include: { plan: true }
      })
      const hasPremium = !!(existingSub?.isActive && existingSub.plan && existingSub.plan.slug !== 'free')

      const granted: { id: string; title: string }[] = []
      const notFound: string[] = []

      for (const pid of productIds) {
        const mapping = await tx.externalProductMapping.findFirst({
          where: { productId: pid },
          include: { resource: true }
        })

        if (!mapping) {
          notFound.push(pid)
          continue
        }

        await tx.userResourceAccess.upsert({
          where: { userId_resourceId: { userId: existingUser.id, resourceId: mapping.resourceId } },
          update: {
            isActive: true,
            metadata: {
              updatedAt: new Date().toISOString(),
              purchasedIndividually: true,
              hasPremiumAtPurchase: hasPremium
            }
          },
          create: {
            userId: existingUser.id,
            resourceId: mapping.resourceId,
            isActive: true,
            metadata: {
              enrolledAt: new Date().toISOString(),
              enrollmentSource: 'api',
              store: mapping.store ?? input.store,
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
              userId: existingUser.id,
              planId: freePlan.id,
              isActive: true,
              metadata: {
                createdAt: new Date().toISOString(),
                reason: 'individual_resource_purchase'
              }
            }
          })
        }
      }

      return {
        kind: 'individual',
        userId: existingUser.id,
        email: existingUser.email,
        whatsapp: existingUser.whatsapp,
        tempPassword: passwordTempToReturn,
        hasPremium,
        resources: granted,
        notFound,
        isNewUser
      }
    })
  } catch (err) {
    if (err instanceof EnrollmentError) {
      throw err
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapPrismaKnownRequestError(err)
      if (mapped) {
        throw mapped
      }
    }

    throw err
  }
}

function mapPrismaKnownRequestError(err: Prisma.PrismaClientKnownRequestError): EnrollmentError | null {
  if (err.code !== 'P2002') return null

  const targets = normalizeTargets(err.meta?.target)

  if (targets.some(target => UNIQUE_WHATSAPP_KEYS.includes(target))) {
    return new EnrollmentError('WhatsApp já cadastrado para outro usuário', 'duplicate_whatsapp', 409)
  }

  if (targets.some(target => UNIQUE_EMAIL_KEYS.includes(target))) {
    return new EnrollmentError('E-mail já cadastrado', 'duplicate_email', 409)
  }

  return new EnrollmentError('Registro duplicado', 'duplicate_entry', 409)
}

function normalizeTargets(target: unknown): string[] {
  if (!target) return []
  if (Array.isArray(target)) return target.map(String)
  if (typeof target === 'string') return [target]
  return []
}
