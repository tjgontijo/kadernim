import { SplitType } from '@db'

export interface SplitPayloadConfig {
  companyName: string
  walletId: string
  isActive: boolean
  splitType: SplitType
  percentualValue?: number | null
  fixedValue?: number | null
  description?: string | null
}

export interface AsaasSplitPayloadItem {
  walletId: string
  percentualValue?: number | null
  fixedValue?: number | null
  description: string
}

export function normalizeWalletId(walletId?: string | null) {
  const normalized = walletId?.trim().toLowerCase()
  return normalized ? normalized : null
}

export function isSameWalletId(walletId?: string | null, mainWalletId?: string | null) {
  const normalizedWalletId = normalizeWalletId(walletId)
  const normalizedMainWalletId = normalizeWalletId(mainWalletId)

  if (!normalizedWalletId || !normalizedMainWalletId) {
    return false
  }

  return normalizedWalletId === normalizedMainWalletId
}

export function buildAsaasSplitPayload(
  config?: SplitPayloadConfig | null,
  mainWalletId?: string | null,
): AsaasSplitPayloadItem[] | undefined {
  if (!config || !config.isActive || isSameWalletId(config.walletId, mainWalletId)) {
    return undefined
  }

  return [{
    walletId: config.walletId.trim(),
    ...(config.splitType === SplitType.PERCENTAGE
      ? { percentualValue: config.percentualValue ?? undefined }
      : { fixedValue: config.fixedValue ?? undefined }),
    description: config.description?.trim() || `Split para ${config.companyName}`,
  }]
}
