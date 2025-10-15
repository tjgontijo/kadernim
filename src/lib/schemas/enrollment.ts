// src/lib/schemas/enrollment.ts
import { z } from 'zod'

export const EnrollmentInput = z.object({
  store: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().optional(),
  whatsapp: z.string().optional(),
  product_ids: z.array(z.union([z.string(), z.number()])).min(1)
})
export type EnrollmentInput = z.infer<typeof EnrollmentInput>
