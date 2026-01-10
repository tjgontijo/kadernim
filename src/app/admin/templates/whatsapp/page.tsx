'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageCircle,
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
import { WhatsAppTemplateForm } from '@/components/admin/templates/whatsapp-template-form';
import { PreviewDialog } from '@/components/admin/shared';
import { getStatusBadge } from '@/lib/utils/badge-variants';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface WhatsAppTemplate {
    id: string;
    slug: string;
    name: string;
    body: string;
    eventType: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


export default function WhatsAppTemplatesPage() {
    const [view, setView] = useState<ViewType>('cards');
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(
        null
    );
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(
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
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        body: '',
        eventType: '',
        description: '',
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/v1/admin/whatsapp-templates');
            const json = await response.json();
            if (json.success) setTemplates(json.data);
        } catch (error) {
            toast.error('Erro ao buscar templates de WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            body: '',
            eventType: '',
            description: '',
        });
        setEditingTemplate(null);
    };

    const openEditDrawer = (template: WhatsAppTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name || '',
            slug: template.slug,
            body: template.body,
            eventType: template.eventType,
            description: template.description || '',
        });
        setDrawerOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.body || !formData.eventType) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                slug: formData.slug,
                body: formData.body,
                eventType: formData.eventType,
                description: formData.description || null,
            };

            const url = editingTemplate
                ? `/api/v1/admin/whatsapp-templates/${editingTemplate.id}`
                : '/api/v1/admin/whatsapp-templates';

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

    const handleToggle = async (template: WhatsAppTemplate) => {
        try {
            const res = await fetch(`/api/v1/admin/whatsapp-templates/${template.id}`, {
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
                `/api/v1/admin/whatsapp-templates/${templateToDelete}`,
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
    const columns: ColumnDef<WhatsAppTemplate>[] = [
        {
            key: 'name',
            label: 'Template',
            render: (template) => (
                <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-emerald-500" />
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
            key: 'body',
            label: 'Mensagem',
            render: (template) => (
                <span className="text-xs line-clamp-1 text-muted-foreground max-w-[400px]">
                    {template.body}
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
                            variant="outline"
                            className={`${getStatusBadge('ACTIVE')} px-2 h-5 text-[10px] font-bold`}
                        >
                            ATIVO
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className={`${getStatusBadge('INACTIVE')} px-2 h-5 text-[10px] font-bold`}
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
    const cardConfig: CardConfig<WhatsAppTemplate> = {
        title: (template) => template.name,
        subtitle: (template) => (
            <div className="flex flex-col gap-1 w-full mt-1">
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    "{template.body}"
                </p>
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                    {template.slug}
                </span>
            </div>
        ),
        badge: (template) => (
            <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                {template.isActive && (
                    <span className="w-2 h-2 rounded-full bg-success" />
                )}
            </div>
        ),
    };

    const filteredTemplates = templates.filter(
        (t) =>
            t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            t.body.toLowerCase().includes(searchInput.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <PermissionGuard action="manage" subject="all">
            <CrudPageShell
                title="Templates de WhatsApp"
                subtitle="Gerencie as mensagens automáticas enviadas via WhatsApp."
                icon={MessageCircle}
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
            <PreviewDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                variant="whatsapp"
                template={previewTemplate}
            />

            {/* Editor Drawer */}
            <CrudEditDrawer
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) resetForm();
                }}
                title={editingTemplate ? 'Editar Template WhatsApp' : 'Novo Template WhatsApp'}
                icon={MessageCircle}
                onSave={handleSave}
                isSaving={isSaving}
                maxWidth="max-w-3xl"
            >
                <WhatsAppTemplateForm
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
        </PermissionGuard>
    );
}
