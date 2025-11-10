'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { BadgeEducationLevel } from './BadgeEducationLevel'
import { BadgeSubject } from './BadgeSubject'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
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
  onSubscribe?: () => void
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
  onSubscribe,
}: ResourceCardProps) {
  return (
    <Link href={`/resources/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg pt-0 gap-0 relative">
        <AspectRatio ratio={1 / 1} className="bg-gray-100 relative">
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-2">
            {isFree && <Badge variant="secondary">Gratuito</Badge>}
            {!isFree && hasAccess && <Badge variant="secondary">Liberado</Badge>}
          </div>
          {!hasAccess && (
            <div className="pointer-events-none absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="pointer-events-auto flex flex-col items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">Conteúdo exclusivo</span>
                <Button size="sm" onClick={(e) => { e.preventDefault(); onSubscribe?.() }}>
                  Assinar
                </Button>
              </div>
            </div>
          )}
        </AspectRatio>

        <div className="flex min-h-[160px] flex-col px-6 pb-0 pt-6">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
            {title}
          </h3>

          {description && (
            <>
              <Separator className="my-2" />
              <p className="line-clamp-3 text-sm text-gray-500">{description}</p>
            </>
          )}

          <div className="mt-auto flex flex-wrap gap-2">
            <BadgeEducationLevel level={educationLevel} />
            <BadgeSubject subject={subject} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
