import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Webhook, User, Settings, Database } from 'lucide-react'
import { format } from 'date-fns'

export const metadata: Metadata = {
    title: 'Audit Trail de Faturamento | Admin Kadernim',
    description: 'Histórico de eventos de faturamento e sistema.',
}
export const dynamic = 'force-dynamic'

export default async function AdminBillingAuditPage() {
    const logs = await prisma.billingAuditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } }
        }
    })

    const getActorIcon = (actor: string) => {
        switch (actor) {
            case 'SYSTEM': return <Database className="w-4 h-4 text-emerald-500" />
            case 'ADMIN': return <Settings className="w-4 h-4 text-purple-500" />
            case 'USER': return <User className="w-4 h-4 text-blue-500" />
            case 'ASAAS_WEBHOOK': return <Webhook className="w-4 h-4 text-amber-500" />
            default: return <FileText className="w-4 h-4 text-muted-foreground" />
        }
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Audit Trail</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Eventos de Faturamento</CardTitle>
                    <CardDescription>
                        Registro imutável de todas ações críticas e disparos de webhook realizados pelo Kadernim e Asaas. Limitado aos últimos 50 eventos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-4 p-4 border rounded-lg bg-card/50 hover:bg-card transition-colors">
                                <div className="bg-background rounded-full p-2 h-8 w-8 flex items-center justify-center border shadow-sm">
                                    {getActorIcon(log.actor)}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Badge variant="outline" className="font-mono text-[10px] mr-2">
                                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                                            </Badge>
                                            <span className="font-semibold text-sm">{log.action}</span>
                                            <span className="text-xs text-muted-foreground mx-2">•</span>
                                            <span className="text-xs font-mono bg-muted/50 px-1 rounded">{log.entity} {log.entityId}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">{log.actor}</Badge>
                                    </div>

                                    {log.user && (
                                        <p className="text-xs text-muted-foreground">Usuário impactado: {log.user.email}</p>
                                    )}

                                    <div className="mt-2 text-xs bg-muted/40 p-2 rounded max-h-40 overflow-auto font-mono text-muted-foreground">
                                        {JSON.stringify(log.newState || log.metadata, null, 2)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {logs.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground text-sm">Nenhum evento registrado ainda.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
