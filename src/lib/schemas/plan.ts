import { z } from 'zod'

export const PlanPublicDTO = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  priceMonthly: z.number().nullable().optional(),
  durationDays: z.number().nullable().optional(),
  productId: z.string().nullable().optional(),
  store: z.string(),
  isActive: z.boolean()
})

export type PlanPublic = z.infer<typeof PlanPublicDTO>
