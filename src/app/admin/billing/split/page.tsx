import { Metadata } from 'next'
import { auth } from '@/server/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SplitService } from '@/services/billing/split.service'
import { BillingWalletService } from '@/services/billing/wallet.service'
import { MainWalletForm } from '@/components/dashboard/billing/main-wallet-form'
import { SplitConfigForm } from '@/components/dashboard/billing/split-config-form'

export const metadata: Metadata = {
    title: 'Carteira e Split Asaas | Kadernim Admin',
    description: 'Gestão da carteira principal e do split de pagamentos.',
}

/**
 * Admin: Split Configuration Page
 * Server-First approach: fetches data on the server and handles authorization.
 */
export default async function AdminSplitPage() {
    // Authorization check on server
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return redirect('/')
    }

    // Pre-fetch active configuration
    const [config, billingWallet] = await Promise.all([
        SplitService.getConfig(),
        BillingWalletService.getConfig(),
    ])
    const initialSplitConfig = config ? {
        companyName: config.companyName,
        cnpj: config.cnpj,
        walletId: config.walletId,
        splitType: config.splitType,
        percentualValue: config.percentualValue ?? undefined,
        fixedValue: config.fixedValue ?? undefined,
        description: config.description ?? undefined,
    } : undefined

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Carteira e Split Asaas</h2>
                <div className="flex items-center space-x-2">
                    {/* Action buttons could go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3">
                    <MainWalletForm initialData={{ mainWalletId: billingWallet.mainWalletId ?? '' }} />
                </div>

                <div className="col-span-4">
                    <SplitConfigForm initialData={initialSplitConfig} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm backdrop-blur-md">
                    <h3 className="mb-4 text-xl font-semibold">Ordem correta de cadastro</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Primeiro cadastre a <strong>carteira principal da Kadernim</strong>. Ela representa a conta que cria a cobranca.
                        </p>
                        <p>
                            Depois cadastre o <strong>destino do split</strong>, que deve ser sempre a carteira da subconta ou parceiro.
                        </p>
                        <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20 text-amber-400">
                            <p className="font-medium">Regra de seguranca:</p>
                            <p>Se a carteira do split for igual a carteira principal, o sistema ignora o split no checkout e bloqueia o salvamento dessa configuracao no admin.</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm backdrop-blur-md">
                    <h3 className="mb-4 text-xl font-semibold">Como funciona o Split?</h3>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            O split permite dividir o valor de cada transação automaticamente entre a
                            <strong> Kadernim</strong> e uma empresa parceira.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>Percentual:</strong> Define uma porcentagem (ex: 30%) que será desviada para a conta destino.
                            </li>
                            <li>
                                <strong>Valor Fixo:</strong> Define um valor em reais (ex: R$ 10,00) a ser descontado de cada venda.
                            </li>
                            <li>
                                <strong>Segurança:</strong> O split é processado diretamente pelo Asaas após a liquidação do pagamento.
                            </li>
                        </ul>
                        <div className="rounded-lg bg-orange-500/10 p-4 border border-orange-500/20 text-orange-400">
                            <p className="font-medium">Importante:</p>
                            <p>Alterações no split afetam apenas NOVAS cobranças criadas a partir do momento do salvamento.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
