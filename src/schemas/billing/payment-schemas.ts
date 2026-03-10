import { z } from 'zod'
import { PaymentMethod } from '@db'

function isValidCpfCnpj(value: string) {
    const clean = value.replace(/\D/g, '')
    return clean.length === 11 || clean.length === 14
}

export const CheckoutRequestSchema = z.object({
    cpfCnpj: z.string().refine(isValidCpfCnpj, {
        message: 'CPF ou CNPJ inválido',
    }),
    paymentMethod: z.nativeEnum(PaymentMethod, {
        message: 'Método de pagamento inválido',
    }),
    // Token do cartão via Asaas.js ou dados brutos (se não usar tokenização via front)
    creditCard: z.object({
        holderName: z.string().min(3, 'Nome no cartão inválido').optional(),
        number: z.string().min(14, 'Número do cartão inválido').optional(),
        expiryMonth: z.string().min(2, 'Mês inválido').optional(),
        expiryYear: z.string().min(4, 'Ano inválido').optional(),
        ccv: z.string().min(3, 'CCV inválido').optional(),
    }).optional(),
    creditCardToken: z.string().optional(),
    planId: z.string().optional()
}).refine((data) => {
    if (data.paymentMethod === 'CREDIT_CARD') {
        const hasRawData = data.creditCard?.holderName && data.creditCard?.number && data.creditCard?.expiryMonth && data.creditCard?.expiryYear && data.creditCard?.ccv
        const hasToken = !!data.creditCardToken
        if (!hasRawData && !hasToken) {
            return false
        }
    }
    return true
}, {
    message: 'Dados do cartão de crédito obrigatórios',
    path: ['creditCard']
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>
