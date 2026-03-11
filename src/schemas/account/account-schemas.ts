import { z } from 'zod'

export const UpdateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
})

export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>

export const RevokeSessionsSchema = z.object({
  revokeAll: z.boolean().optional().default(false),
})

export type RevokeSessionsInput = z.infer<typeof RevokeSessionsSchema>
