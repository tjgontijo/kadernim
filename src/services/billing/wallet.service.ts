import { getConfig, setConfig } from '@/services/config/system-config'
import { normalizeWalletId } from '@/lib/billing/split-payload'
import { billingLog } from './logger'

const MAIN_WALLET_CONFIG_KEY = 'billing.asaas.mainWalletId'

export interface BillingMainWalletUpdate {
  mainWalletId: string
}

export class BillingWalletService {
  static async getMainWalletId() {
    const walletId = await getConfig<string | null>(MAIN_WALLET_CONFIG_KEY, null)
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

    await setConfig(MAIN_WALLET_CONFIG_KEY, mainWalletId, 'string')

    billingLog('info', 'Billing main wallet updated', {
      mainWalletId,
    })

    return { mainWalletId }
  }
}
