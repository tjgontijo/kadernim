import type {
  BillingAsaasSettings,
  BillingAsaasSettingsUpdate,
  CheckoutRequest,
  GuestCheckoutRequest,
  SplitUpdate,
} from '@/lib/billing/schemas'

export type {
  BillingAsaasSettings,
  BillingAsaasSettingsUpdate,
  CheckoutRequest,
  GuestCheckoutRequest,
  SplitUpdate,
}

export interface BillingWalletConfig {
  mainWalletId: string | null
}

export interface BillingPixStatusResponse {
  id: string
  status: string
}

export interface BillingCheckoutResponse {
  qrCodePayload?: string
  qrCodeImage?: string
  expirationDate?: string
  authorizationId?: string
  invoiceId?: string
  amountLabel?: string
  statusToken?: string
  status?: string
  checkoutAuthToken?: string
}
