// src/components/resources/resource-card.tsx
'use client'

import Image from 'next/image'
import { memo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Loader2, Lock } from 'lucide-react'

interface ResourceCardProps {
  id: string
  title: string
  imageUrl: string
  hasAccess: boolean
  onClick: (id: string) => void
  onMouseEnter?: () => void
  onTouchStart?: () => void
  isLoading?: boolean
}

function ResourceCardComponent({
  id,
  title,
  imageUrl,
  hasAccess,
  onClick,
  onMouseEnter,
  onTouchStart,
  isLoading
}: ResourceCardProps) {
  const handleClick = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (isLoading) return
      onClick(id)
    },
    [id, onClick, isLoading]
  )

  return (
    <Card
      className={`relative overflow-hidden border transition-all hover:shadow-lg cursor-pointer ${
        !hasAccess ? 'opacity-60 hover:opacity-100' : ''
      } ${
        isLoading ? 'pointer-events-none ring-2 ring-primary/40 ring-offset-2 opacity-80' : ''
      }`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      data-loading={isLoading ? 'true' : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div className="relative">
        <AspectRatio ratio={16/9}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className={`object-cover ${
              !hasAccess ? 'opacity-60' : ''
            }`}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
          />
        </AspectRatio>

        {!hasAccess && (
          <div className="absolute top-2 right-2">
            <Badge className="h-7 w-7 p-0 rounded-full flex items-center justify-center bg-black/70 hover:bg-black/80 border-0" variant="secondary">
              <Lock className="h-5 w-5" />
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="space-y-3 p-4">
        <h3 className="font-semibold text-base text-center leading-tight line-clamp-2">
          {title}
        </h3>
      </CardContent>
    </Card>
  )
}

export const ResourceCard = memo(ResourceCardComponent)