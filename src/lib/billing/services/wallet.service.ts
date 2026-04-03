import { normalizeWalletId } from '@/lib/billing/split-payload'
import { billingLog } from './logger'

export interface BillingMainWalletUpdate {
  mainWalletId: string
}

export class BillingWalletService {
  static async getMainWalletId() {
    const walletId = process.env.WALLET_ASAAS_ID ?? null
    return normalizeWalletId(walletId)
  }

  static async getConfig() {
    return {
      mainWalletId: await this.getMainWalletId(),
    }
  }

  static async updateMainWallet(data: BillingMainWalletUpdate) {
    const mainWalletId = normalizeWalletId(data.mainWalletId)

    if (!mainWalletId) {
      throw new Error('Wallet principal inválida.')
    }

    billingLog('warn', 'Attempt to update Asaas wallet via API while env-managed', {
      mainWalletId,
    })

    throw new Error('A carteira principal do Asaas agora é gerenciada via variável de ambiente (.env).')
  }
}
