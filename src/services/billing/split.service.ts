import { prisma } from '@/lib/db'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor, SplitType } from '@db'

export interface SplitConfigUpdate {
    companyName: string
    cnpj: string
    walletId: string
    splitType: SplitType
    percentualValue?: number
    fixedValue?: number
    description?: string
}

export class SplitService {
    /**
     * Retrieves the current active split configuration
     */
    static async getConfig() {
        return prisma.splitConfig.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Builds the Asaas split payload based on current configuration
     */
    static async buildSplitPayload() {
        const config = await this.getConfig()

        if (!config || !config.isActive) return undefined

        billingLog('info', 'Building split payload', {
            walletId: config.walletId,
            type: config.splitType
        })

        return [{
            walletId: config.walletId,
            ...(config.splitType === 'PERCENTAGE'
                ? { percentualValue: config.percentualValue }
                : { fixedValue: config.fixedValue }
            ),
            description: config.description || `Split para ${config.companyName}`
        }]
    }

    /**
     * Updates or creates the active split configuration.
     * Disables any previous active configuration to ensure only one is active.
     */
    static async updateConfig(data: SplitConfigUpdate, adminUserId: string) {
        const previous = await this.getConfig()

        return await prisma.$transaction(async (tx) => {
            // Deactivate all existing configs
            await tx.splitConfig.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            })

            // Create new active config
            const updated = await tx.splitConfig.create({
                data: { ...data, isActive: true },
            })

            // Audit log the update
            await BillingAuditService.log({
                userId: adminUserId,
                actor: AuditActor.ADMIN,
                action: 'SPLIT_CONFIG_UPDATED',
                entity: 'SplitConfig',
                entityId: updated.id,
                previousState: previous || undefined,
                newState: updated,
                metadata: { adminUserId },
            })

            billingLog('info', 'Split configuration updated', {
                id: updated.id,
                walletId: updated.walletId
            })

            return updated
        })
    }
}
