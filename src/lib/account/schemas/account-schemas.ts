import { z } from 'zod'

export const ACCOUNT_AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const ACCOUNT_AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'] as const

export const UpdateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
})

export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>

export const RevokeSessionsSchema = z.object({
  revokeAll: z.boolean().optional().default(false),
})

export type RevokeSessionsInput = z.infer<typeof RevokeSessionsSchema>

export const UploadAccountAvatarSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, { message: 'No file provided' })
    .refine((file) => ACCOUNT_AVATAR_ALLOWED_TYPES.includes(file.type as (typeof ACCOUNT_AVATAR_ALLOWED_TYPES)[number]), {
      message: 'Apenas JPG e PNG são permitidos',
    })
    .refine((file) => file.size <= ACCOUNT_AVATAR_MAX_BYTES, {
      message: 'A imagem deve ter no máximo 2MB',
    }),
})

export type UploadAccountAvatarInput = z.infer<typeof UploadAccountAvatarSchema>
