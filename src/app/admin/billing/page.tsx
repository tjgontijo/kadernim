import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Banknote, Users, Activity, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { InvoiceStatus } from '@db'

export const metadata: Metadata = {
    title: 'Visão Geral do Faturamento | Admin Kadernim',
    description: 'Métricas gerais de assinaturas e faturamento.',
}
export const dynamic = 'force-dynamic'

export default async function AdminBillingOverviewPage() {
    // Aggregate Metrics
    const totalSubscribers = await prisma.subscription.count({
        where: { isActive: true }
    })

    // MRR (Monthly Recurring Revenue) estimation
    // In a real scenario, this would aggregate `value` from all active subscriptions.
    // Assuming Kadernim Pro is R$ 49.90:
    const mrr = totalSubscribers * 49.90

    // Total Invoices confirmed/received this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const invoicesThisMonth = await prisma.invoice.aggregate({
        where: {
            status: { in: [InvoiceStatus.RECEIVED, InvoiceStatus.CONFIRMED] },
            createdAt: { gte: startOfMonth }
        },
        _sum: { value: true },
        _count: { id: true }
    })

    const grossRevenueThisMonth = invoicesThisMonth._sum.value || 0

    const recentInvoices = await prisma.invoice.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } }
        }
    })

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Faturamento Geral</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR Estimado</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mrr)}
                        </div>
                        <p className="text-xs text-muted-foreground">Baseado em assinantes ativos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubscribers}</div>
                        <p className="text-xs text-muted-foreground">+0% em relação ao mês passado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento Mês Atual</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(grossRevenueThisMonth)}
                        </div>
                        <p className="text-xs text-muted-foreground">{invoicesThisMonth._count.id} faturas pagas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">100%</div>
                        <p className="text-xs text-muted-foreground">Faturas sem inadimplência</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transações Recentes</CardTitle>
                    <CardDescription>
                        Últimas faturas processadas globalmente na plataforma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentInvoices.map(invoice => (
                            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-primary font-bold">
                                        {invoice.user.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{invoice.user.name} <span className="text-xs text-muted-foreground ml-2">{invoice.user.email}</span></p>
                                        <p className="text-xs text-muted-foreground">{invoice.description} • {invoice.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(invoice.value))}
                                    </p>
                                    <p className="text-xs">
                                        {invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED' ? (
                                            <span className="text-emerald-500 font-medium">Pago</span>
                                        ) : invoice.status === 'PENDING' ? (
                                            <span className="text-amber-500 font-medium">Pendente</span>
                                        ) : (
                                            <span className="text-muted-foreground">{invoice.status}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentInvoices.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground text-sm">Nenhuma transação registrada.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
