import { Metadata } from 'next'
import { Activity, Banknote, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Visão Geral do Faturamento | Admin Kadernim',
    description: 'Métricas gerais de assinaturas e faturamento.',
}

export const dynamic = 'force-dynamic'

export default async function AdminBillingOverviewPage() {
    const {
        totalSubscribers,
        grossRevenueThisMonth,
        paidInvoicesThisMonth,
        pendingInvoicesCount,
        overdueInvoicesCount,
        recentInvoices,
    } = await BillingAdminService.getOverviewData()

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Faturamento Geral</h2>
            </div>

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
                        <div className="text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grossRevenueThisMonth)}
                        </div>
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
                        {recentInvoices.map(invoice => (
                            <div key={invoice.id} className="flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">{invoice.user.name || 'Sem nome'}</p>
                                    <p className="truncate text-xs text-muted-foreground">{invoice.user.email}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {invoice.description} • {invoice.paymentMethod}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(invoice.value))}
                                    </p>
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
                            <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma transação registrada.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
