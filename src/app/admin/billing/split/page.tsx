import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { SplitConfigForm } from '@/components/dashboard/billing/split-config-form'
import { auth } from '@/server/auth/auth'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Split de Pagamento | Kadernim Admin',
    description: 'Configuração do parceiro e das regras de split do Asaas.',
}

export default async function AdminSplitPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return redirect('/')
    }

    const { initialSplitConfig, hasMainWallet } = await BillingAdminService.getSplitPageData()

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Split de Pagamento</h2>
            </div>

            {!hasMainWallet && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Configure a carteira principal antes de salvar o split.
                </div>
            )}

            <div className="max-w-2xl">
                <SplitConfigForm initialData={initialSplitConfig} />
            </div>
        </div>
    )
}
