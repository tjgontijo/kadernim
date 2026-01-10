'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Pencil,
  Trash2,
  Eye,
  Variable,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
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
  DeleteConfirmDialog,
  type ViewType,
  type ColumnDef,
  type CardConfig,
} from '@/components/admin/crud';
import { toast } from 'sonner';
import {
  getAllEvents,
  getEventVariables,
  getCategories,
} from '@/lib/events/catalog';
import { PushTemplateForm } from '@/components/admin/templates/push-template-form';
import { PushTemplatePreview } from '@/components/admin/templates/push-template-preview';

interface PushTemplate {
  id: string;
  slug: string;
  name: string;
  title: string;
  body: string;
  icon: string | null;
  badge: string | null;
  image: string | null;
  url: string | null;
  tag: string | null;
  eventType: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PushTemplatesPage() {
  const [view, setView] = useState<ViewType>('cards');
  const [templates, setTemplates] = useState<PushTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PushTemplate | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<PushTemplate | null>(
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
    title: '',
    body: '',
    icon: '',
    badge: '',
    image: '',
    url: '',
    tag: '',
    eventType: '',
    description: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/push-templates');
      const json = await response.json();
      if (json.success) setTemplates(json.data);
    } catch (error) {
      toast.error('Erro ao buscar templates de push');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      title: '',
      body: '',
      icon: '',
      badge: '',
      image: '',
      url: '',
      tag: '',
      eventType: '',
      description: '',
    });
    setEditingTemplate(null);
  };

  const openEditDrawer = (template: PushTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      slug: template.slug,
      title: template.title,
      body: template.body,
      icon: template.icon || '',
      badge: template.badge || '',
      image: template.image || '',
      url: template.url || '',
      tag: template.tag || '',
      eventType: template.eventType,
      description: template.description || '',
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.title || !formData.body || !formData.eventType) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (formData.title.length > 100) {
      toast.error('Título deve ter no máximo 100 caracteres');
      return;
    }

    if (formData.body.length > 500) {
      toast.error('Mensagem deve ter no máximo 500 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        title: formData.title,
        body: formData.body,
        icon: formData.icon || null,
        badge: formData.badge || null,
        image: formData.image || null,
        url: formData.url || null,
        tag: formData.tag || null,
        eventType: formData.eventType,
        description: formData.description || null,
      };

      const url = editingTemplate
        ? `/api/v1/admin/push-templates/${editingTemplate.id}`
        : '/api/v1/admin/push-templates';

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

  const handleToggle = async (template: PushTemplate) => {
    try {
      const res = await fetch(`/api/v1/admin/push-templates/${template.id}`, {
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
        `/api/v1/admin/push-templates/${templateToDelete}`,
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
  const columns: ColumnDef<PushTemplate>[] = [
    {
      key: 'title',
      label: 'Template',
      render: (template) => (
        <div className="flex items-center gap-3">
          <Bell className="h-4 w-4 text-amber-500" />
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
  const cardConfig: CardConfig<PushTemplate> = {
    title: (template) => template.name,
    subtitle: (template) => (
      <div className="flex flex-col gap-1 w-full mt-1">
        <span className="text-sm font-medium leading-tight">
          {template.title}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground truncate">
          {template.slug}
        </span>
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {template.description}
          </p>
        )}
      </div>
    ),
    badge: (template) => (
      <div className="flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-amber-500" />
        {template.isActive && (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>
    ),
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      t.title.toLowerCase().includes(searchInput.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <>
      <CrudPageShell
        title="Templates de Push"
        subtitle="Configure os modelos de notificação push para sua aplicação."
        icon={Bell}
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
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Preview da Notificação
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="mt-4">
              <PushTemplatePreview
                title={previewTemplate.title}
                body={previewTemplate.body}
                icon={previewTemplate.icon}
                image={previewTemplate.image}
              />

              {/* Meta Info */}
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                {previewTemplate.url && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{previewTemplate.url}</span>
                  </div>
                )}
                {previewTemplate.tag && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    <span>{previewTemplate.tag}</span>
                  </div>
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
        title={editingTemplate ? 'Editar Template Push' : 'Novo Template Push'}
        icon={Bell}
        onSave={handleSave}
        isSaving={isSaving}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-8 py-4">
          {/* Preview Section */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Preview em Tempo Real
            </Label>
            <PushTemplatePreview
              title={formData.title}
              body={formData.body}
              icon={formData.icon}
              image={formData.image}
            />
          </div>

          <div className="space-y-6 pt-4 border-t">
            <PushTemplateForm
              data={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
              isEditing={!!editingTemplate}
            />
          </div>
        </div>
      </CrudEditDrawer>

      <DeleteConfirmDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Template?"
        description="Esta ação removerá permanentemente o template de push notification."
        confirmText="Excluir"
        cancelText="Cancelar"
        trigger={null}
      />
    </>
  );
}
