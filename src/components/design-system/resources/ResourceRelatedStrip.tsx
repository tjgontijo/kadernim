'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LazyImage } from '@/components/shared/lazy-image'
import { BadgeEducationLevel } from '@/components/dashboard/resources/BadgeEducationLevel'
import { BadgeSubject } from '@/components/dashboard/resources/BadgeSubject'

interface RelatedResource {
  id: string
  title: string
  thumbUrl: string | null
  subject: string
  educationLevel: string
}

interface ResourceRelatedStripProps {
  resourceId: string
  subject: string
}

export function ResourceRelatedStrip({ resourceId }: ResourceRelatedStripProps) {
  const [items, setItems] = useState<RelatedResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch(`/api/v1/resources/${resourceId}/related`)
        const json = await res.json()
        if (json.data) setItems(json.data)
      } catch (err) {
        console.error('Failed to load related', err)
      } finally {
        setLoading(false)
      }
    }
    loadRelated()
  }, [resourceId])

  if (!loading && items.length === 0) return null

  return (
    <section className="mt-[56px] pt-[40px] border-t border-dashed border-line">
      <div className="flex items-baseline justify-between mb-[20px]">
        <h3 className="font-display font-semibold text-[24px] tracking-[-0.01em] text-ink">
          Combina com esta aula
        </h3>
        <span className="font-hand text-[18px] text-terracotta">~ escolhidas a dedo</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="relative h-full">
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 -rotate-2 w-[86px] h-[22px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-20 opacity-90" />

              <Card className="flex h-full flex-col border-line bg-card rounded-5 p-[14px] shadow-1">
                <div className="relative aspect-[4/5] bg-paper-2 rounded-4 border border-line-soft overflow-hidden shrink-0">
                  <Skeleton className="h-full w-full rounded-none" />
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-30 z-10" />
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-[90%]" />
                    <Skeleton className="h-5 w-[65%]" />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-line">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {items.map((item) => (
            <Link key={item.id} href={`/resources/${item.id}`} className="block h-full group relative">
              <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 -rotate-2 w-[86px] h-[22px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-20 opacity-90" />

              <Card className="flex h-full flex-col border-line bg-card rounded-5 p-[14px] shadow-1 hover:shadow-3 transition-shadow">
                <div className="relative aspect-[4/5] bg-paper-2 rounded-4 border border-line-soft overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)] opacity-35 z-10" />

                  {item.thumbUrl ? (
                    <LazyImage
                      src={item.thumbUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-mono text-[10px] text-ink-mute uppercase tracking-[0.12em] font-bold">Sem imagem</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col pt-4">
                  <h4 className="line-clamp-2 font-display text-[16px] font-semibold text-ink leading-tight tracking-tight group-hover:text-terracotta transition-colors">
                    {item.title}
                  </h4>

                  <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-line">
                    <BadgeEducationLevel level={item.educationLevel} />
                    <BadgeSubject subject={item.subject} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
