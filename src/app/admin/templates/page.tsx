'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Mail,
    MessageSquare,
    Bell,
    Hash,
    Pencil,
    Trash2,
    Eye,
    Variable,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor';
import { toast } from 'sonner';
import { getAllEvents, getEventVariables, getCategories, type EventSchema } from '@/lib/events/catalog';

// Tipos de template
const TEMPLATE_TYPES = [
    { value: 'email', label: 'E-mail', icon: Mail, color: 'text-blue-500' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-500' },
    { value: 'push', label: 'Push', icon: Bell, color: 'text-amber-500' },
    { value: 'slack', label: 'Slack', icon: Hash, color: 'text-purple-500' },
];

interface NotificationTemplate {
    id: string;
    slug: string;
    name: string;
    type: string;
    eventType: string;
    subject: string | null;
    body: string;
    description: string | null;
    variables: string[] | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function TemplatesPage() {
    const [view, setView] = useState<ViewType>('cards');
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);

    // Filter/Search states
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);

    // Delete states
    const [isDeleting, setIsDeleting] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    // Form state
    const [formSlug, setFormSlug] = useState('');
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState('email');
    const [formEventType, setFormEventType] = useState(''); // ✅ NOVO
    const [formSubject, setFormSubject] = useState('');
    const [formBody, setFormBody] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formVariables, setFormVariables] = useState<string[]>([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/admin/templates');
            const json = await response.json();
            if (json.success) setTemplates(json.data);
        } catch (error) {
            toast.error('Erro ao buscar templates');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormSlug('');
        setFormName('');
        setFormType('email');
        setFormEventType('');
        setFormSubject('');
        setFormBody('');
        setFormDescription('');
        setFormVariables([]);
        setEditingTemplate(null);
    };

    const openEditDrawer = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setFormSlug(template.slug);
        setFormName(template.name);
        setFormType(template.type);
        setFormEventType(template.eventType);
        setFormSubject(template.subject || '');
        setFormBody(template.body);
        setFormDescription(template.description || '');
        setFormVariables(template.variables || []);
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!formSlug || !formName || !formBody || !formEventType) {
            toast.error('Preencha os campos obrigatórios (incluindo tipo de evento)');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                slug: formSlug,
                name: formName,
                type: formType,
                eventType: formEventType,
                subject: formType === 'email' ? formSubject : null,
                body: formBody,
                description: formDescription || null,
                variables: formVariables.length > 0 ? formVariables : null,
            };

            const url = editingTemplate
                ? `/api/v1/admin/templates/${editingTemplate.id}`
                : '/api/v1/admin/templates';

            const response = await fetch(url, {
                method: editingTemplate ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setDrawerOpen(false);
                resetForm();
                fetchTemplates();
                toast.success(editingTemplate ? 'Template atualizado' : 'Template criado');
            } else {
                const err = await response.json();
                toast.error(err.error || 'Erro ao salvar');
            }
        } catch (error) {
            toast.error('Erro inesperado');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggle = async (template: NotificationTemplate) => {
        try {
            const res = await fetch(`/api/v1/admin/templates/${template.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !template.isActive }),
            });

            if (res.ok) {
                setTemplates(templates.map(t =>
                    t.id === template.id ? { ...t, isActive: !template.isActive } : t
                ));
                toast.success(`Modelo ${template.isActive ? 'desativado' : 'ativado'}`);
            }
        } catch (error) { }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/v1/admin/templates/${templateToDelete}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setTemplates(templates.filter(t => t.id !== templateToDelete));
                toast.success('Template excluído');
                setTemplateToDelete(null);
            }
        } catch (error) {
            toast.error('Erro ao excluir');
        } finally {
            setIsDeleting(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const getTypeInfo = (type: string) => {
        return TEMPLATE_TYPES.find(t => t.value === type) || TEMPLATE_TYPES[0];
    };

    // Columns
    const columns: ColumnDef<NotificationTemplate>[] = [
        {
            key: 'name',
            label: 'Template',
            render: (template) => {
                const info = getTypeInfo(template.type);
                return (
                    <div className="flex items-center gap-3">
                        <info.icon className={cn("h-4 w-4", info.color)} />
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-tight">{template.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{template.slug}</span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'type',
            label: 'Canal',
            render: (template) => (
                <Badge variant="outline" className="text-[10px] font-bold uppercase">
                    {getTypeInfo(template.type).label}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (template) => (
                <button onClick={() => handleToggle(template)} className="focus:outline-none">
                    {template.isActive ? (
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 px-2 h-5 text-[10px] font-bold">ATIVO</Badge>
                    ) : (
                        <Badge variant="secondary" className="px-2 h-5 text-[10px] font-bold opacity-50">INATIVO</Badge>
                    )}
                </button>
            )
        },
        {
            key: 'updatedAt',
            label: 'Modificado',
            render: (template) => (
                <span className="text-xs text-muted-foreground tabular-nums">
                    {format(new Date(template.updatedAt), "dd/MM/yy", { locale: ptBR })}
                </span>
            )
        }
    ];

    // Card View
    const cardConfig: CardConfig<NotificationTemplate> = {
        title: (template) => template.name,
        subtitle: (template) => (
            <div className="flex flex-col gap-1 w-full mt-1">
                <span className="text-[10px] font-mono text-muted-foreground truncate">{template.slug}</span>
                {template.description && <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>}
            </div>
        ),
        badge: (template) => (
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[9px] uppercase font-bold">
                    {getTypeInfo(template.type).label}
                </Badge>
                {template.isActive && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </div>
        )
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <>
            <CrudPageShell
                title="Templates"
                subtitle="Modelos de comunicação automatizada para notificações."
                icon={FileText}
                onAdd={() => {
                    resetForm();
                    setDrawerOpen(true);
                }}
                view={view}
                setView={setView}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                totalItems={filteredTemplates.length}
                totalPages={Math.ceil(filteredTemplates.length / limit)}
                hasMore={page * limit < filteredTemplates.length}
                isLoading={loading}
            >
                <div className="p-4 md:p-6 pb-20">
                    <CrudDataView
                        data={filteredTemplates.slice((page - 1) * limit, page * limit)}
                        view={view}
                        tableView={
                            <CrudListView
                                data={filteredTemplates.slice((page - 1) * limit, page * limit)}
                                columns={columns}
                                rowActions={{
                                    customActions: (item) => (
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => {
                                                    setPreviewTemplate(item);
                                                    setPreviewOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                onClick={() => openEditDrawer(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                onClick={() => setTemplateToDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                }}
                            />
                        }
                        cardView={
                            <CrudCardView
                                data={filteredTemplates.slice((page - 1) * limit, page * limit)}
                                config={cardConfig}
                                rowActions={{
                                    customActions: (item) => (
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm"
                                                onClick={() => openEditDrawer(item)}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                                onClick={() => setTemplateToDelete(item.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )
                                }}
                            />
                        }
                    />
                </div>
            </CrudPageShell>

            {/* Preview */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {previewTemplate && <FileText className="h-5 w-5 text-primary" />}
                            {previewTemplate?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {previewTemplate && (
                        <div className="space-y-4 mt-4 flex-1 overflow-auto">
                            {previewTemplate.type === 'email' && previewTemplate.subject && (
                                <div className="p-3 bg-muted rounded-lg border">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Assunto</p>
                                    <p className="text-sm font-medium">{previewTemplate.subject}</p>
                                </div>
                            )}
                            <div className="p-4 border rounded-xl bg-background shadow-xs">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">Conteúdo</p>
                                {previewTemplate.type === 'email' ? (
                                    <div className="prose prose-sm max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: previewTemplate.body }} />
                                ) : (
                                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-4 rounded-lg border">{previewTemplate.body}</pre>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Editor Drawer */}
            <CrudEditDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) resetForm();
                }}
                title={editingTemplate ? 'Editar Template' : 'Novo Template'}
                icon={FileText}
                onSave={handleSave}
                isSaving={isSaving}
                maxWidth="max-w-4xl"
            >
                <div className="space-y-6">
                    {/* Nome - Full Width */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground">Nome do Template *</Label>
                        <Input
                            id="name"
                            value={formName}
                            onChange={(e) => {
                                setFormName(e.target.value);
                                if (!editingTemplate) setFormSlug(generateSlug(e.target.value));
                            }}
                            placeholder="Ex: Email de Boas-vindas"
                            className="bg-muted/30"
                        />
                    </div>

                    {/* Tipo de Evento e Canal - Lado a Lado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Tipo de Evento *</Label>
                            <Select value={formEventType} onValueChange={setFormEventType}>
                                <SelectTrigger className="w-full bg-muted/30">
                                    <SelectValue placeholder="Selecione o evento" />
                                </SelectTrigger>
                                <SelectContent>
                                    {getCategories().map(category => {
                                        const events = getAllEvents().filter(e => e.category === category.value);
                                        if (events.length === 0) return null;
                                        return (
                                            <React.Fragment key={category.value}>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    {category.label}
                                                </div>
                                                {events.map(event => (
                                                    <SelectItem key={event.name} value={event.name}>
                                                        {event.label}
                                                    </SelectItem>
                                                ))}
                                            </React.Fragment>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground">Canal *</Label>
                            <Select value={formType} onValueChange={setFormType}>
                                <SelectTrigger className="w-full bg-muted/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATE_TYPES.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <type.icon className={cn("h-4 w-4", type.color)} />
                                                {type.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Assunto - Full Width (só para email) */}
                    {formType === 'email' && (
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-xs font-semibold text-muted-foreground">Assunto do Email *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="subject"
                                    value={formSubject}
                                    onChange={(e) => setFormSubject(e.target.value)}
                                    placeholder="Ex: Bem-vindo ao Kadernim, {{user.firstName}}!"
                                    className="flex-1 bg-muted/30"
                                />
                                {formEventType && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 gap-1 shrink-0 bg-muted/30"
                                                title="Inserir variável"
                                            >
                                                <Variable className="h-3.5 w-3.5" />
                                                <span className="text-xs">Variáveis</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 max-h-[300px] overflow-y-auto">
                                            <DropdownMenuLabel className="text-xs">Inserir Variável</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {getEventVariables(formEventType).map((variable) => (
                                                <DropdownMenuItem
                                                    key={variable.key}
                                                    onClick={() => {
                                                        const input = document.getElementById('subject') as HTMLInputElement;
                                                        const cursorPos = input?.selectionStart || formSubject.length;
                                                        const before = formSubject.substring(0, cursorPos);
                                                        const after = formSubject.substring(cursorPos);
                                                        setFormSubject(before + `{{${variable.key}}}` + after);
                                                    }}
                                                    className="flex flex-col items-start gap-1 py-2"
                                                >
                                                    <code className="text-xs font-mono text-primary">
                                                        {`{{${variable.key}}}`}
                                                    </code>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {variable.label}
                                                        {variable.example && <span className="text-primary"> · Ex: {variable.example}</span>}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Conteúdo - Full Width */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground">Conteúdo *</Label>
                            {formEventType && (
                                <span className="text-[10px] text-muted-foreground">
                                    {formType === 'email' ? 'Use o menu "Variáveis" no editor' : 'Use {{variavel}} no texto'}
                                </span>
                            )}
                        </div>
                        {formType === 'email' ? (
                            <RichTextEditor
                                value={formBody}
                                onChange={setFormBody}
                                availableVariables={formEventType ? getEventVariables(formEventType) : []}
                            />
                        ) : (
                            <Textarea
                                value={formBody}
                                onChange={(e) => setFormBody(e.target.value)}
                                placeholder="Digite o conteúdo da mensagem..."
                                className="min-h-[200px] font-mono text-sm bg-muted/30"
                            />
                        )}
                    </div>
                </div>
            </CrudEditDrawer>

            <DeleteConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Excluir Template?"
                description="Esta ação removerá permanentemente o modelo de comunicação."
                confirmText="Excluir"
                cancelText="Cancelar"
                trigger={null}
            />
        </>
    );
}
