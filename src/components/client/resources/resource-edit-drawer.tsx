'use client'

import React, { useState, useEffect } from 'react'
import {
    X,
    FileText,
    Users,
    Info,
    ExternalLink,
    Layout,
    Loader2,
    Trash2,
    Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResourceDetailsForm } from '@/components/admin/resources/edit/resource-details-form'
import { ResourceFilesManager } from '@/components/admin/resources/edit/resource-files-manager'
import { ResourceAccessManager } from '@/components/admin/resources/edit/resource-access-manager'
import { ResourceImagesManager } from '@/components/admin/resources/edit/resource-images-manager'
import { ResourceVideosManager } from '@/components/admin/resources/edit/resource-videos-manager'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'

interface ResourceDetail {
    id: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    externalId: number
    isFree: boolean
    thumbUrl: string | null
    createdAt: string
    updatedAt: string
    files: Array<any>
    images: Array<any>
    videos: Array<any>
    stats: {
        totalUsers: number
        accessGrants: number
        subscriberAccess: number
    }
}

interface ResourceEditDrawerProps {
    resourceId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ResourceEditDrawer({ resourceId, open, onOpenChange, onSuccess }: ResourceEditDrawerProps) {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('details')

    // Fetch full resource details
    const { data: resource, isLoading, error } = useQuery({
        queryKey: ['resource-detail', resourceId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch resource')
            }
            return response.json() as Promise<ResourceDetail>
        },
        enabled: !!resourceId && open,
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Erro ao excluir recurso')
            }
            return response.status === 204 ? null : response.json()
        },
        onSuccess: () => {
            toast.success('Recurso deletado permanentemente')
            onOpenChange(false)
            onSuccess?.()
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
        },
        onError: () => {
            toast.error('Erro ao deletar recurso')
        }
    })

    // Reset tab when opening for a new resource
    useEffect(() => {
        if (open) {
            setActiveTab('details')
        }
    }, [open, resourceId])

    if (!resourceId) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
            <DrawerContent className="h-[100dvh] max-h-none rounded-none border-none bg-background data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="mx-auto w-full max-w-7xl flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="border-b pb-4 shrink-0 px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <DrawerTitle className="text-xl font-black tracking-tight truncate">
                                        {isLoading ? 'Carregando...' : resource?.title}
                                    </DrawerTitle>
                                    {!isLoading && resource && (
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{resource.subject}</span>
                                            <span className="text-muted-foreground/30">•</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{resource.educationLevel}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isLoading && resource && (
                                    <DropdownActions
                                        resource={resource}
                                        onDelete={() => deleteMutation.mutate()}
                                        isDeleting={deleteMutation.isPending}
                                    />
                                )}
                                <DrawerClose asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/80">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </div>
                        <DrawerDescription className="sr-only">Editor completo para gerenciamento de detalhes, arquivos, imagens, vídeos e permissões do recurso no catálogo.</DrawerDescription>
                    </DrawerHeader>

                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Preparando editor...</span>
                        </div>
                    ) : error || !resource ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className="p-4 bg-destructive/5 rounded-full mb-4">
                                <X className="h-10 w-10 text-destructive/50" />
                            </div>
                            <h3 className="text-lg font-black text-foreground mb-2">Erro ao carregar recurso</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">{error instanceof Error ? error.message : 'Não foi possível encontrar este material no catálogo.'}</p>
                            <Button variant="outline" className="mt-6 rounded-xl font-bold" onClick={() => onOpenChange(false)}>
                                Voltar para lista
                            </Button>
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-6 py-4 bg-muted/20 border-b shrink-0">
                                <TabsList className="w-full bg-background border p-1 rounded-xl shadow-sm h-12">
                                    <TabsTrigger value="details" className="flex-1 rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all gap-2 truncate">
                                        <Info className="h-4 w-4 hidden sm:block" />
                                        <span>Detalhes</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="files" className="flex-1 rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all gap-2 truncate">
                                        <FileText className="h-4 w-4 hidden sm:block" />
                                        <span>Arquivos</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="images" className="flex-1 rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all gap-2 truncate">
                                        <Layout className="h-4 w-4 hidden sm:block" />
                                        <span>Imagens</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="videos" className="flex-1 rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all gap-2 truncate">
                                        <Globe className="h-4 w-4 hidden sm:block" />
                                        <span>Vídeos</span>
                                    </TabsTrigger>
                                    <PermissionGuard action="manage" subject="Resource">
                                        <TabsTrigger value="access" className="flex-1 rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all gap-2 truncate">
                                            <Users className="h-4 w-4 hidden sm:block" />
                                            <span>Acessos</span>
                                        </TabsTrigger>
                                    </PermissionGuard>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin focus:outline-none">
                                <div className="max-w-7xl mx-auto pb-20">
                                    <TabsContent value="details" className="m-0 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ResourceDetailsForm resource={resource} />
                                    </TabsContent>

                                    <TabsContent value="files" className="m-0 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ResourceFilesManager resourceId={resource.id} initialFiles={resource.files} />
                                    </TabsContent>

                                    <TabsContent value="images" className="m-0 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ResourceImagesManager
                                            resourceId={resource.id}
                                            initialImages={resource.images}
                                            currentThumbUrl={resource.thumbUrl}
                                        />
                                    </TabsContent>

                                    <TabsContent value="videos" className="m-0 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ResourceVideosManager
                                            resourceId={resource.id}
                                            initialVideos={resource.videos}
                                        />
                                    </TabsContent>

                                    <TabsContent value="access" className="m-0 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <ResourceAccessManager resourceId={resource.id} />
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>
                    )}
                </div>
            </DrawerContent >
        </Drawer >
    )
}

function DropdownActions({ resource, onDelete, isDeleting }: { resource: ResourceDetail, onDelete: () => void, isDeleting: boolean }) {
    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => window.open(`/resources/${resource.id}`, '_blank')}
                title="Ver no site"
            >
                <ExternalLink className="h-4 w-4" />
            </Button>

            <PermissionGuard action="delete" subject="Resource">
                <DeleteConfirmDialog
                    onConfirm={onDelete}
                    isLoading={isDeleting}
                    title="Excluir este Material?"
                    description="Todos os arquivos, imagens, vídeos e permissões vinculados serão permanentemente removidos."
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Excluir material"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    }
                />
            </PermissionGuard>
        </div>
    )
}
