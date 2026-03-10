'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckoutRequest, CheckoutRequestSchema } from '@/schemas/billing/payment-schemas'
import { toast } from 'sonner'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaymentMethod } from '@db'
import { PixQrCode } from './checkout-pix-qrcode'
import { CreditCard, QrCode, RefreshCcw } from 'lucide-react'

// Masks CPF inside the input
const formatCpfCnpj = (value: string) => {
    const clean = value.replace(/\D/g, '')
    if (clean.length <= 11) {
        return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

export function CheckoutForm({ user }: { user: { name: string; email: string } }) {
    const [loading, setLoading] = useState(false)
    const [pixData, setPixData] = useState<{
        payload: string
        image: string
        expirationDate: string
        invoiceId: string
        isAutomatic?: boolean
    } | null>(null)

    const form = useForm<CheckoutRequest>({
        resolver: zodResolver(CheckoutRequestSchema),
        defaultValues: {
            cpfCnpj: '',
            paymentMethod: (process.env.NEXT_PUBLIC_BILLING_PIX_METHOD as any) || PaymentMethod.PIX_AUTOMATIC,
        },
    })

    const selectedMethod = form.watch('paymentMethod')

    const onSubmit = async (values: CheckoutRequest) => {
        setLoading(true)
        try {
            const response = await fetch('/api/v1/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cpfCnpj: values.cpfCnpj.replace(/\D/g, ''),
                    paymentMethod: values.paymentMethod,
                    creditCard: values.paymentMethod === 'CREDIT_CARD' ? {
                        holderName: values.creditCard?.holderName,
                        number: values.creditCard?.number?.replace(/\D/g, ''),
                        expiryMonth: values.creditCard?.expiryMonth,
                        expiryYear: values.creditCard?.expiryYear,
                        ccv: values.creditCard?.ccv
                    } : undefined
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao processar pagamento')
            }

            if (values.paymentMethod === 'PIX' || values.paymentMethod === 'PIX_AUTOMATIC') {
                setPixData({
                    payload: data.qrCodePayload,
                    image: data.qrCodeImage,
                    expirationDate: data.expirationDate,
                    invoiceId: data.authorizationId || data.invoiceId, // We use authorizationId for PIX_AUTOMATIC
                    isAutomatic: values.paymentMethod === 'PIX_AUTOMATIC'
                })
            } else if (values.paymentMethod === 'CREDIT_CARD') {
                if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
                    toast.success('Pagamento aprovado!')
                    window.location.href = '/dashboard?success=true'
                } else {
                    toast.info('Pagamento em processamento. Você será notificado.')
                    window.location.href = '/dashboard?pending=true'
                }
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (pixData) {
        return (
            <PixQrCode
                payload={pixData.payload}
                image={pixData.image}
                expirationDate={pixData.expirationDate}
                invoiceId={pixData.invoiceId}
                isAutomatic={pixData.isAutomatic}
                onSuccess={() => window.location.href = '/dashboard?success=true'}
            />
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in slide-in-from-bottom-[5%] fade-in duration-500">

                {/* User Data */}
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500">Nome Completo</label>
                            <div className="h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md truncate">
                                {user.name}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500">E-mail</label>
                            <div className="h-10 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md truncate">
                                {user.email}
                            </div>
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="cpfCnpj"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-gray-500">CPF ou CNPJ</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-11 text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                        placeholder="000.000.000-00"
                                        {...field}
                                        onChange={(e) => {
                                            const masked = formatCpfCnpj(e.target.value)
                                            field.onChange(masked)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Payment Method */}
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-gray-500">Método de pagamento</label>

                    <div className="flex rounded-lg bg-gray-100/80 p-1 border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => form.setValue('paymentMethod', (process.env.NEXT_PUBLIC_BILLING_PIX_METHOD as any) || PaymentMethod.PIX_AUTOMATIC)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${selectedMethod === PaymentMethod.PIX_AUTOMATIC || selectedMethod === PaymentMethod.PIX ? 'bg-white text-emerald-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        >
                            <QrCode className="h-4 w-4" />
                            Pix
                        </button>

                        <button
                            type="button"
                            onClick={() => form.setValue('paymentMethod', PaymentMethod.CREDIT_CARD)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all ${selectedMethod === PaymentMethod.CREDIT_CARD ? 'bg-white text-emerald-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                        >
                            <CreditCard className="h-4 w-4" />
                            Cartão
                        </button>
                    </div>
                    {form.formState.errors.paymentMethod && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.paymentMethod.message}</p>
                    )}
                </div>

                {/* Credit Card Inputs */}
                {selectedMethod === PaymentMethod.CREDIT_CARD && (
                    <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                        <FormField
                            control={form.control}
                            name="creditCard.number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-500">Número do Cartão</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                className="h-11 pl-9 text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                {...field}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '')
                                                    val = val.replace(/(\d{4})(?=\d)/g, '$1 ')
                                                    field.onChange(val)
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="creditCard.holderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-gray-500">Nome no Cartão</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="NOME IGUAL AO CARTÃO"
                                            className="uppercase h-11 text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <FormField
                                control={form.control}
                                name="creditCard.expiryMonth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500">Mês</FormLabel>
                                        <FormControl>
                                            <Input className="h-11 text-center text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" placeholder="MM" maxLength={2} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="creditCard.expiryYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500">Ano</FormLabel>
                                        <FormControl>
                                            <Input className="h-11 text-center text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" placeholder="AAAA" maxLength={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="creditCard.ccv"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-gray-500">CVC</FormLabel>
                                        <FormControl>
                                            <Input className="h-11 text-center text-sm bg-white border-gray-300 rounded-lg focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500" placeholder="123" maxLength={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Total & Submit */}
                <div className="pt-6 mt-4">
                    <Button
                        size="lg"
                        className="w-full text-sm h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                                Processando...
                            </div>
                        ) : 'Assinar por R$ 49,90 / mês'}
                    </Button>
                </div>

            </form>
        </Form>
    )
}
