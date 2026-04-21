'use client'

import Link from 'next/link'
import { Lock, ArrowRight } from 'lucide-react'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { useResourceHighlightsQuery } from '@/hooks/resources/use-resources'

function formatDownloadsLabel(downloads: number) {
  return `${downloads} ${downloads === 1 ? 'download' : 'downloads'}`
}

function getRankClass(rank: number) {
  if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300'
  if (rank === 2) return 'bg-slate-100 text-slate-700 border-slate-300'
  if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
  return 'bg-paper-2 text-ink border-line'
}

function RankingRowsSkeleton() {
  return (
    <div className="rounded-4 border border-line bg-card">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-dashed border-line px-4 py-4 last:border-b-0">
          <div className="h-8 w-11 animate-pulse rounded-full bg-paper-2" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded bg-paper-2" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-paper-2" />
          </div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-paper-2" />
        </div>
      ))}
    </div>
  )
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
          <RankingRowsSkeleton />
        ) : items.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-foreground/60 font-medium">
              Ainda não há materiais com downloads nos últimos {windowDays} dias.
            </p>
          </div>
        ) : (
          <div className="rounded-4 border border-line bg-card">
            <div className="hidden items-center gap-4 border-b border-dashed border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-mute sm:flex">
              <div className="w-12">Posição</div>
              <div className="min-w-0 flex-1">Material</div>
              <div className="w-28 text-right">Popularidade</div>
            </div>

            {items.map((item) => (
              <Link
                key={item.id}
                href={`/resources/${item.id}`}
                className="group flex items-center gap-3 border-b border-dashed border-line px-3 py-3 transition-colors hover:bg-paper-2/50 sm:gap-4 sm:px-4 sm:py-4 last:border-b-0"
              >
                <div className={`inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-black ${getRankClass(item.rank)}`}>
                  #{item.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="line-clamp-1 text-sm font-bold text-ink sm:text-base">
                      {item.title}
                    </h2>
                    {!item.hasAccess && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper text-terracotta border border-line-soft">
                        <Lock className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-ink-soft sm:text-sm">
                    {item.description || 'Sem descrição'}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-ink-mute sm:text-xs">
                    <span className="rounded-full border border-line bg-paper px-2 py-0.5">
                      {item.educationLevel}
                    </span>
                    <span className="rounded-full border border-line bg-paper px-2 py-0.5">
                      {item.subject}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:w-28 sm:justify-end">
                  <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink sm:text-xs">
                    {formatDownloadsLabel(item.recentDownloads)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-ink-mute transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageScaffold>
  )
}
