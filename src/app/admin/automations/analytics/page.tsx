'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    CheckCircle2,
    XCircle,
    Mail,
    Bell,
    Webhook,
    MessageSquare,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CrudPageShell, type ViewType } from '@/components/admin/crud';
import { toast } from 'sonner';

const ACTION_TYPES = [
    { value: 'EMAIL_SEND', label: 'Enviar E-mail', icon: Mail, color: 'text-blue-500' },
    { value: 'WHATSAPP_SEND', label: 'Enviar WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
    { value: 'PUSH_NOTIFICATION', label: 'Notificação Push', icon: Bell, color: 'text-amber-500' },
    { value: 'WEBHOOK_CALL', label: 'Chamar Webhook (HTTP POST)', icon: Webhook, color: 'text-purple-500' },
];

interface AutomationLog {
    id: string;
    status: string;
    payload: any;
    error: string | null;
    executedAt: string;
    rule: { name: string };
    action?: { type: string };
}

export default function AutomationsAnalyticsPage() {
    const [view, setView] = useState<ViewType>('list');
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/automations/logs?limit=100');
            const json = await res.json();
            if (json.success) setLogs(json.data);
        } catch (error) {
            toast.error('Erro ao buscar logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionInfo = (type: string) => {
        return ACTION_TYPES.find(a => a.value === type) || { icon: Zap, color: 'text-slate-500', label: type };
    };

    const filteredLogs = logs.filter(log =>
        log.rule?.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <CrudPageShell
            title="Analytics de Automações"
            subtitle="Histórico de execuções de automações do sistema."
            icon={Activity}
            view={view}
            setView={setView}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalItems={filteredLogs.length}
            totalPages={Math.ceil(filteredLogs.length / limit)}
            hasMore={page * limit < filteredLogs.length}
            isLoading={loading}
        >
            <div className="p-4 md:p-6 pb-20">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Automação</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Ação</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Status</TableHead>
                                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 text-right pr-6">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground italic">
                                        Nenhum histórico disponível
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredLogs.slice((page - 1) * limit, page * limit).map((log) => {
                                const actionInfo = log.action?.type ? getActionInfo(log.action.type) : null;
                                return (
                                    <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-4">
                                            {log.status === 'success' ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-rose-500" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{log.rule?.name}</span>
                                                {log.error && <span className="text-[10px] text-rose-500 font-mono truncate max-w-[200px]">{log.error}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {actionInfo && (
                                                <div className="flex items-center gap-1.5 opacity-70">
                                                    <actionInfo.icon className={cn("h-3.5 w-3.5", actionInfo.color)} />
                                                    <span className="text-xs font-medium">{actionInfo.label}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 hover:bg-primary/10 hover:text-primary">
                                                        Payload
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 rounded-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-lg font-bold">Conteúdo da Execução</DialogTitle>
                                                        <DialogDescription className="text-xs uppercase font-mono">{log.rule?.name}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="mt-4 flex-1 overflow-auto rounded-xl bg-muted p-4 border font-mono text-xs">
                                                        {JSON.stringify(log.payload, null, 2)}
                                                    </div>
                                                    {log.error && (
                                                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                                                            <p className="text-[10px] font-bold text-destructive uppercase mb-1">Erro:</p>
                                                            <p className="text-xs font-mono">{log.error}</p>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 tabular-nums text-xs text-muted-foreground">
                                            {format(new Date(log.executedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </CrudPageShell>
    );
}
