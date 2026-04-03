import { z } from 'zod'

export const CustomerCreateSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpfCnpj: z.string().optional(),
    phone: z.string().optional(),
    mobilePhone: z.string().optional(),
    address: z.string().optional(),
    addressNumber: z.string().optional(),
    complement: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    externalReference: z.string().optional(), // Nosso userId
    notificationDisabled: z.boolean().default(false),
})

export const CustomerUpdateSchema = CustomerCreateSchema.partial()

export type CustomerCreate = z.infer<typeof CustomerCreateSchema>
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>
