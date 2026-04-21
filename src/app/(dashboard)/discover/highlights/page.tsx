'use client'

import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { ResourceCard } from '@/components/dashboard/resources/ResourceCard'
import { ResourceCardSkeleton } from '@/components/dashboard/shared/skeletons/resource-card-skeleton'
import { useResourceHighlightsQuery } from '@/hooks/resources/use-resources'

function formatDownloadsLabel(downloads: number) {
  return `${downloads} ${downloads === 1 ? 'download' : 'downloads'}`
}

export default function HighlightsPage() {
  const { data, isLoading } = useResourceHighlightsQuery()
  const items = data?.data ?? []
  const windowDays = data?.meta.windowDays ?? 30

  return (
    <PageScaffold>
      <PageScaffold.Header
        title={<>Destaques <span className="text-primary italic">em alta</span></>}
      />

      <PageScaffold.Highlight>
        <div className="rounded-4 border border-line bg-card px-4 py-3 text-sm text-ink-soft">
          Ranking dos 10 materiais mais populares dos últimos {windowDays} dias.
        </div>
      </PageScaffold.Highlight>

      <section className="px-4 sm:px-0 min-h-[360px]">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ResourceCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-foreground/60 font-medium">
              Ainda não há materiais com downloads nos últimos {windowDays} dias.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-bold text-ink">
                    #{item.rank}
                  </span>
                  <span className="text-xs font-medium text-ink-mute">
                    {formatDownloadsLabel(item.recentDownloads)}
                  </span>
                </div>
                <ResourceCard
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  thumbUrl={item.thumbUrl}
                  educationLevel={item.educationLevel}
                  subject={item.subject}
                  subjectColor={item.subjectColor}
                  subjectTextColor={item.subjectTextColor}
                  hasAccess={item.hasAccess}
                  isFavorite={item.isFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </PageScaffold>
  )
}
