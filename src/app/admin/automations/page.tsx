'use client';

import React, { useState, useEffect } from 'react';
import {
    Zap,
    Trash2,
    Activity,
    Mail,
    Bell,
    Webhook,
    CheckCircle2,
    XCircle,
    Layout,
    Pencil,
    History,
    AlertTriangle,
    ExternalLink,
    Code,
    MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    CrudPageShell,
    CrudDataView,
    CrudListView,
    CrudCardView,
    CrudEditDrawer,
    DeleteConfirmDialog,
    type ViewType,
    type ColumnDef,
    type CardConfig,
} from '@/components/admin/crud';
import { toast } from 'sonner';
import Link from 'next/link';
import { getAllEvents, getCategories } from '@/lib/events/catalog';

// Tipos de ação disponíveis
const ACTION_TYPES = [
    { value: 'EMAIL_SEND', label: 'Enviar E-mail', icon: Mail, color: 'text-blue-500' },
    { value: 'WHATSAPP_SEND', label: 'Enviar WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
    { value: 'PUSH_NOTIFICATION', label: 'Notificação Push', icon: Bell, color: 'text-amber-500' },
    { value: 'WEBHOOK_CALL', label: 'Chamar Webhook (HTTP POST)', icon: Webhook, color: 'text-purple-500' },
];

interface AutomationRule {
    id: string;
    name: string;
    eventType: string;
    isActive: boolean;
    description: string | null;
    actions: { id: string; type: string; config: any }[];
    _count?: { logs: number };
    createdAt: string;
}

interface AutomationLog {
    id: string;
    status: string;
    payload: any;
    error: string | null;
    executedAt: string;
    rule: { name: string };
    action?: { type: string };
}

export default function AutomationsPage() {
    const [view, setView] = useState<ViewType>('list');
    const [mode, setMode] = useState<'rules' | 'logs'>('rules');
    const [loading, setLoading] = useState(true);
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // Pagination/Search
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);

    // Form states
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEventType, setFormEventType] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formActionType, setFormActionType] = useState('EMAIL_SEND');
    const [formConfig, setFormConfig] = useState<any>({});
    const [formIsActive, setFormIsActive] = useState(true);

    // Delete states
    const [isDeleting, setIsDeleting] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        fetchTemplates();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rulesRes, logsRes] = await Promise.all([
                fetch('/api/v1/admin/automations'),
                fetch('/api/v1/admin/automations/logs?limit=50'),
            ]);
            const rulesJson = await rulesRes.json();
            const logsJson = await logsRes.json();
            if (rulesJson.success) setRules(rulesJson.data);
            if (logsJson.success) setLogs(logsJson.data);
        } catch (error) {
            toast.error('Erro ao buscar dados');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        console.log('[Automations] Buscando templates...');
        try {
            const res = await fetch('/api/v1/admin/templates');
            console.log('[Automations] Resposta:', res.status);
            const json = await res.json();
            console.log('[Automations] Templates recebidos:', json);
            if (json.success) {
                setTemplates(json.data);
                console.log('[Automations] Templates setados:', json.data.length);
            } else {
                console.error('[Automations] Erro na API:', json.error);
            }
        } catch (error) {
            console.error('[Automations] Erro ao buscar templates:', error);
        }
    };

    const resetForm = () => {
        setEditingRule(null);
        setFormName('');
        setFormEventType('');
        setFormDescription('');
        setFormActionType('EMAIL_SEND');
        setFormConfig({});
        setFormIsActive(true);
    };

    const openEditDrawer = (rule: AutomationRule) => {
        resetForm();
        setEditingRule(rule);
        setFormName(rule.name);
        setFormEventType(rule.eventType);
        setFormDescription(rule.description || '');
        if (rule.actions.length > 0) {
            setFormActionType(rule.actions[0].type);
            setFormConfig(rule.actions[0].config || {});
        }
        setFormIsActive(rule.isActive);
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!formName || !formEventType) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        // Validações básicas por tipo de ação
        if (formActionType === 'EMAIL_SEND' && !formConfig.templateId) {
            toast.error('Selecione um template de e-mail');
            return;
        }
        if (formActionType === 'WHATSAPP_SEND' && !formConfig.templateId) {
            toast.error('Selecione um template de WhatsApp');
            return;
        }
        if (formActionType === 'PUSH_NOTIFICATION' && !formConfig.templateId) {
            toast.error('Selecione um template de push');
            return;
        }
        if (formActionType === 'WEBHOOK_CALL' && !formConfig.url) {
            toast.error('Informe a URL do Webhook');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formName,
                eventType: formEventType,
                description: formDescription,
                isActive: formIsActive,
                actions: [{ type: formActionType, config: formConfig }],
            };

            const url = editingRule ? `/api/v1/admin/automations/${editingRule.id}` : '/api/v1/admin/automations';
            const method = editingRule ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setDrawerOpen(false);
                resetForm();
                fetchData();
                toast.success(editingRule ? 'Automação atualizada' : 'Automação criada');
            } else {
                const err = await res.json();
                toast.error(err.error || 'Erro ao salvar automação');
            }
        } catch (error) {
            toast.error('Erro ao salvar automação');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = async (rule: AutomationRule) => {
        try {
            const res = await fetch(`/api/v1/admin/automations/${rule.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !rule.isActive }),
            });
            if (res.ok) {
                setRules(rules.map(r => r.id === rule.id ? { ...r, isActive: !rule.isActive } : r));
                toast.success(`Automação ${rule.isActive ? 'desativada' : 'ativada'}`);
            }
        } catch (error) {
            toast.error('Erro ao atualizar');
        }
    };

    const handleDelete = async () => {
        if (!ruleToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/v1/admin/automations/${ruleToDelete}`, { method: 'DELETE' });
            if (res.ok) {
                setRules(rules.filter(r => r.id !== ruleToDelete));
                toast.success('Automação excluída permanentemente');
                setRuleToDelete(null);
            }
        } catch (error) {
            toast.error('Erro ao excluir');
        } finally {
            setIsDeleting(false);
        }
    };

    const getActionInfo = (type: string) => {
        return ACTION_TYPES.find(a => a.value === type) || { icon: Zap, color: 'text-slate-500', label: type };
    };

    const getEventLabel = (type: string) => {
        return getAllEvents().find(e => e.name === type)?.label || type;
    };

    // Table Columns
    const columns: ColumnDef<AutomationRule>[] = [
        {
            key: 'name',
            label: 'Automação',
            render: (rule) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{rule.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{rule.eventType}</span>
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Ação Principal',
            render: (rule) => (
                <div className="flex items-center gap-2">
                    {rule.actions.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                            {(() => {
                                const info = getActionInfo(rule.actions[0].type);
                                return (
                                    <>
                                        <info.icon className={cn("h-3.5 w-3.5", info.color)} />
                                        <span className="text-xs font-medium">{info.label}</span>
                                    </>
                                );
                            })()}
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Sem ações</span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (rule) => (
                <button onClick={() => handleToggle(rule)} className="focus:outline-none">
                    {rule.isActive ? (
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-2 h-5 text-[10px] font-bold uppercase tracking-wider">ATIVO</Badge>
                    ) : (
                        <Badge variant="secondary" className="px-2 h-5 text-[10px] font-bold uppercase tracking-wider opacity-50">INATIVO</Badge>
                    )}
                </button>
            )
        },
        {
            key: 'logs',
            label: 'Uso',
            render: (rule) => (
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {rule._count?.logs || 0} execuções
                </span>
            )
        }
    ];

    // Card View Config
    const cardConfig: CardConfig<AutomationRule> = {
        title: (rule) => rule.name,
        subtitle: (rule) => (
            <div className="flex flex-col gap-1 w-full mt-1">
                <div className="flex items-center gap-1 text-[10px] text-primary uppercase font-bold">
                    <Zap className="h-3 w-3" /> {getEventLabel(rule.eventType)}
                </div>
                {rule.description && <p className="text-xs text-muted-foreground line-clamp-2">{rule.description}</p>}
            </div>
        ),
        badge: (rule) => (
            <div className="flex items-center gap-2">
                {rule.isActive ? (
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">ATIVO</span>
                ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">INATIVO</span>
                )}
            </div>
        )
    };

    const filteredRules = rules.filter(r => r.name.toLowerCase().includes(searchInput.toLowerCase()));

    // Filtrar templates pelo tipo selecionado
    const filteredTemplates = templates.filter(t => {
        // Filtrar por tipo de canal (email, push, whatsapp)
        let matchesChannel = false;
        if (formActionType === 'EMAIL_SEND') matchesChannel = t.type === 'email';
        if (formActionType === 'WHATSAPP_SEND') matchesChannel = t.type === 'whatsapp';
        if (formActionType === 'PUSH_NOTIFICATION') matchesChannel = t.type === 'push';

        // Nota: Removemos o filtro de eventType para permitir escolher qualquer template do canal
        // O admin pode querer usar um template genérico para diferentes eventos
        return matchesChannel;
    });

    const getWebhookSamplePayload = (eventType: string) => {
        return {
            event: eventType,
            timestamp: new Date().toISOString(),
            data: {
                id: "12345",
                user: { name: "João Silva", email: "joao@exemplo.com" },
                context: "Informações enviadas pelo gatilho selecionado"
            }
        };
    };

    return (
        <>
            <CrudPageShell
                title="Automações"
                subtitle="Gerencie gatilhos e reações automáticas do sistema."
                icon={Zap}
                onAdd={() => {
                    resetForm();
                    setDrawerOpen(true);
                }}
                addLabel="Nova Automação"
                view={view}
                setView={setView}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                totalItems={mode === 'rules' ? filteredRules.length : logs.length}
                totalPages={Math.ceil((mode === 'rules' ? filteredRules.length : logs.length) / limit)}
                hasMore={mode === 'rules' ? (page * limit < filteredRules.length) : (page * limit < logs.length)}
                isLoading={loading}
                actions={
                    <div className="flex items-center bg-muted/50 border rounded-lg p-1">
                        <Button
                            variant={mode === 'rules' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs font-semibold px-3"
                            onClick={() => setMode('rules')}
                        >
                            Regras
                        </Button>
                        <Button
                            variant={mode === 'logs' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 text-xs font-semibold px-3"
                            onClick={() => setMode('logs')}
                        >
                            Histórico
                        </Button>
                    </div>
                }
            >
                {mode === 'rules' ? (
                    <CrudDataView
                        data={filteredRules}
                        view={view}
                        tableView={
                            <CrudListView
                                data={filteredRules.slice((page - 1) * limit, page * limit)}
                                columns={columns}
                                rowActions={{
                                    customActions: (item) => (
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => openEditDrawer(item)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive" onClick={() => setRuleToDelete(item.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )
                                }}
                            />
                        }
                        cardView={
                            <CrudCardView
                                data={filteredRules.slice((page - 1) * limit, page * limit)}
                                config={cardConfig}
                                rowActions={{
                                    customActions: (item) => (
                                        <div className="flex justify-end gap-1">
                                            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg" onClick={() => openEditDrawer(item)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg text-destructive" onClick={() => setRuleToDelete(item.id)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )
                                }}
                            />
                        }
                    />
                ) : (
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
                                {logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground italic">
                                            Nenhum histórico disponível
                                        </TableCell>
                                    </TableRow>
                                )}
                                {logs.slice((page - 1) * limit, page * limit).map((log) => {
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
                )}
            </CrudPageShell>

            <CrudEditDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) resetForm();
                }}
                title={editingRule ? "Editar Automação" : "Nova Automação"}
                subtitle={editingRule ? `Fluxo ID: ${editingRule.id}` : "Configure uma nova regra de fluxo automático."}
                icon={Zap}
                onSave={handleSave}
                isSaving={isSaving}
                saveLabel={editingRule ? "Salvar" : "Ativar"}
                maxWidth="max-w-2xl"
            >
                <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20">
                            <div>
                                <Label className="text-sm font-bold">Status da Automação</Label>
                                <p className="text-xs text-muted-foreground">{formIsActive ? 'A regra será processada' : 'A regra ficará em pausa'}</p>
                            </div>
                            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                Nome da Regra *
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ex: Notificar Novo Pedido"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="h-10 rounded-lg bg-muted/30 focus:bg-background transition-all w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                Descrição Interna
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Para que serve esta automação?"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="min-h-[100px] rounded-lg bg-muted/30 w-full resize-none"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Trigger Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-tight">Gatilho</h3>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                Evento de Disparo *
                            </Label>
                            <Select value={formEventType} onValueChange={setFormEventType}>
                                <SelectTrigger className="h-11 rounded-lg bg-muted/30 w-full">
                                    <SelectValue placeholder="Selecione o evento que inicia o fluxo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {getCategories().map(category => {
                                        const events = getAllEvents().filter(e => e.category === category.value);
                                        if (events.length === 0) return null;
                                        return (
                                            <React.Fragment key={category.value}>
                                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-muted-foreground/60 border-t first:border-none mt-1">{category.label}</div>
                                                {events.map(event => (
                                                    <SelectItem key={event.name} value={event.name} className="text-sm">
                                                        {event.label}
                                                    </SelectItem>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-tight">Reação</h3>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                Tipo de Ação *
                            </Label>
                            <Select value={formActionType} onValueChange={(val) => {
                                setFormActionType(val)
                                setFormConfig({}) // Reset config when type changes
                            }}>
                                <SelectTrigger className="h-11 rounded-lg bg-muted/30 w-full">
                                    <SelectValue placeholder="Selecione o que o sistema deve fazer..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTION_TYPES.map(action => (
                                        <SelectItem key={action.value} value={action.value} className="text-sm">
                                            <div className="flex items-center gap-2">
                                                <action.icon className={cn("h-4 w-4", action.color)} />
                                                <span>{action.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Conditional Configuration Section */}
                    <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2">
                        {formActionType === 'EMAIL_SEND' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Template de E-mail</Label>
                                    <Link href="/admin/templates" target="_blank" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" /> Gerenciar Templates
                                    </Link>
                                </div>
                                <Select
                                    value={formConfig.templateId || ''}
                                    onValueChange={(val) => setFormConfig({ ...formConfig, templateId: val })}
                                >
                                    <SelectTrigger className="h-11 bg-background border-primary/20 w-full">
                                        <SelectValue placeholder="Escolha um template de e-mail..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTemplates.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-muted-foreground">Nenhum template de e-mail encontrado</div>
                                        ) : (
                                            filteredTemplates.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name} ({t.slug})</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formActionType === 'WHATSAPP_SEND' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Template de WhatsApp</Label>
                                    <Link href="/admin/templates/whatsapp" target="_blank" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" /> Gerenciar Templates
                                    </Link>
                                </div>
                                <Select
                                    value={formConfig.templateId || ''}
                                    onValueChange={(val) => setFormConfig({ ...formConfig, templateId: val })}
                                >
                                    <SelectTrigger className="h-11 bg-background border-primary/20 w-full">
                                        <SelectValue placeholder="Escolha um template de WhatsApp..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTemplates.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-muted-foreground">Nenhum template de WhatsApp encontrado</div>
                                        ) : (
                                            filteredTemplates.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formActionType === 'PUSH_NOTIFICATION' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Template de Push</Label>
                                    <Link href="/admin/templates" target="_blank" className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                                        <ExternalLink className="h-3 w-3" /> Gerenciar Templates
                                    </Link>
                                </div>
                                <Select
                                    value={formConfig.templateId || ''}
                                    onValueChange={(val) => setFormConfig({ ...formConfig, templateId: val })}
                                >
                                    <SelectTrigger className="h-11 bg-background border-primary/20 w-full">
                                        <SelectValue placeholder="Escolha um template de push..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredTemplates.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-muted-foreground">Nenhum template de push encontrado</div>
                                        ) : (
                                            filteredTemplates.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name} ({t.slug})</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {formActionType === 'WEBHOOK_CALL' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider">URL de Destino (Webhook)</Label>
                                    <Input
                                        placeholder="https://sua-api.com/v1/webhook"
                                        value={formConfig.url || ''}
                                        onChange={(e) => setFormConfig({ ...formConfig, url: e.target.value })}
                                        className="h-11 bg-background border-primary/20 w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-2">
                                        <Code className="h-3 w-3" /> Exemplo de Payload Enviado
                                    </div>
                                    <div className="rounded-lg bg-slate-950 p-4 border border-white/5 overflow-x-auto">
                                        <pre className="text-[10px] font-mono text-emerald-400">
                                            {JSON.stringify(getWebhookSamplePayload(formEventType || 'event.name'), null, 2)}
                                        </pre>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        * O payload real conterá todos os dados contextuais do evento disparado.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CrudEditDrawer>

            <DeleteConfirmDialog
                open={!!ruleToDelete}
                onOpenChange={(open) => !open && setRuleToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Excluir Regra?"
                description="Esta automação será removida permanentemente e deixará de processar novos eventos."
                confirmText="Excluir"
                cancelText="Cancelar"
            />
        </>
    );
}
