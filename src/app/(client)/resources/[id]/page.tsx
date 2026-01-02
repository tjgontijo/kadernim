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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'

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
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="space-y-4">
        <Link href="/resources">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error || 'Recurso não encontrado'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Voltar */}
      <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {/* Carrossel de Imagens */}
      <div className="overflow-hidden rounded-xl bg-gray-100">
        <AspectRatio ratio={16 / 9}>
          {resource.images && resource.images.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {resource.images.map((img) => (
                  <CarouselItem key={img.id} className="relative w-full h-full aspect-video">
                    <Image
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_limit,w_1200,q_auto,f_auto/${img.cloudinaryPublicId}`}
                      alt={img.alt || resource.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : resource.thumbUrl ? (
            <Image
              src={resource.thumbUrl}
              alt={resource.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <BadgeEducationLevel level={resource.educationLevel} />
        <BadgeSubject subject={resource.subject} />
      </div>

      {/* Descrição */}
      {resource.description && (
        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
          {resource.description}
        </p>
      )}

      {/* Downloads */}
      {resource.files && resource.files.length > 0 && (
        <DownloadList
          items={resource.files}
          onDownload={handleDownload}
          loadingItemId={downloadingFileId}
          canDownload={resource.hasAccess}
          onUnlock={() => {
            window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
          }}
        />
      )}

      {downloadFeedback && (
        <div
          className={`rounded-md border p-3 text-sm ${downloadFeedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}
        >
          {downloadFeedback.text}
        </div>
      )}
    </div>
  )
}
