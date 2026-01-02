'use client'

import React, { useState } from 'react'
import { BookOpen, Hash, Edit3, Trash2, LayoutGrid, List as ListIcon } from 'lucide-react'
import { CrudPageShell } from '@/components/admin/crud/crud-page-shell'
import { CrudDataView } from '@/components/admin/crud/crud-data-view'
import { CrudEditDrawer } from '@/components/admin/crud/crud-edit-drawer'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useDataTable } from '@/hooks/use-data-table'
import { SubjectForm } from '@/components/admin/subjects/subject-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { SubjectInput } from '@/lib/schemas/admin/subjects'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'

interface Subject {
    id: string
    name: string
    slug: string
    _count: {
        resources: number
    }
}

export default function AdminSubjectsPage() {
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [isDeletingLoading, setIsDeletingLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const crud = useDataTable<Subject>({
        queryKey: ['admin-subjects'],
        endpoint: '/api/v1/admin/subjects'
    })

    const handleSave = async (data: SubjectInput) => {
        setIsSaving(true)
        try {
            const method = crud.itemToEdit ? 'PUT' : 'POST'
            const url = crud.itemToEdit
                ? `/api/v1/admin/subjects/${crud.itemToEdit.id}`
                : '/api/v1/admin/subjects'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Erro ao salvar')
            }

            toast.success(crud.itemToEdit ? 'Matéria atualizada' : 'Matéria criada')
            crud.setIsEditDrawerOpen(false)
            crud.refetch()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const confirmDelete = async () => {
        if (!isDeletingId) return
        setIsDeletingLoading(true)
        try {
            const response = await fetch(`/api/v1/admin/subjects/${isDeletingId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Erro ao excluir')
            }

            toast.success('Matéria excluída com sucesso')
            crud.refetch()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeletingLoading(false)
            setIsDeletingId(null)
        }
    }

    return (
        <>
            <CrudPageShell
                title="Disciplinas"
                subtitle="Gerencie as disciplinas e áreas de conhecimento"
                icon={BookOpen}
                onAdd={crud.openCreate}
                // Exemplo de como restringir o botão de Adicionar se necessário:
                // action="create"
                // subject="Subject"
                view={crud.view}
                setView={crud.setView}
                searchInput={crud.searchInput}
                onSearchChange={crud.setSearchInput}
                page={crud.page}
                limit={crud.limit}
                onPageChange={crud.handlePageChange}
                onLimitChange={crud.handleLimitChange}
                totalItems={crud.pagination?.total ?? 0}
                totalPages={crud.pagination?.totalPages ?? 0}
                hasMore={crud.pagination?.hasMore ?? false}
                isLoading={crud.isLoading}
            >
                <CrudDataView
                    data={crud.data}
                    view={crud.view}
                    tableView={
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border">
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Disciplina
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Número de Recursos
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Código
                                            </th>
                                            <th className="w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crud.data.map((subject) => (
                                            <tr
                                                key={subject.id}
                                                className="group border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                                                onClick={() => crud.openEdit(subject)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                                            <BookOpen className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <span className="font-semibold text-sm text-foreground truncate leading-tight">
                                                            {subject.name}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                            {subject._count.resources}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <code className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground border">
                                                        {subject.slug}
                                                    </code>
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PermissionGuard action="update" subject="Subject">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                                onClick={() => crud.openEdit(subject)}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                        </PermissionGuard>
                                                        <PermissionGuard action="delete" subject="Subject">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                onClick={() => setIsDeletingId(subject.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </PermissionGuard>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                    cardView={
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {crud.data.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
                                    onClick={() => crud.openEdit(subject)}
                                >
                                    <div className="flex p-3 gap-3">
                                        <div className="relative w-16 shrink-0">
                                            <div className="aspect-square w-full bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
                                                <Hash className="h-6 w-6 text-primary/40" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <h3 className="font-semibold text-sm text-foreground truncate leading-tight mb-1">
                                                {subject.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <code className="text-[10px] font-mono text-muted-foreground opacity-60">
                                                    {subject.slug}
                                                </code>
                                                <span className="text-muted-foreground/30">•</span>
                                                <span className="text-[10px] font-bold text-primary">
                                                    {subject._count.resources} {subject._count.resources === 1 ? 'recurso' : 'recursos'}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <PermissionGuard action="update" subject="Subject">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm"
                                                    onClick={() => crud.openEdit(subject)}
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard action="delete" subject="Subject">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                                    onClick={() => setIsDeletingId(subject.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 px-3 py-2 bg-muted/5 flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] border-primary/10 text-muted-foreground/70 font-medium">
                                            Disciplina
                                        </Badge>
                                        <span className="text-[9px] text-muted-foreground/40 font-mono italic">#{subject.id.slice(-4)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                />
            </CrudPageShell>

            <CrudEditDrawer
                open={crud.isEditDrawerOpen}
                onOpenChange={crud.setIsEditDrawerOpen}
                title={crud.itemToEdit ? 'Editar Matéria' : 'Nova Matéria'}
                subtitle="Defina o nome e slug da disciplina"
                icon={BookOpen}
                isSaving={isSaving}
                onSave={() => document.getElementById('crud-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            >
                <SubjectForm
                    initialData={crud.itemToEdit}
                    onSubmit={handleSave}
                    isLoading={isSaving}
                />
            </CrudEditDrawer>

            <DeleteConfirmDialog
                open={!!isDeletingId}
                onOpenChange={(open) => !open && setIsDeletingId(null)}
                onConfirm={confirmDelete}
                isLoading={isDeletingLoading}
                title="Excluir Matéria?"
                description="Esta ação não pode ser desfeita. A matéria apenas poderá ser excluída se não houver nenhum recurso vinculado a ela."
                trigger={null}
            />
        </>
    )
}
