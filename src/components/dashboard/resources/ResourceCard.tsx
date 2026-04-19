'use client'

import Link from 'next/link'
import { LazyImage } from '@/components/shared/lazy-image'
import { Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
  isFree: boolean
}

export function ResourceCard({
  id,
  title,
  description,
  thumbUrl,
  educationLevel,
  subject,
  hasAccess,
  isFree,
}: ResourceCardProps) {
  return (
    <Link href={`/resources/${id}`} className="block h-full group relative">
      {/* Tape Effect */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-[22px] bg-[oklch(0.88_0.05_82_/_0.85)] shadow-tape border-x border-dashed border-[oklch(0.75_0.06_82_/_0.5)] rotate-[-2deg] z-30" />
      
      <Card className="flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-3 border-line bg-surface-card rounded-2xl p-0">
        <div className="relative overflow-hidden bg-paper-2 shrink-0 border-b border-line">
          <AspectRatio ratio={1 / 1}>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-50" />
            
            {thumbUrl ? (
              <LazyImage
                src={thumbUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-mono text-[11px] text-ink-mute uppercase tracking-widest">Sem imagem</span>
              </div>
            )}

            {isFree && (
              <div className="absolute left-3 top-3 z-20">
                <Badge variant="new">
                  Gratuito
                </Badge>
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
          </AspectRatio>
        </div>

        <div className="flex flex-1 flex-col p-5">
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

          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-line">
            <BadgeEducationLevel level={educationLevel} />
            <BadgeSubject subject={subject} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
