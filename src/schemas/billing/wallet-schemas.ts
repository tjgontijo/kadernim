import { z } from 'zod'

export const BillingMainWalletUpdateSchema = z.object({
  mainWalletId: z.string().trim().uuid('Wallet ID principal inválido'),
})

export type BillingMainWalletUpdate = z.infer<typeof BillingMainWalletUpdateSchema>
