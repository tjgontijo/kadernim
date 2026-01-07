'use client'

import Link from 'next/link'
import { LazyImage } from '@/components/ui/lazy-image'
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
    <Link href={`/resources/${id}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden transition-all hover:shadow-xl border-border/50 bg-card rounded-3xl p-3">
        <div className="relative overflow-hidden rounded-2xl bg-muted shrink-0">
          <AspectRatio ratio={1 / 1}>
            {thumbUrl ? (
              <LazyImage
                src={thumbUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-wider">Sem imagem</span>
              </div>
            )}

            {isFree && (
              <div className="absolute left-2 top-2 z-20">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-md shadow-sm border-none text-[10px] h-5 font-black uppercase text-foreground">
                  Gratuito
                </Badge>
              </div>
            )}

            {!hasAccess && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-2 text-foreground/80 text-center px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg border border-border">
                    <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Assinante</span>
                </div>
              </div>
            )}
          </AspectRatio>
        </div>

        <div className="flex flex-1 flex-col px-3 py-5 pb-2">
          <div className="flex-1 space-y-2.5">
            <h3 className="line-clamp-2 text-sm font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase tracking-tight italic">
              {title}
            </h3>

            {description && (
              <p className="line-clamp-2 text-[11px] font-medium text-muted-foreground leading-relaxed italic opacity-80">
                {description}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-border/40">
            <BadgeEducationLevel level={educationLevel} />
            <BadgeSubject subject={subject} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
