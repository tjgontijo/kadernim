import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AsaasConfigForm } from '@/components/dashboard/billing/asaas-config-form'
import { Badge } from '@/components/ui/badge'
import { ASAAS_ENVIRONMENT_LABELS } from '@/lib/billing/asaas-config'
import { auth } from '@/server/auth/auth'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Integração Asaas | Kadernim Admin',
    description: 'Configuração operacional da integração com o Asaas.',
}

export default async function AdminBillingIntegrationPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || session.user.role !== 'admin') {
        return redirect('/')
    }

    const { asaasConfig } = await BillingAdminService.getIntegrationPageData()

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Integração Asaas</h2>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{ASAAS_ENVIRONMENT_LABELS[asaasConfig.environment]}</Badge>
                    <Badge variant={asaasConfig.hasApiKey ? 'secondary' : 'outline'}>
                        API Key {asaasConfig.hasApiKey ? 'ok' : 'pendente'}
                    </Badge>
                    <Badge variant={asaasConfig.hasWebhookToken ? 'secondary' : 'outline'}>
                        Webhook {asaasConfig.hasWebhookToken ? 'ok' : 'pendente'}
                    </Badge>
                </div>
            </div>

            <div className="max-w-xl">
                <AsaasConfigForm initialData={asaasConfig} />
            </div>
        </div>
    )
}
