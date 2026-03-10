import { z } from 'zod'
import { SplitType } from '@db'

export const SplitUpdateSchema = z.object({
    companyName: z.string().min(3, 'Nome da empresa é obrigatório'),
    cnpj: z.string().min(14, 'CNPJ inválido'),
    walletId: z.string().min(10, 'Wallet ID inválido'),
    splitType: z.nativeEnum(SplitType),
    percentualValue: z.number().min(0.01).max(99.99).optional(),
    fixedValue: z.number().min(0.01).optional(),
    description: z.string().optional(),
}).refine((data) => {
    if (data.splitType === 'PERCENTAGE' && !data.percentualValue) {
        return false
    }
    if (data.splitType === 'FIXED' && !data.fixedValue) {
        return false
    }
    return true
}, {
    message: 'Valor percentual ou fixo deve ser informado dependendo do tipo.',
    path: ['percentualValue']
})

export type SplitUpdate = z.infer<typeof SplitUpdateSchema>
