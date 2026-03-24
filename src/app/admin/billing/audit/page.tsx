import { Metadata } from 'next'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingAdminService } from '@/services/billing/admin.service'

export const metadata: Metadata = {
    title: 'Audit Trail de Faturamento | Admin Kadernim',
    description: 'Histórico de eventos de faturamento e sistema.',
}

export const dynamic = 'force-dynamic'

export default async function AdminBillingAuditPage() {
    const { logs } = await BillingAdminService.getAuditPageData()

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Auditoria</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Últimos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {logs.map(log => (
                            <div key={log.id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {log.entity} {log.entityId}
                                        </p>
                                        {log.user && (
                                            <p className="truncate text-xs text-muted-foreground">{log.user.email}</p>
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
                            <div className="py-8 text-center text-sm text-muted-foreground">Nenhum evento registrado ainda.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
