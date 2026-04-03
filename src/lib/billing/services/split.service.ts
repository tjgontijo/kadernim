import { prisma } from '@/lib/db'
import { buildAsaasSplitPayload, isSameWalletId, normalizeWalletId } from '@/lib/billing/split-payload'
import { billingLog } from './logger'
import { BillingAuditService } from './audit.service'
import { AuditActor, SplitType } from '@db'
import { BillingWalletService } from './wallet.service'

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
        const mainWalletId = await BillingWalletService.getMainWalletId()

        if (!config || !config.isActive) return undefined

        if (isSameWalletId(config.walletId, mainWalletId)) {
            billingLog('warn', 'Skipping split because target wallet matches billing main wallet', {
                walletId: config.walletId,
                mainWalletId,
            })

            return undefined
        }

        billingLog('info', 'Building split payload', {
            walletId: config.walletId,
            type: config.splitType
        })

        return buildAsaasSplitPayload(config, mainWalletId)
    }

    /**
     * Updates or creates the active split configuration.
     * Disables any previous active configuration to ensure only one is active.
     */
    static async updateConfig(data: SplitConfigUpdate, adminUserId: string) {
        const previous = await this.getConfig()
        const mainWalletId = await BillingWalletService.getMainWalletId()
        const walletId = normalizeWalletId(data.walletId)

        if (!walletId) {
            throw new Error('Wallet ID do split inválido.')
        }

        if (isSameWalletId(walletId, mainWalletId)) {
            throw new Error('A carteira de split nao pode ser a mesma carteira principal.')
        }

        return await prisma.$transaction(async (tx) => {
            // Deactivate all existing configs
            await tx.splitConfig.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            })

            const existing = await tx.splitConfig.findUnique({
                where: { walletId },
            })

            const nextConfigData = {
                ...data,
                walletId,
                companyName: data.companyName.trim(),
                cnpj: data.cnpj.trim(),
                description: data.description?.trim() || null,
                isActive: true,
            }

            const updated = existing
                ? await tx.splitConfig.update({
                    where: { walletId },
                    data: nextConfigData,
                })
                : await tx.splitConfig.create({
                    data: nextConfigData,
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
