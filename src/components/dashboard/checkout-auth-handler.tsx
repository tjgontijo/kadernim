'use client'

import { useCheckoutToken } from '@/lib/auth/use-checkout-token'

export function CheckoutAuthHandler() {
  useCheckoutToken()
  return null
}
