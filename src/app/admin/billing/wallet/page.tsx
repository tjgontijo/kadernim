import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { MainWalletForm } from '@/components/dashboard/billing/main-wallet-form'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/server/auth/auth'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Carteira Principal Asaas | Kadernim Admin',
    description: 'Configuração da carteira principal emissora no Asaas.',
}

export default async function AdminBillingWalletPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return redirect('/')
    }

    const { billingWallet, hasActiveSplit } = await BillingAdminService.getWalletPageData()

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Carteira Principal Asaas</h2>
                <Badge variant={hasActiveSplit ? 'secondary' : 'outline'}>
                    Split {hasActiveSplit ? 'ativo' : 'inativo'}
                </Badge>
            </div>

            <div className="max-w-xl">
                <MainWalletForm initialData={{ mainWalletId: billingWallet.mainWalletId ?? '' }} />
            </div>
        </div>
    )
}
