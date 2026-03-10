import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/server/auth/auth'
import { CheckoutForm } from '@/components/dashboard/billing/checkout-form'
import { Check, ShieldCheck, Lock, CheckCircle2, Star } from 'lucide-react'
import Image from 'next/image'

export const metadata: Metadata = {
    title: 'Checkout | Kadernim Pro',
    description: 'Adquira agora o Kadernim Pro.',
}

export default async function CheckoutPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session.user) {
        // Redireciona para login e depois volta para o checkout
        return redirect('/login?callbackUrl=/checkout')
    }

    // Prepara os dados para o formulário
    const user = {
        name: session.user.name || 'Usuário',
        email: session.user.email,
    }

    return (
        <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center py-10 px-4 sm:py-20 font-sans">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">
                        Kadernim Pro
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Acesso total à plataforma e recursos ilimitados.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            <span>Gerador IA de planos de aula</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            <span>Habilidades da BNCC e Automações</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Container */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                    <CheckoutForm user={user} />
                </div>

                {/* Footer Security */}
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span className="text-[11px] font-medium uppercase tracking-widest">Pagamento Seguro</span>
                </div>

            </div>
        </div>
    )
}
