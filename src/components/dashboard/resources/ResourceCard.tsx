'use client'

import Link from 'next/link'
import { LazyImage } from '@/components/shared/lazy-image'
import { Lock, Heart, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToggleFavorite } from '@/hooks/resources/use-resources'
import { toast } from 'sonner'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { BadgeEducationLevel } from './BadgeEducationLevel'
import { BadgeSubject } from './BadgeSubject'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface ResourceCardProps {
  id: string
  title: string
  description?: string | null
  thumbUrl?: string | null
  educationLevel: string
  subject: string
  hasAccess: boolean
  isFavorite?: boolean
}

export function ResourceCard({
  id,
  title,
  description,
  thumbUrl,
  educationLevel,
  subject,
  hasAccess,
  isFavorite = false,
}: ResourceCardProps) {
  const toggleFavorite = useToggleFavorite()

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await toggleFavorite.mutateAsync(id)
      toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos', {
        duration: 2000,
      })
    } catch (error) {
      toast.error('Erro ao salvar favorito')
    }
  }

  return (
    <Link href={`/resources/${id}`} className="block h-full group relative">
      {/* Tape Effect - Exact from ResourceGallery */}
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[100px] h-[24px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-30 opacity-90" />

      <Card className="flex h-full flex-col transition-all hover:shadow-3 border-line bg-card rounded-5 p-[16px]">
        {/* Image Container with Border and Padding */}
        <div className="relative aspect-[4/5] bg-paper-2 rounded-4 border border-line-soft overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-50 z-10" />

          {thumbUrl ? (
            <LazyImage
              src={thumbUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="font-mono text-[11px] text-ink-mute uppercase tracking-widest">Sem imagem</span>
            </div>
          )}

          {!hasAccess && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-paper/60 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2 text-ink text-center px-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper shadow-2 border border-line">
                  <Lock className="h-4 w-4 text-terracotta" aria-hidden="true" />
                </div>
                <span className="font-hand text-lg text-terracotta">Exclusivo</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col pt-5">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 font-display text-lg font-semibold text-ink leading-tight tracking-tight group-hover:text-terracotta transition-colors">
              {title}
            </h3>

            {description && (
              <p className="line-clamp-2 text-body-s">
                {description}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-dashed border-line">
            <div className="flex flex-wrap gap-1.5">
              <BadgeEducationLevel level={educationLevel} />
              <BadgeSubject subject={subject} />
            </div>

            <button
              onClick={handleFavoriteClick}
              className="group/heart p-2 -mr-2 rounded-full hover:bg-terracotta/10 transition-colors"
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart 
                className={`h-5 w-5 transition-all ${
                  isFavorite 
                    ? 'fill-terracotta text-terracotta' 
                    : 'text-ink-mute group-hover/heart:text-terracotta group-hover/heart:scale-110'
                }`} 
              />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
