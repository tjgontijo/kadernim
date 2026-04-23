'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Filter, Loader2, Plus } from 'lucide-react'
import { useInfiniteDataTable } from '@/hooks/utils/use-infinite-data-table'
import { SubjectsTableVirtuoso } from './subjects-table-virtuoso'
import { createAdminSubject, deleteAdminSubject, updateAdminSubject } from '@/lib/taxonomy/api-client'
import { SubjectForm } from '@/components/dashboard/subjects/subject-form'
import { toast } from 'sonner'
import { type SubjectInput, type Subject } from '@/lib/taxonomy/types'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { SearchInput } from '@/components/dashboard/shared/search-input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DEFAULT_SUBJECT_COLOR, DEFAULT_SUBJECT_TEXT_COLOR } from '@/lib/taxonomy/constants'
import { useEducationLevels } from '@/hooks/taxonomy/use-taxonomy'

export function SubjectsPageClient() {
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [educationLevel, setEducationLevel] = useState('all')
    const formId = 'subject-dialog-form'
    const { data: levels = [] } = useEducationLevels()

    const crud = useInfiniteDataTable<Subject>({
        queryKey: ['subjects-admin'],
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
            toast.success(crud.itemToEdit ? 'Disciplina atualizada' : 'Disciplina criada')
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
            toast.success('Disciplina excluída com sucesso')
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

    const activeFiltersCount = educationLevel !== 'all' ? 1 : 0

    const applyFilters = () => {
        crud.handleFilterChange({ educationLevelSlug: educationLevel })
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setEducationLevel('all')
        crud.handleFilterChange({ educationLevelSlug: 'all' })
        setIsFilterOpen(false)
    }

    return (
        <>
            <PageScaffold className="pt-4 sm:pt-6">
                <PageScaffold.Header title="Disciplinas" />

                <PageScaffold.Controls>
                    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <div className="flex items-center gap-2 w-full">
                            <SearchInput
                                placeholder="Buscar disciplina..."
                                value={crud.searchInput}
                                onChange={(event) => crud.setSearchInput(event.target.value)}
                                onClear={() => crud.setSearchInput('')}
                                aria-label="Buscar disciplinas"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 sm:h-12 rounded-2xl border-border/50 shrink-0 relative px-4 font-semibold"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <Filter className="h-4 w-4 text-foreground/70" />
                                <span className="ml-2 hidden sm:inline">Filtros</span>
                                {activeFiltersCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>
                        </div>

                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Filtrar Disciplinas</DialogTitle>
                                <DialogDescription>
                                    Selecione a etapa para mostrar somente disciplinas vinculadas.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Etapa de Ensino
                                </label>
                                <Select value={educationLevel} onValueChange={setEducationLevel}>
                                    <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                                        <SelectValue placeholder="Selecione a etapa" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-border/50">
                                        <SelectItem value="all">Todas as Etapas</SelectItem>
                                        {levels.map((item) => (
                                            <SelectItem key={item.slug} value={item.slug}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={clearFilters}>
                                    Limpar
                                </Button>
                                <Button onClick={applyFilters}>
                                    Aplicar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </PageScaffold.Controls>

                <section className="px-0 min-h-[420px]">
                    {crud.isLoading || (crud.isFetching && crud.data.length === 0) ? (
                        <div className="rounded-xl border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
                            <div className="grid grid-cols-[minmax(280px,1fr)_minmax(220px,0.6fr)_120px_96px] gap-0 bg-muted/80 border-b border-border/40">
                                <div className="px-4 py-3">
                                    <Skeleton className="h-3 w-24 rounded-lg" />
                                </div>
                                <div className="px-4 py-3">
                                    <Skeleton className="h-3 w-16 rounded-lg" />
                                </div>
                                <div className="px-4 py-3 flex justify-center">
                                    <Skeleton className="h-3 w-16 rounded-lg" />
                                </div>
                                <div className="px-4 py-3" />
                            </div>

                            <div className="divide-y divide-border/40">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[minmax(280px,1fr)_minmax(220px,0.6fr)_120px_96px] items-center"
                                    >
                                        <div className="px-4 py-4 flex items-center gap-3">
                                            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                                            <Skeleton className="h-6 w-52 rounded-lg" />
                                        </div>

                                        <div className="px-4 py-4 flex items-center gap-2">
                                            <Skeleton className="h-8 w-40 rounded-full" />
                                            <Skeleton className="h-8 w-40 rounded-full" />
                                        </div>

                                        <div className="px-4 py-4 flex justify-center">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                        </div>

                                        <div className="px-4 py-4 flex justify-end gap-1">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <SubjectsTableVirtuoso
                            subjects={crud.data}
                            onEdit={crud.openEdit}
                            onDelete={(id) => setIsDeletingId(id)}
                            onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
                        />
                    )}

                    {crud.isFetchingNextPage && (
                        <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-card p-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-3.5 w-1/3" />
                                    </div>
                                    <Skeleton className="h-8 w-24 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
                    <Button
                        onClick={crud.openCreate}
                        className="w-14 h-14 rounded-full shadow-3xl bg-terracotta hover:bg-terracotta-hover text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
                        size="icon"
                        aria-label="Nova disciplina"
                    >
                        <Plus className="w-8 h-8" />
                    </Button>
                </div>
            </PageScaffold>

            <Dialog
                open={crud.isEditDrawerOpen}
                onOpenChange={(open) => {
                    if (!saveMutation.isPending) {
                        crud.setIsEditDrawerOpen(open)
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg" showCloseButton={!saveMutation.isPending}>
                    <DialogHeader>
                        <DialogTitle>{crud.itemToEdit ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
                        <DialogDescription>Defina o nome e a cor da disciplina.</DialogDescription>
                    </DialogHeader>

                    <SubjectForm
                        formId={formId}
                        levels={levels}
                        initialData={
                            crud.itemToEdit
                                ? {
                                    name: crud.itemToEdit.name,
                                    color: crud.itemToEdit.color ?? DEFAULT_SUBJECT_COLOR,
                                    textColor: crud.itemToEdit.textColor ?? DEFAULT_SUBJECT_TEXT_COLOR,
                                    educationLevelSlugs: crud.itemToEdit.educationLevels?.map((level) => level.slug) ?? [],
                                }
                                : null
                        }
                        onSubmit={handleSave}
                        isLoading={saveMutation.isPending}
                    />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => crud.setIsEditDrawerOpen(false)}
                            disabled={saveMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" form={formId} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmDialog
                open={!!isDeletingId}
                onOpenChange={(open) => !open && setIsDeletingId(null)}
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                title="Excluir Disciplina?"
                description="Esta ação não pode ser desfeita. A disciplina só poderá ser excluída se não houver nenhum recurso vinculado a ela."
                trigger={null}
            />
        </>
    )
}
