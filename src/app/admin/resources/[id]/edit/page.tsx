'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  FileText,
  Users,
  Info,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Clock,
  Layout
} from 'lucide-react'
import { useResource } from '@/contexts/resource-context'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TemplateMainShell,
} from '@/components/client/resources'
import { ResourceDetailsForm } from '@/components/admin/resources/edit/resource-details-form'
import { ResourceFilesManager } from '@/components/admin/resources/edit/resource-files-manager'
import { ResourceAccessManager } from '@/components/admin/resources/edit/resource-access-manager'
import { ResourceImagesManager } from '@/components/admin/resources/edit/resource-images-manager'
import { ResourceVideosManager } from '@/components/admin/resources/edit/resource-videos-manager'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  files: Array<{
    id: string
    name: string
    cloudinaryPublicId: string
    url: string
    fileType: string
    sizeBytes: number
    createdAt: string
  }>
  images: Array<{
    id: string
    cloudinaryPublicId: string
    url: string
    alt: string | null
    order: number
    createdAt: string
  }>
  videos: Array<{
    id: string
    title: string
    cloudinaryPublicId: string
    url: string
    thumbnail: string | null
    duration: number | null
    order: number
    createdAt: string
  }>
  stats: {
    totalUsers: number
    accessGrants: number
    subscriberAccess: number
  }
}

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const resourceId = params.id as string
  const [activeTab, setActiveTab] = useState('details')
  const { setResourceTitle } = useResource()

  // Fetch resource details
  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource-detail', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch resource')
      }
      return response.json() as Promise<ResourceDetail>
    },
    enabled: !!resourceId,
  })

  // Update breadcrumb title
  useEffect(() => {
    if (resource?.title) {
      setResourceTitle(resource.title)
    }
    return () => setResourceTitle(null)
  }, [resource?.title, setResourceTitle])

  const deleteResourceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao excluir recurso')
      }
      // Status 204 não tem conteúdo, não tente fazer parse
      if (response.status === 204) {
        return null
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Recurso excluído com sucesso')
      // Pequeno delay para garantir que o toast seja exibido antes do redirect
      setTimeout(() => {
        router.push('/admin/resources')
      }, 500)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir recurso')
    }
  })

  const handleBack = () => {
    router.push('/admin/resources')
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-destructive font-medium">Erro ao carregar recurso</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Verifique se o ID está correto'}
          </p>
        </div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Recursos
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-muted/30">

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 overflow-y-auto native-scroll">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">

          {/* Section: Resource Header Summary */}
          <div className="bg-background rounded-xl border p-3 md:p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-md md:text-md font-bold tracking-tight text-foreground truncate">{resource.title}</h1>
                </div>
              </div>

              {/* Actions Menu */}
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => window.open(`/resources/${resource.id}`, '_blank')}
                  title="Visualizar no Site"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <DeleteConfirmDialog
                  onConfirm={() => deleteResourceMutation.mutate()}
                  isLoading={deleteResourceMutation.isPending}
                  title="Excluir este Recurso?"
                  description="ESTA É UMA AÇÃO CRÍTICA. Todos os arquivos, imagens, vídeos e permissões de acesso associados a este recurso serão excluídos permanentemente."
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Excluir Recurso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Section: Tabs Navigation & Content */}
          <div className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <TabsList className="h-12 inline-flex min-w-full md:min-w-0 w-full bg-background border p-1 rounded-xl shadow-sm">
                  <TabsTrigger
                    value="details"
                    className="flex-1 gap-1 md:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-semibold text-xs md:text-sm"
                  >
                    <Info className="h-4 w-4 hidden md:block" />
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className="flex-1 gap-1 md:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-semibold text-xs md:text-sm"
                  >
                    <FileText className="h-4 w-4 hidden md:block" />
                    Arquivos
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="flex-1 gap-1 md:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-semibold text-xs md:text-sm"
                  >
                    <Layout className="h-4 w-4 hidden md:block" />
                    Imagens
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="flex-1 gap-1 md:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-semibold text-xs md:text-sm"
                  >
                    <ExternalLink className="h-4 w-4 hidden md:block" />
                    Vídeos
                  </TabsTrigger>
                  <TabsTrigger
                    value="access"
                    className="flex-1 gap-1 md:gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all font-semibold text-xs md:text-sm"
                  >
                    <Users className="h-4 w-4 hidden md:block" />
                    Acessos
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-8 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                <TabsContent value="details">
                  <ResourceDetailsForm resource={resource} />
                </TabsContent>

                <TabsContent value="files">
                  <ResourceFilesManager resourceId={resource.id} initialFiles={resource.files} />
                </TabsContent>

                <TabsContent value="images">
                  <ResourceImagesManager
                    resourceId={resource.id}
                    initialImages={resource.images}
                    currentThumbUrl={resource.thumbUrl}
                  />
                </TabsContent>

                <TabsContent value="videos">
                  <ResourceVideosManager
                    resourceId={resource.id}
                    initialVideos={resource.videos}
                  />
                </TabsContent>

                <TabsContent value="access">
                  <ResourceAccessManager resourceId={resource.id} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
