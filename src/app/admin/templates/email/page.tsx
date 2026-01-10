'use client';

import React, { useState, useEffect } from 'react';
import {
    Mail,
    Pencil,
    Trash2,
    Eye,
    Plus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    CrudPageShell,
    CrudDataView,
    CrudListView,
    CrudCardView,
    CrudEditDrawer,
    type ColumnDef,
    type CardConfig,
    type ViewType,
} from '@/components/admin/crud';
import { toast } from 'sonner';
import { EmailTemplateForm } from '@/components/admin/templates/email-template-form';

interface EmailTemplate {
    id: string;
    slug: string;
    name: string;
    subject: string;
    preheader: string | null;
    body: string;
    content?: any;
    eventType: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export default function EmailTemplatesPage() {
    const [view, setView] = useState<ViewType>('cards');
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(
        null
    );
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(
        null
    );

    // Filter/Search states
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);

    // Delete states
    const [isDeleting, setIsDeleting] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState<{
        name: string;
        slug: string;
        subject: string;
        preheader: string;
        body: string;
        content: any;
        eventType: string;
        description: string;
    }>({
        name: '',
        slug: '',
        subject: '',
        preheader: '',
        body: '',
        content: undefined,
        eventType: '',
        description: '',
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/admin/email-templates');
            const json = await response.json();
            if (json.success) setTemplates(json.data);
        } catch (error) {
            toast.error('Erro ao buscar templates de email');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            subject: '',
            preheader: '',
            body: '',
            content: undefined,
            eventType: '',
            description: '',
        });
        setEditingTemplate(null);
    };

    const openEditDrawer = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name || '',
            slug: template.slug,
            subject: template.subject,
            preheader: template.preheader || '',
            body: template.body,
            content: template.content,
            eventType: template.eventType,
            description: template.description || '',
        });
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.subject || !formData.body || !formData.eventType) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                slug: formData.slug,
                subject: formData.subject,
                preheader: formData.preheader || null,
                body: formData.body,
                content: formData.content,
                eventType: formData.eventType,
                description: formData.description || null,
            };

            const url = editingTemplate
                ? `/api/v1/admin/email-templates/${editingTemplate.id}`
                : '/api/v1/admin/email-templates';

            const response = await fetch(url, {
                method: editingTemplate ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setDrawerOpen(false);
                resetForm();
                fetchTemplates();
                toast.success(
                    editingTemplate ? 'Template atualizado' : 'Template criado'
                );
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

    const handleToggle = async (template: EmailTemplate) => {
        try {
            const res = await fetch(`/api/v1/admin/email-templates/${template.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !template.isActive }),
            });

            if (res.ok) {
                setTemplates(
                    templates.map((t) =>
                        t.id === template.id ? { ...t, isActive: !template.isActive } : t
                    )
                );
                toast.success(`Template ${template.isActive ? 'desativado' : 'ativado'}`);
            }
        } catch (error) {
            toast.error('Erro ao alterar status');
        }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(
                `/api/v1/admin/email-templates/${templateToDelete}`,
                {
                    method: 'DELETE',
                }
            );
            if (res.ok) {
                setTemplates(templates.filter((t) => t.id !== templateToDelete));
                toast.success('Template excluído');
                setTemplateToDelete(null);
            }
        } catch (error) {
            toast.error('Erro ao excluir');
        } finally {
            setIsDeleting(false);
        }
    };

    // Columns
    const columns: ColumnDef<EmailTemplate>[] = [
        {
            key: 'name',
            label: 'Template',
            render: (template) => (
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm leading-tight">
                            {template.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                            {template.slug}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'subject',
            label: 'Assunto',
            render: (template) => (
                <span className="text-sm line-clamp-1 max-w-[300px]">
                    {template.subject}
                </span>
            ),
        },
        {
            key: 'eventType',
            label: 'Evento',
            render: (template) => (
                <Badge variant="outline" className="text-[10px] font-mono">
                    {template.eventType}
                </Badge>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (template) => (
                <button
                    onClick={() => handleToggle(template)}
                    className="focus:outline-none"
                >
                    {template.isActive ? (
                        <Badge
                            variant="default"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/10 px-2 h-5 text-[10px] font-bold"
                        >
                            ATIVO
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="px-2 h-5 text-[10px] font-bold opacity-50"
                        >
                            INATIVO
                        </Badge>
                    )}
                </button>
            ),
        },
        {
            key: 'updatedAt',
            label: 'Modificado',
            render: (template) => (
                <span className="text-xs text-muted-foreground tabular-nums">
                    {format(new Date(template.updatedAt), 'dd/MM/yy', { locale: ptBR })}
                </span>
            ),
        },
    ];

    // Card View
    const cardConfig: CardConfig<EmailTemplate> = {
        title: (template) => template.name,
        subtitle: (template) => (
            <div className="flex flex-col gap-1 w-full mt-1">
                <span className="text-sm font-medium leading-tight line-clamp-1">
                    {template.subject}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                    {template.slug}
                </span>
            </div>
        ),
        badge: (template) => (
            <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                {template.isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
            </div>
        ),
    };

    const filteredTemplates = templates.filter(
        (t) =>
            t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchInput.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <>
            <CrudPageShell
                title="Templates de Email"
                subtitle="Configure os modelos de email para notificações e automações."
                icon={Mail}
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
                                data={filteredTemplates.slice(
                                    (page - 1) * limit,
                                    page * limit
                                )}
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
                                    ),
                                }}
                            />
                        }
                        cardView={
                            <CrudCardView
                                data={filteredTemplates.slice(
                                    (page - 1) * limit,
                                    page * limit
                                )}
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
                                    ),
                                }}
                            />
                        }
                    />
                </div>
            </CrudPageShell>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-none bg-transparent">
                    {previewTemplate && (
                        <div className="flex flex-col h-[80vh] bg-background border rounded-2xl overflow-hidden shadow-2xl">
                            <DialogHeader className="p-4 border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-base font-semibold">
                                                Preview do Email
                                            </DialogTitle>
                                            <p className="text-xs text-muted-foreground">
                                                Visualização de como o cliente receberá a mensagem
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Email Envelope View */}
                            <div className="flex-1 overflow-auto bg-muted/50 p-4 md:p-8 flex justify-center">
                                <div className="w-full max-w-[600px] bg-white shadow-sm border rounded-lg overflow-hidden flex flex-col h-fit min-h-full">
                                    {/* Meta Info */}
                                    <div className="p-4 border-b bg-muted/5 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 pt-0.5">Assunto:</span>
                                            <span className="text-sm font-medium">{previewTemplate.subject}</span>
                                        </div>
                                        {previewTemplate.preheader && (
                                            <div className="flex items-start gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 pt-0.5">Preheader:</span>
                                                <span className="text-xs text-muted-foreground">{previewTemplate.preheader}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Webview of HTML Body */}
                                    <div className="flex-1 bg-white">
                                        <iframe
                                            srcDoc={previewTemplate.body}
                                            title="Email Body Preview"
                                            className="w-full h-full min-h-[400px] border-none"
                                        />
                                    </div>
                                </div>
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
                title={editingTemplate ? 'Editar Template' : 'Novo Template Email'}
                icon={Mail}
                onSave={handleSave}
                isSaving={isSaving}
                maxWidth="max-w-3xl"
            >
                <EmailTemplateForm
                    data={formData}
                    onChange={(updates) =>
                        setFormData((prev) => ({ ...prev, ...updates }))
                    }
                    isEditing={!!editingTemplate}
                />
            </CrudEditDrawer>

            {/* Delete Dialog */}
            <Dialog
                open={!!templateToDelete}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Excluir Template?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                        Tem certeza que deseja excluir este template? Esta ação não pode ser
                        desfeita.
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setTemplateToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Floating Add Button for Mobile */}
            <div className="fixed bottom-6 right-6 md:hidden z-50">
                <Button
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-xl shadow-primary/20"
                    onClick={() => {
                        resetForm();
                        setDrawerOpen(true);
                    }}
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </>
    );
}
