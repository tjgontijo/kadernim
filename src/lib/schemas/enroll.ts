import { z } from 'zod'
import { validateWhatsApp, normalizeWhatsApp } from '@/lib/helpers/phone'

export const EnrollmentPayloadSchema = z
  .object({
    store: z
      .string({ message: 'Loja é obrigatória' })
      .trim()
      .min(1, { message: 'Loja inválida' }),
    name: z
      .string({ message: 'Nome é obrigatório' })
      .trim()
      .min(3, { message: 'Nome muito curto' })
      .max(120, { message: 'Nome muito longo' }),
    email: z
      .string({ message: 'Email é obrigatório' })
      .trim()
      .email({ message: 'Email inválido' }),
    phone: z
      .string({ message: 'Telefone é obrigatório' })
      .transform((value) => value.trim())
      .pipe(
        z
          .string()
          .refine((value) => validateWhatsApp(value), {
            message: 'Telefone inválido. Informe DDD + número com 10 ou 11 dígitos',
          })
          .transform((value) => normalizeWhatsApp(value)),
      ),
    expiresAt: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || !Number.isNaN(new Date(value).valueOf()),
        { message: 'Data de expiração inválida' }
      )
      .transform((value) => (value ? new Date(value) : null)),
    product_ids: z
      .array(
        z
          .number({ message: 'product_id inválido' })
          .int({ message: 'product_id deve ser inteiro' })
          .positive({ message: 'product_id deve ser positivo' })
      )
      .min(1, { message: 'Informe ao menos um product_id' })
      .max(10, { message: 'Limite de 10 product_ids por requisição' }),
  })
  .superRefine((data, ctx) => {
    if (data.expiresAt && Number.isNaN(data.expiresAt.valueOf())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAt'],
        message: 'Data de expiração inválida',
      })
    }
  })

export type EnrollmentPayload = z.infer<typeof EnrollmentPayloadSchema>

