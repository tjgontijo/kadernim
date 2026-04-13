'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { BookOpen, Hash, Edit3, Trash2 } from 'lucide-react'
import { CrudPageShell } from '@/components/dashboard/crud/crud-page-shell'
import { CrudDataView } from '@/components/dashboard/crud/crud-data-view'
import { CrudEditDrawer } from '@/components/dashboard/crud/crud-edit-drawer'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useInfiniteDataTable } from '@/hooks/utils/use-infinite-data-table'
import { SubjectsTableVirtuoso } from './subjects-table-virtuoso'
import { SubjectsGridVirtuoso } from './subjects-grid-virtuoso'
import { createAdminSubject, deleteAdminSubject, updateAdminSubject } from '@/lib/taxonomy/api-client'
import { SubjectForm } from '@/components/dashboard/subjects/subject-form'
import { toast } from 'sonner'
import { type SubjectInput, type Subject } from '@/lib/taxonomy/types'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'

export function SubjectsPageClient() {
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

    const crud = useInfiniteDataTable<Subject>({
        queryKey: ['admin-subjects'],
        endpoint: '/api/v1/admin/subjects'
    })

    const saveMutation = useMutation({
        mutationFn: async (data: SubjectInput) => {
            if (crud.itemToEdit) {
                return updateAdminSubject(crud.itemToEdit.id, data)
            }

            return createAdminSubject(data)
        },
        onSuccess: () => {
            toast.success(crud.itemToEdit ? 'Matéria atualizada' : 'Matéria criada')
            crud.setIsEditDrawerOpen(false)
            crud.refetch()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return deleteAdminSubject(id)
        },
        onSuccess: () => {
            toast.success('Matéria excluída com sucesso')
            crud.refetch()
            setIsDeletingId(null)
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const handleSave = async (data: SubjectInput) => {
        saveMutation.mutate(data)
    }

    const confirmDelete = async () => {
        if (!isDeletingId) return
        deleteMutation.mutate(isDeletingId)
    }

    return (
        <>
            <CrudPageShell
                title="Disciplinas"
                subtitle="Gerencie as disciplinas e áreas de conhecimento"
                icon={BookOpen}
                onAdd={crud.openCreate}
                view={crud.view}
                setView={crud.setView}
                searchInput={crud.searchInput}
                onSearchChange={crud.setSearchInput}
                page={crud.pagination?.page ?? 1}
                limit={crud.limit}
                onPageChange={() => {}}
                onLimitChange={crud.handleLimitChange}
                totalItems={crud.pagination?.total ?? 0}
                totalPages={crud.pagination?.totalPages ?? 0}
                hasMore={crud.hasNextPage ?? false}
                isLoading={crud.isLoading}
            >
                <div className="p-4 md:p-6 pb-20 h-full flex flex-col">
                    <CrudDataView
                        data={crud.data}
                        view={crud.view}
                        tableView={
                            <SubjectsTableVirtuoso 
                                subjects={crud.data}
                                onEdit={crud.openEdit}
                                onDelete={(id) => setIsDeletingId(id)}
                                onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
                            />
                        }
                        cardView={
                            <SubjectsGridVirtuoso 
                                subjects={crud.data}
                                onEdit={crud.openEdit}
                                onDelete={(id) => setIsDeletingId(id)}
                                onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
                            />
                        }
                    />
                    
                    {crud.isFetchingNextPage && (
                        <div className="flex justify-center py-8">
                            <div className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                        </div>
                    )}
                </div>
            </CrudPageShell>

            <CrudEditDrawer
                open={crud.isEditDrawerOpen}
                onOpenChange={crud.setIsEditDrawerOpen}
                title={crud.itemToEdit ? 'Editar Matéria' : 'Nova Matéria'}
                subtitle="Defina o nome e slug da disciplina"
                icon={BookOpen}
                isSaving={saveMutation.isPending}
                onSave={() => document.getElementById('crud-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            >
                <SubjectForm
                    initialData={crud.itemToEdit}
                    onSubmit={handleSave}
                    isLoading={saveMutation.isPending}
                />
            </CrudEditDrawer>

            <DeleteConfirmDialog
                open={!!isDeletingId}
                onOpenChange={(open) => !open && setIsDeletingId(null)}
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                title="Excluir Matéria?"
                description="Esta ação não pode ser desfeita. A matéria apenas poderá ser excluída se não houver nenhum recurso vinculado a ela."
                trigger={null}
            />
        </>
    )
}
