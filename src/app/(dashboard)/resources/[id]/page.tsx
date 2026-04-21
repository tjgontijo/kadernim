'use client'

import Link from 'next/link'
import { use, useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowDownToLine, Clock, Layers, Calendar, ChevronLeft, Download, AlertTriangle, Info, Share2, Link as LinkIcon, Flag, File, FileText, Presentation, Users } from 'lucide-react'
import {
  createResourceDownloadLink,
  fetchResourceDetail,
} from '@/lib/resources/api-client'
import type { ResourceDetail } from '@/lib/resources/types'
import { BadgeSubject } from '@/components/dashboard/resources/BadgeSubject'
import { Button } from '@/components/ui/button'
import { LazyImage } from '@/components/shared/lazy-image'
import { useResource } from '@/hooks/resources/use-resource-context'
import { ResourceGallery } from '@/components/design-system/resources/ResourceGallery'
import { ResourceOverview } from '@/components/design-system/resources/ResourceOverview'
import { ResourceObjectives } from '@/components/design-system/resources/ResourceObjectives'
import { ResourceTimeline } from '@/components/design-system/resources/ResourceTimeline'
import { ResourceBNCC } from '@/components/design-system/resources/ResourceBNCC'
import { ResourceReviews } from '@/components/design-system/resources/ResourceReviews'
import { ResourceActionSidebar } from '@/components/design-system/resources/ResourceActionSidebar'
import { ResourceFilesList } from '@/components/design-system/resources/ResourceFilesList'
import { ResourceRelatedStrip } from '@/components/design-system/resources/ResourceRelatedStrip'
import { ResourceShareCard } from '@/components/design-system/resources/ResourceShareCard'
import { useSessionQuery } from '@/hooks/auth/use-session'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateAdminResource } from '@/lib/resources/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ResourceDetailPageSkeleton } from '@/components/dashboard/resources/resource-detail-page-skeleton'

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setResourceTitle, setResourceSubject, setResourceEducationLevel } = useResource()
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [downloadFeedback, setDownloadFeedback] = useState<
    { type: 'error' | 'info'; text: string } | null
  >(null)

  const { data: session } = useSessionQuery()
  const isAdmin = session?.data?.user?.role === 'admin'

  const {
    data: resource,
    isLoading,
    error,
  } = useQuery<ResourceDetail>({
    queryKey: ['resource-detail', id],
    queryFn: () => fetchResourceDetail(id),
  })

  // Mutation para publicar/despublicar com optimistic update
  const publishMutation = useMutation({
    mutationFn: (isPublished: boolean) => 
      updateAdminResource(resource?.id!, { 
        archivedAt: isPublished ? null : new Date().toISOString()
      }),
    onMutate: async (isPublished) => {
      // Cancela qualquer refetch em andamento para evitar sobrescrever o optimistic update
      await queryClient.cancelQueries({ queryKey: ['resource-detail', id] })
      // Salva o estado anterior para rollback em caso de erro
      const previous = queryClient.getQueryData<ResourceDetail>(['resource-detail', id])
      // Atualiza o cache imediatamente
      queryClient.setQueryData<ResourceDetail>(['resource-detail', id], (old) => {
        if (!old) return old
        return { ...old, archivedAt: isPublished ? null : new Date().toISOString() }
      })
      return { previous }
    },
    onSuccess: (_, isPublished) => {
      toast.success(isPublished ? 'Material publicado!' : 'Material movido para rascunhos')
    },
    onError: (_, __, context) => {
      // Reverte para o estado anterior se a requisição falhar
      if (context?.previous) {
        queryClient.setQueryData(['resource-detail', id], context.previous)
      }
      toast.error('Erro ao alterar status')
    },
    onSettled: () => {
      // Confirma com o servidor após a mutação (sucesso ou erro)
      queryClient.invalidateQueries({ queryKey: ['resource-detail', id] })
    },
  })

  // Provide the loaded resource title and sub-entities to the navigation globally
  useEffect(() => {
    if (resource) {
      setResourceTitle(resource.title || null)
      setResourceSubject(resource.subject || null)
      setResourceEducationLevel(resource.educationLevel || null)
      setActiveImageIndex(0)
    }
    return () => {
      setResourceTitle(null)
      setResourceSubject(null)
      setResourceEducationLevel(null)
    }
  }, [resource, setResourceTitle, setResourceSubject, setResourceEducationLevel])

  const handleDownload = useCallback(
    async (e: React.MouseEvent, file: { id: string; name: string }) => {
      e.preventDefault()
      if (!resource) return
      if (!resource.hasAccess) {
        window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
        return
      }

      try {
        setDownloadFeedback(null)
        setDownloadingFileId(file.id)
        const data = await createResourceDownloadLink(resource.id, file.id)

        if (!data.downloadUrl) {
          setDownloadFeedback({
            type: 'error',
            text: 'Recebemos uma resposta sem URL válida.',
          })
          return
        }

        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer')
        setDownloadFeedback({
          type: 'info',
          text: 'Download iniciado. Caso não veja o arquivo, verifique o bloqueio de pop-ups.',
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : ''
        if (message === 'Unauthorized') {
          setDownloadFeedback({
            type: 'error',
            text: 'Sessão expirada. Faça login novamente para baixar este recurso.',
          })
          return
        }

        if (message === 'Forbidden') {
          setDownloadFeedback({
            type: 'error',
            text: 'Acesso negado. Você não possui permissão para este arquivo.',
          })
          return
        }

        if (message === 'rate_limited') {
          setDownloadFeedback({
            type: 'error',
            text: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
          })
          return
        }

        setDownloadFeedback({
          type: 'error',
          text: 'Erro inesperado ao iniciar o download.',
        })
      } finally {
        setDownloadingFileId(null)
      }
    },
    [resource]
  )

  if (isLoading) {
    return <ResourceDetailPageSkeleton />
  }

  if (error || !resource) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link href="/resources">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Materiais
          </Button>
        </Link>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-destructive font-bold text-lg">
            {error instanceof Error ? error.message : 'Recurso não encontrado'}
          </p>
          <Button asChild variant="outline" className="rounded-full border-destructive/20 text-destructive hover:bg-destructive/5">
            <Link href="/resources">Explorar outros materiais</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-8 py-8 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-[48px] items-start tracking-tight">
        {/* LEFT COLUMN */}
        <div>
          <ResourceGallery
            files={resource.files}
            videos={resource.videos}
            title={resource.title || ''}
          />

          <ResourceOverview description={resource.description || ''} />
          
          <ResourceObjectives 
            objectives={resource.objectives} 
          />

          <ResourceTimeline 
            steps={resource.steps} 
          />
          
          <ResourceBNCC 
            skills={resource.bnccSkills} 
          />
          
          <ResourceReviews 
            resourceId={resource.id}
            averageRating={resource.averageRating}
            reviewCount={resource.reviewCount}
            isAdmin={isAdmin}
          />
        </div>

        {/* RIGHT: sticky sidebar */}
        <aside className="sticky top-[84px] flex flex-col gap-[20px]">
          {isAdmin && (
            <div className="bg-card border border-line rounded-5 p-6 shadow-sm space-y-5">
              <div className="text-center border-b border-line-soft pb-4">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink-mute/60">Controle do Editor</Label>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-bold text-ink">
                    {!resource.archivedAt ? (
                      <span className="text-sage flex items-center gap-1.5">● Publicado</span>
                    ) : (
                      <span className="text-ink-mute flex items-center gap-1.5">○ Rascunho</span>
                    )}
                  </p>
                  <Switch 
                    checked={!resource.archivedAt}
                    onCheckedChange={(checked) => publishMutation.mutate(checked)}
                    disabled={publishMutation.isPending}
                    className="data-[state=checked]:bg-sage scale-90"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full bg-paper border-line text-ink hover:text-terracotta hover:border-terracotta/30 font-bold py-5 rounded-4 transition-all shadow-sm"
                  onClick={() => router.push(`/resources/${resource.id}/edit`)}
                >
                  Editar Material
                </Button>
              </div>
            </div>
          )}

          <ResourceActionSidebar 
             resource={resource}
             onDownload={handleDownload}
             downloadingFileId={downloadingFileId}
          />
          
          <ResourceFilesList 
             files={resource.files}
             onDownload={handleDownload}
             downloadingFileId={downloadingFileId}
          />
          
          {downloadFeedback && (
            <div
              className={`rounded-4 border p-[16px] text-[14px] font-semibold flex items-center gap-[12px] animate-in fade-in slide-in-from-top-2 duration-300 ${
                downloadFeedback.type === 'error'
                  ? 'border-destructive/20 bg-destructive/5 text-destructive'
                  : 'border-sage/20 bg-sage/5 text-sage'
              }`}
            >
              {downloadFeedback.type === 'error' ? (
                <AlertTriangle className="h-5 w-5 shrink-0" />
              ) : (
                <Info className="h-5 w-5 shrink-0" />
              )}
              {downloadFeedback.text}
            </div>
          )}

          <ResourceShareCard />
        </aside>
      </div>

      <ResourceRelatedStrip 
        resourceId={resource.id} 
        subject={resource.subject} 
      />
    </div>
  )
}
