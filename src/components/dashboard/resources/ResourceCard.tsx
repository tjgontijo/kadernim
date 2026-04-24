'use client'

import Link from 'next/link'
import { LazyImage } from '@/components/shared/lazy-image'
import { Lock, Heart, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useToggleFavorite } from '@/hooks/resources/use-resources'
import { toast } from 'sonner'
import { BadgeEducationLevel } from './BadgeEducationLevel'
import { BadgeSubject } from './BadgeSubject'

// Helper to generate consistent pattern based on ID
const getPatternStyle = (id: string) => {
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 4
  const patterns = [
    { backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0, transparent 10px, oklch(0.4 0.1 30) 10px, oklch(0.4 0.1 30) 11px)' },
    { 
      backgroundImage: 'radial-gradient(oklch(0.4 0.1 30) 1px, transparent 0)',
      backgroundSize: '12px 12px'
    },
    { backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 19px, oklch(0.4 0.1 30) 19px, oklch(0.4 0.1 30) 20px)' },
    { 
      backgroundImage: 'linear-gradient(oklch(0.4 0.1 30) 1px, transparent 1px), linear-gradient(90deg, oklch(0.4 0.1 30) 1px, transparent 1px)',
      backgroundSize: '16px 16px'
    }
  ]
  return patterns[index]
}

interface ResourceCardProps {
  id: string
  title: string
  description?: string | null
  thumbUrl?: string | null
  educationLevel: string
  subject: string
  subjectColor?: string | null
  subjectTextColor?: string | null
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
  subjectColor,
  subjectTextColor,
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
        <div className="relative aspect-square bg-paper-2 rounded-4 border border-line-soft overflow-hidden shrink-0">
          {/* Subtle Paper Texture Overlay - Shared by all */}

          {thumbUrl ? (
            <LazyImage
              src={thumbUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-paper-2">
              {/* Dynamic Pattern based on ID */}
              <div 
                className="absolute inset-0 opacity-20 mix-blend-multiply" 
                style={getPatternStyle(id)} 
              />
              
              <div className="relative z-10 bg-paper/90 backdrop-blur-sm border border-line-soft w-full py-6 flex flex-col items-center justify-center px-4 shadow-sm transform -rotate-1">
                <FileText className="w-8 h-8 text-terracotta/40 mb-3" strokeWidth={1.5} />
                <p className="w-full text-center font-display text-sm font-bold leading-tight text-ink line-clamp-3 uppercase tracking-tight">
                  {title}
                </p>
              </div>
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
            <h3 className="line-clamp-2 font-display text-lg font-semibold text-ink leading-tight tracking-tight group-hover:text-terracotta transition-colors min-h-[2.5rem]">
              {title}
            </h3>

            <div 
              className="line-clamp-2 text-body-s min-h-[2.5rem] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: (description || '')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-dashed border-line">
            <div className="flex flex-wrap gap-1.5">
              <BadgeEducationLevel level={educationLevel} />
              <BadgeSubject 
                subject={subject} 
                color={subjectColor}
                textColor={subjectTextColor}
              />
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
