import { Metadata } from 'next'
import { auth } from '@/server/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, CreditCard, RefreshCcw, History, FileText, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Meu Plano | Kadernim Pro',
    description: 'Gerencie sua assinatura Kadernim.',
}

function getStatusBadge(status: string, isActive: boolean) {
    if (isActive && (status === 'ACTIVE' || status === 'RECEIVED' || status === 'CONFIRMED')) {
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1" />Ativo</Badge>
    }
    if (status === 'PENDING' || status === 'INACTIVE' || status === 'AWAITING_AUTHORIZATION') {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Pendente</Badge>
    }
    if (status === 'CANCELED') {
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
}

export default async function ClientBillingPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session || !session.user) {
        return redirect('/login')
    }

    const userId = session.user.id

    // Fetch subscription and invoices
    const subscription = await prisma.subscription.findUnique({
        where: { userId }
    })

    const invoices = await prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    // Has active sub?
    const hasActiveSub = subscription?.isActive

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Meu Plano</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Resumo da Assinatura */}
                <Card className="col-span-2 lg:col-span-2 shadow-sm border-border/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Status da Assinatura</CardTitle>
                                <CardDescription>
                                    Gerencie seu acesso ao Kadernim Pro.
                                </CardDescription>
                            </div>
                            {subscription && getStatusBadge(subscription.status, subscription.isActive)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {subscription ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground font-medium">Plano Atual</p>
                                        <p className="font-semibold text-base mt-1">Kadernim Pro</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium">Método de Pagamento</p>
                                        <p className="font-semibold text-base flex items-center gap-2 mt-1">
                                            {subscription.paymentMethod === 'CREDIT_CARD' && <><CreditCard className="w-4 h-4 text-primary" /> Cartão de Crédito</>}
                                            {subscription.paymentMethod === 'PIX' && <><RefreshCcw className="w-4 h-4 text-emerald-500" /> PIX</>}
                                            {subscription.paymentMethod === 'PIX_AUTOMATIC' && <><RefreshCcw className="w-4 h-4 text-emerald-500" /> PIX Automático</>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground font-medium">Membro desde</p>
                                        <p className="font-medium mt-1">{format(new Date(subscription.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    <CheckCircle2 className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-lg">Você ainda não é Pro.</p>
                                    <p className="text-sm text-muted-foreground">Desbloqueie agora acesso ilimitado à plataforma.</p>
                                </div>
                                <Button asChild className="mt-2">
                                    <Link href="/checkout">Assinar Kadernim Pro</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    {hasActiveSub && (
                        <CardFooter className="bg-muted/30 border-t px-6 py-4">
                            <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                Cancelar Assinatura
                            </Button>
                        </CardFooter>
                    )}
                </Card>

                {/* Benefícios */}
                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle>Benefícios Pro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Acesso a todas habilidades da BNCC</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Planos de Aula gerados por IA Ilimitados</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>Disparo automático via WhatsApp</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Histórico de Faturas */}
            {invoices.length > 0 && (
                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-muted-foreground" /> Histórico de Faturas</CardTitle>
                        <CardDescription>Acompanhe seus últimos pagamentos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {invoices.map(invoice => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{invoice.description || 'Fatura Mensal'}</p>
                                            <p className="text-xs text-muted-foreground">Vencimento: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-bold text-sm">R$ {Number(invoice.value).toFixed(2).replace('.', ',')}</p>
                                            <span className="text-xs">
                                                {invoice.status === 'RECEIVED' || invoice.status === 'CONFIRMED'
                                                    ? <span className="text-emerald-500 font-medium">Pago</span>
                                                    : invoice.status === 'PENDING'
                                                        ? <span className="text-amber-500 font-medium">Pendente</span>
                                                        : <span className="text-muted-foreground font-medium">{invoice.status}</span>
                                                }
                                            </span>
                                        </div>
                                        {invoice.invoiceUrl && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">Recibo</a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
