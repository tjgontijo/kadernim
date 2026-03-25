import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { format } from 'date-fns'
import { Activity, AlertTriangle, Banknote, TrendingUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SplitConfigForm } from '@/components/dashboard/billing/split-config-form'
import { BillingTabNav, type BillingTab } from '@/components/dashboard/billing/billing-tab-nav'
import { IntegrationConfigForm } from '@/components/dashboard/billing/integration-config-form'
import { auth } from '@/server/auth/auth'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Faturamento | Admin Kadernim',
    description: 'Gestão financeira e integração de faturamento.',
}

export const dynamic = 'force-dynamic'

const VALID_TABS: BillingTab[] = ['overview', 'integration', 'split', 'audit']

export default async function AdminBillingPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session || session.user.role !== 'admin') {
        return redirect('/')
    }

    const { tab: tabParam } = await searchParams
    const tab: BillingTab = VALID_TABS.includes(tabParam as BillingTab)
        ? (tabParam as BillingTab)
        : 'overview'

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight">Faturamento</h2>

            <Suspense fallback={<div className="h-10 border-b" />}>
                <BillingTabNav />
            </Suspense>

            <div className="pt-2">
                {tab === 'overview' && <OverviewTab />}
                {tab === 'integration' && <IntegrationTab />}
                {tab === 'split' && <SplitTab />}
                {tab === 'audit' && <AuditTab />}
            </div>
        </div>
    )
}

// ─── Tab: Overview ───────────────────────────────────────────────────────────

async function OverviewTab() {
    const {
        totalSubscribers,
        grossRevenueThisMonth,
        paidInvoicesThisMonth,
        pendingInvoicesCount,
        overdueInvoicesCount,
        recentInvoices,
    } = await BillingAdminService.getOverviewData()

    const brl = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubscribers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebido no Mês</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{brl(grossRevenueThisMonth)}</div>
                        <p className="text-xs text-muted-foreground">{paidInvoicesThisMonth} faturas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cobranças Pendentes</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingInvoicesCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cobranças em Atraso</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{overdueInvoicesCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {recentInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{invoice.user.name || 'Sem nome'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{invoice.user.email}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {invoice.description} • {invoice.paymentMethod}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">{brl(Number(invoice.value))}</p>
                                    <p className="text-xs">
                                        {invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED' ? (
                                            <span className="font-medium text-emerald-500">Pago</span>
                                        ) : invoice.status === 'PENDING' ? (
                                            <span className="font-medium text-amber-500">Pendente</span>
                                        ) : (
                                            <span className="text-muted-foreground">{invoice.status}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentInvoices.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Nenhuma transação registrada.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── Tab: Integration ─────────────────────────────────────────────────────────

async function IntegrationTab() {
    const [{ asaasConfig }, { billingWallet }] = await Promise.all([
        BillingAdminService.getIntegrationPageData(),
        BillingAdminService.getWalletPageData(),
    ])

    return (
        <div className="max-w-lg">
            <IntegrationConfigForm
                asaasConfig={asaasConfig}
                mainWalletId={billingWallet.mainWalletId}
            />
        </div>
    )
}

// ─── Tab: Split ───────────────────────────────────────────────────────────────

async function SplitTab() {
    const { initialSplitConfig, hasMainWallet } = await BillingAdminService.getSplitPageData()

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Split de Pagamento</h3>
                <p className="text-sm text-muted-foreground">
                    Configuração do parceiro e das regras de divisão de receita.
                </p>
            </div>

            {!hasMainWallet && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Configure a carteira principal (aba Integração) antes de salvar o split.
                </div>
            )}

            <SplitConfigForm initialData={initialSplitConfig} />
        </div>
    )
}

// ─── Tab: Audit ───────────────────────────────────────────────────────────────

async function AuditTab() {
    const { logs } = await BillingAdminService.getAuditPageData()

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Auditoria</h3>
                <p className="text-sm text-muted-foreground">
                    Histórico de eventos e alterações de configuração de faturamento.
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log.id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {log.entity} {log.entityId}
                                        </p>
                                        {log.user && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {log.user.email}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {log.actor}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-3 max-h-40 overflow-auto rounded-md bg-muted/40 p-2 font-mono text-xs text-muted-foreground">
                                    {JSON.stringify(log.newState || log.metadata, null, 2)}
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Nenhum evento registrado ainda.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
