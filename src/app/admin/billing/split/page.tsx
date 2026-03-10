import { Metadata } from 'next'
import { auth } from '@/server/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SplitService } from '@/services/billing/split.service'
import { SplitConfigForm } from '@/components/dashboard/billing/split-config-form'

export const metadata: Metadata = {
    title: 'Configuração de Split | Kadernim Admin',
    description: 'Gestão de divisão de pagamentos entre empresas.',
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
    const config = await SplitService.getConfig()

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Divisão de Pagamentos (Split)</h2>
                <div className="flex items-center space-x-2">
                    {/* Action buttons could go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    {/* Form Component will be Client Component */}
                    <SplitConfigForm initialData={config as any} userId={session.user.id} />
                </div>

                <div className="col-span-3">
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
        </div>
    )
}
