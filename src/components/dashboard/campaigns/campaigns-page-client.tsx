'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, Edit3, Trash2 } from 'lucide-react'
import { CrudPageShell } from '@/components/dashboard/crud/crud-page-shell'
import { CrudDataView } from '@/components/dashboard/crud/crud-data-view'
import { CrudEditDrawer } from '@/components/dashboard/crud/crud-edit-drawer'
import { useDataTable } from '@/hooks/utils/use-data-table'
import { createCampaign, deleteCampaign, updateCampaign } from '@/lib/campaigns/api-client'
import { type CampaignInput, type PushCampaign } from '@/lib/campaigns/types'
import { CampaignForm } from '@/components/dashboard/campaigns/campaign-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function CampaignsPageClient() {
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

    const crud = useDataTable<PushCampaign>({
        queryKey: ['admin-campaigns'],
        endpoint: '/api/v1/admin/campaigns',
    })

    const saveMutation = useMutation({
        mutationFn: async (data: CampaignInput) => {
            if (crud.itemToEdit) {
                return updateCampaign(crud.itemToEdit.id, data)
            }

            return createCampaign(data)
        },
        onSuccess: () => {
            toast.success(crud.itemToEdit ? 'Campanha atualizada' : 'Campanha criada')
            crud.setIsEditDrawerOpen(false)
            crud.refetch()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return deleteCampaign(id)
        },
        onSuccess: () => {
            toast.success('Campanha excluída com sucesso')
            crud.refetch()
            setIsDeletingId(null)
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const handleSave = async (data: CampaignInput) => {
        saveMutation.mutate(data)
    }

    const confirmDelete = async () => {
        if (!isDeletingId) return
        deleteMutation.mutate(isDeletingId)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            DRAFT: { variant: 'secondary', label: 'Rascunho' },
            SCHEDULED: { variant: 'default', label: 'Agendada' },
            SENDING: { variant: 'default', label: 'Enviando' },
            SENT: { variant: 'outline', label: 'Enviada' },
            FAILED: { variant: 'destructive', label: 'Falhou' },
        }
        const config = variants[status] || variants.DRAFT
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    return (
        <>
            <CrudPageShell
                title="Campanhas de Push"
                subtitle="Gerencie campanhas de marketing via push notifications"
                icon={Send}
                onAdd={crud.openCreate}
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
                                                Campanha
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Status
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Métricas
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Data
                                            </th>
                                            <th className="w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crud.data.map((campaign) => (
                                            <tr
                                                key={campaign.id}
                                                className="group border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
                                                onClick={() => crud.openEdit(campaign)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                                            <Send className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-sm text-foreground block leading-tight">
                                                                {campaign.title}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground truncate block max-w-[300px]">
                                                                {campaign.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        {getStatusBadge(campaign.status)}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="text-center text-xs">
                                                        <div className="font-medium">
                                                            {campaign.totalSent} enviados
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {campaign.totalClicked} cliques (
                                                            {campaign.totalSent > 0
                                                                ? (
                                                                    (campaign.totalClicked /
                                                                        campaign.totalSent) *
                                                                    100
                                                                ).toFixed(1)
                                                                : 0}
                                                            %)
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span className="text-xs text-muted-foreground">
                                                        {campaign.sentAt
                                                            ? format(
                                                                new Date(campaign.sentAt),
                                                                'dd/MM/yyyy HH:mm',
                                                                { locale: ptBR }
                                                            )
                                                            : campaign.scheduledAt
                                                                ? format(
                                                                    new Date(campaign.scheduledAt),
                                                                    'dd/MM/yyyy HH:mm',
                                                                    { locale: ptBR }
                                                                )
                                                                : '-'}
                                                    </span>
                                                </td>

                                                <td
                                                    className="px-4 py-3"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                            onClick={() => crud.openEdit(campaign)}
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                            onClick={() =>
                                                                setIsDeletingId(campaign.id)
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {crud.data.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
                                    onClick={() => crud.openEdit(campaign)}
                                >
                                    <div className="flex p-3 gap-3">
                                        <div className="relative w-16 shrink-0">
                                            <div className="aspect-square w-full bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
                                                <Send className="h-6 w-6 text-primary/40" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <h3 className="font-semibold text-sm text-foreground truncate leading-tight mb-1">
                                                {campaign.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {campaign.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px]">
                                                <span className="font-medium text-primary">
                                                    {campaign.totalSent} enviados
                                                </span>
                                                <span className="text-muted-foreground/30">•</span>
                                                <span className="text-muted-foreground">
                                                    {campaign.totalClicked} cliques
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm"
                                                onClick={() => crud.openEdit(campaign)}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                                onClick={() => setIsDeletingId(campaign.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 px-3 py-2 bg-muted/5 flex items-center justify-between">
                                        {getStatusBadge(campaign.status)}
                                        <span className="text-[9px] text-muted-foreground/40 font-mono italic">
                                            #{campaign.id.slice(-4)}
                                        </span>
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
                title={crud.itemToEdit ? 'Editar Campanha' : 'Nova Campanha'}
                subtitle="Configure título, mensagem e agendamento"
                icon={Send}
                isSaving={saveMutation.isPending}
                maxWidth="max-w-3xl"
                onSave={() =>
                    document
                        .getElementById('crud-form')
                        ?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                }
            >
                <CampaignForm
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
                title="Excluir Campanha?"
                description="Esta ação não pode ser desfeita. Todos os dados de tracking desta campanha serão perdidos."
                trigger={null}
            />
        </>
    )
}
