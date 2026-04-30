'use client'

import { useEffect, useRef } from 'react'
import { BookMarked, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BnccSkillListItem } from '@/lib/bncc/schemas/bncc-schemas'

interface BnccSkillListProps {
  items: BnccSkillListItem[]
  onOpenDetails: (id: string) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onLoadMore?: () => void
}

export function BnccSkillList({
  items,
  onOpenDetails,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: BnccSkillListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasNextPage || !onLoadMore) return

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first?.isIntersecting && !isFetchingNextPage) {
        onLoadMore()
      }
    }, { rootMargin: '300px 0px' })

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, onLoadMore, isFetchingNextPage])

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-4 border border-line bg-card p-4 text-left shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.06em] text-terracotta min-w-0">
                <BookMarked className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.code}</span>
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => onOpenDetails(item.id)}
                  aria-label={`Ver detalhe da habilidade ${item.code}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink line-clamp-3 min-h-[66px]">
              {item.description}
            </p>

            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="flex flex-wrap gap-2 text-[11px] text-ink-soft">
                <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                  {item.educationLevel.name}
                </span>
                {item.grade && (
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                    {item.grade.name}
                  </span>
                )}
                {item.subject && (
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1">
                    {item.subject.name}
                  </span>
                )}
              </div>

              {item.relatedResourcesCount > 0 && (
                <span className="text-[11px] text-ink-mute whitespace-nowrap pb-1">
                  {item.relatedResourcesCount} {item.relatedResourcesCount === 1 ? 'material' : 'materiais'}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {hasNextPage && onLoadMore && <div ref={sentinelRef} className="h-1" />}

      {isFetchingNextPage && (
        <div className="pt-2 text-center">
          <span className="inline-flex items-center gap-2 text-sm text-ink-mute">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando mais habilidades...
          </span>
        </div>
      )}
    </section>
  )
}
