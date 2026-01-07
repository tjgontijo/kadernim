'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { DownloadList } from '@/components/ui/download-list'
import { BadgeEducationLevel } from '@/components/client/resources/BadgeEducationLevel'
import { BadgeSubject } from '@/components/client/resources/BadgeSubject'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ResourceDetail } from '@/lib/schemas/resource'
import { ResourceImageCarousel } from '@/components/client/resources/ResourceImageCarousel'
import { LazyImage } from '@/components/ui/lazy-image'

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [resource, setResource] = useState<ResourceDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)
  const [downloadFeedback, setDownloadFeedback] = useState<
    { type: 'error' | 'info'; text: string } | null
  >(null)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const resolvedParams = await params
        const response = await fetch(`/api/v1/resources/${resolvedParams.id}`)
        if (!response.ok) throw new Error('Recurso não encontrado')
        const data = await response.json()
        setResource(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar recurso')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResource()
  }, [params])

  const handleDownload = useCallback(
    async (file: { id: string; name: string }) => {
      if (!resource) return

      try {
        setDownloadFeedback(null)
        setDownloadingFileId(file.id)
        const response = await fetch(`/api/v1/resources/${resource.id}/files/${file.id}/download`)

        if (response.status === 401) {
          setDownloadFeedback({
            type: 'error',
            text: 'Sessão expirada. Faça login novamente para baixar este recurso.',
          })
          return
        }

        if (response.status === 403) {
          setDownloadFeedback({
            type: 'error',
            text: 'Acesso negado. Você não possui permissão para este arquivo.',
          })
          return
        }

        if (response.status === 429) {
          setDownloadFeedback({
            type: 'error',
            text: 'Muitas tentativas. Aguarde alguns instantes e tente novamente.',
          })
          return
        }

        if (!response.ok) {
          setDownloadFeedback({
            type: 'error',
            text: 'Não foi possível gerar o link de download. Tente novamente.',
          })
          return
        }

        const json = (await response.json()) as {
          data: { downloadUrl?: string }
        }

        if (!json.data?.downloadUrl) {
          setDownloadFeedback({
            type: 'error',
            text: 'Recebemos uma resposta sem URL válida.',
          })
          return
        }

        window.open(json.data.downloadUrl, '_blank', 'noopener,noreferrer')
        setDownloadFeedback({
          type: 'info',
          text: 'Download iniciado. Caso não veja o arquivo, verifique o bloqueio de pop-ups.',
        })
      } catch (err) {
        console.error('Erro ao efetuar download:', err)
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
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Carregando material...</p>
        </div>
      </div>
    )
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
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-destructive font-bold text-lg">{error || 'Recurso não encontrado'}</p>
          <Button asChild variant="outline" className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5">
            <Link href="/resources">Explorar outros materiais</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-6 sm:py-10">
      {/* Voltar */}
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Voltar para Galeria
      </Link>

      {/* Imagens do Recurso */}
      <div className="space-y-4">
        {resource.images && resource.images.length > 0 ? (
          <ResourceImageCarousel
            images={resource.images}
            title={resource.title}
            autoplay={true}
            loop={true}
          />
        ) : resource.thumbUrl ? (
          <div className="overflow-hidden rounded-2xl bg-muted border border-border/50">
            <AspectRatio ratio={1 / 1}>
              <LazyImage
                src={resource.thumbUrl}
                alt={resource.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </AspectRatio>
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted border border-dashed border-border/50">
            <div className="text-center space-y-2">
              <span className="text-3xl">🖼️</span>
              <p className="text-sm font-medium text-muted-foreground/60">Sem imagem disponível</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Título e Tags */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-black text-foreground leading-tight tracking-tight italic">
            {resource.title}
          </h1>

          <div className="flex flex-wrap gap-2">
            <BadgeEducationLevel level={resource.educationLevel} />
            <BadgeSubject subject={resource.subject} />
          </div>
        </div>

        {/* Descrição */}
        {resource.description && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm sm:text-base font-medium text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
              {resource.description}
            </p>
          </div>
        )}

        {/* Downloads */}
        {resource.files && resource.files.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arquivos para Download</h2>
            <DownloadList
              items={resource.files}
              onDownload={handleDownload}
              loadingItemId={downloadingFileId}
              canDownload={resource.hasAccess}
              onUnlock={() => {
                window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
              }}
            />
          </div>
        )}

        {downloadFeedback && (
          <div
            className={`rounded-2xl border p-4 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${downloadFeedback.type === 'error'
              ? 'border-destructive/20 bg-destructive/5 text-destructive'
              : 'border-primary/20 bg-primary/5 text-primary'
              }`}
          >
            <span className="text-lg">{downloadFeedback.type === 'error' ? '❌' : 'ℹ️'}</span>
            {downloadFeedback.text}
          </div>
        )}
      </div>
    </div>
  )
}
