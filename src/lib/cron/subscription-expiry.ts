// src/lib/cron/subscription-expiry.ts
import { prisma } from '@/lib/prisma'

/**
 * Serviço para gerenciar expiração de subscriptions
 * Deve ser executado periodicamente (ex: a cada hora)
 */
export class SubscriptionExpiryService {
  /**
   * Verifica e atualiza subscriptions expiradas
   */
  static async processExpiredSubscriptions() {
    const now = new Date()
    
    try {
      // Buscar subscriptions ativas que expiraram
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          isActive: true,
          expiresAt: {
            lte: now
          }
        },
        include: {
          user: true
        }
      })

      console.log(`Processando ${expiredSubscriptions.length} subscriptions expiradas`)

      // Processar cada subscription expirada
      for (const subscription of expiredSubscriptions) {
        await prisma.$transaction(async (tx) => {
          // Desativar a subscription
          await tx.subscription.update({
            where: { id: subscription.id },
            data: { 
              isActive: false,
              metadata: {
                ...(subscription.metadata as Record<string, unknown> || {}),
                expiredAt: now.toISOString(),
                processedAt: now.toISOString()
              }
            }
          })

          // Verificar se o usuário tem outras subscriptions ativas
          const activeSubscriptions = await tx.subscription.findMany({
            where: {
              userId: subscription.userId,
              isActive: true,
              OR: [
                { expiresAt: null }, // Subscriptions sem expiração
                { expiresAt: { gt: now } } // Subscriptions ainda válidas
              ]
            }
          })

          // Determinar nova role baseada nas subscriptions ativas
          const newRole = activeSubscriptions.length > 0 ? 'subscriber' : 'user'
          const newSubscriptionTier = activeSubscriptions.length > 0 ? 'premium' : 'free'

          // Atualizar role do usuário
          await tx.user.update({
            where: { id: subscription.userId },
            data: {
              role: newRole,
              subscriptionTier: newSubscriptionTier
            }
          })

          console.log(`Usuário ${subscription.user.email} teve role alterada para ${newRole}`)
        })
      }

      return {
        processed: expiredSubscriptions.length,
        timestamp: now
      }
    } catch (error) {
      console.error('Erro ao processar subscriptions expiradas:', error)
      throw error
    }
  }

  /**
   * Busca subscriptions que expiram em breve para notificações
   */
  static async getExpiringSubscriptions(daysAhead: number = 7) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    return prisma.subscription.findMany({
      where: {
        isActive: true,
        expiresAt: {
          gte: new Date(),
          lte: futureDate
        }
      },
      include: {
        user: true,
        plan: true
      }
    })
  }

  /**
   * Estatísticas de subscriptions
   */
  static async getSubscriptionStats() {
    const [active, expired, expiringSoon] = await Promise.all([
      prisma.subscription.count({
        where: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }),
      prisma.subscription.count({
        where: {
          isActive: false
        }
      }),
      prisma.subscription.count({
        where: {
          isActive: true,
          expiresAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
          }
        }
      })
    ])

    return {
      active,
      expired,
      expiringSoon
    }
  }
}