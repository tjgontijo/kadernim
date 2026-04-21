'use client'

import Link from 'next/link'
import { ArrowRight, Download, FileText, Trophy } from 'lucide-react'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { BadgeEducationLevel } from '@/components/dashboard/resources/BadgeEducationLevel'
import { BadgeSubject } from '@/components/dashboard/resources/BadgeSubject'
import { LazyImage } from '@/components/shared/lazy-image'
import { useResourceHighlightsQuery } from '@/hooks/resources/use-resources'

const TOP_LIMIT = 10

function formatDownloadsLabel(downloads: number) {
  if (downloads === 0) return 'sem downloads recentes'
  return `${downloads} ${downloads === 1 ? 'download recente' : 'downloads recentes'}`
}

function getRankTone(rank: number) {
  if (rank === 1) {
    return {
      number: 'text-mustard',
      border: 'border-l-mustard',
      badge: 'bg-mustard-2 text-ink border-mustard/40',
    }
  }

  if (rank === 2) {
    return {
      number: 'text-sage',
      border: 'border-l-sage',
      badge: 'bg-sage-2 text-sage border-sage/30',
    }
  }

  if (rank === 3) {
    return {
      number: 'text-terracotta',
      border: 'border-l-terracotta',
      badge: 'bg-terracotta-2 text-terracotta border-terracotta/30',
    }
  }

  return {
    number: 'text-ink-soft',
    border: 'border-l-line',
    badge: 'bg-paper-2 text-ink-soft border-line',
  }
}

function getProgress(downloads: number, topDownloads: number) {
  if (topDownloads === 0 || downloads === 0) return 0
  return Math.max(8, Math.round((downloads / topDownloads) * 100))
}

function RankingRowsSkeleton() {
  return (
    <div className="overflow-hidden rounded-4 border border-line bg-surface-card shadow-1">
      {Array.from({ length: TOP_LIMIT }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-dashed border-line px-4 py-4 last:border-b-0">
          <div className="h-12 w-14 animate-pulse rounded-3 bg-paper-2" />
          <div className="h-16 w-12 animate-pulse rounded-3 bg-paper-2" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-4 w-2/5 animate-pulse rounded bg-paper-2" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-paper-2" />
            <div className="h-2 w-full animate-pulse rounded bg-paper-2" />
          </div>
          <div className="h-7 w-24 animate-pulse rounded-full bg-paper-2" />
        </div>
      ))}
    </div>
  )
}

export default function HighlightsPage() {
  const { data, isLoading } = useResourceHighlightsQuery()
  const items = (data?.data ?? []).slice(0, TOP_LIMIT)
  const windowDays = data?.meta.windowDays ?? 30
  const topDownloads = Math.max(...items.map((item) => item.recentDownloads), 0)

  return (
    <PageScaffold>
      <PageScaffold.Highlight>
        <div className="overflow-hidden rounded-4 border border-line bg-ink text-paper shadow-2">
          <div className="grid gap-4 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,oklch(1_0_0_/_0.08)_31px,oklch(1_0_0_/_0.08)_32px)] px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-6">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-paper/60">
                <Trophy className="h-4 w-4 text-mustard" />
                Ranking da biblioteca
              </div>
              <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                Os 10 materiais mais acessados agora
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:w-[260px]">
              <div className="rounded-3 border border-paper/15 bg-paper/10 px-3 py-2">
                <div className="font-display text-2xl leading-none text-mustard">{TOP_LIMIT}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-paper/60">posições</div>
              </div>
              <div className="rounded-3 border border-paper/15 bg-paper/10 px-3 py-2">
                <div className="font-display text-2xl leading-none text-mustard">{windowDays}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-paper/60">dias</div>
              </div>
            </div>
          </div>
        </div>
      </PageScaffold.Highlight>

      <section className="px-4 sm:px-0 min-h-[360px]">
        {isLoading ? (
          <RankingRowsSkeleton />
        ) : items.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <p className="text-foreground/60 font-medium">
              Nenhum material disponível para montar o ranking.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-4 border border-line bg-surface-card shadow-1">
            {items.map((item) => (
              <Link key={item.id} href={`/resources/${item.id}`} className="group block border-b border-dashed border-line last:border-b-0">
                <article className={`border-l-4 ${getRankTone(item.rank).border} px-3 py-3 transition-colors group-hover:bg-paper-2/50 sm:px-4 sm:py-4`}>
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex w-14 shrink-0 flex-col items-center">
                      <span className={`font-display text-3xl font-semibold leading-none ${getRankTone(item.rank).number}`}>
                        {String(item.rank).padStart(2, '0')}
                      </span>
                      {item.rank <= 3 && (
                        <span className={`mt-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${getRankTone(item.rank).badge}`}>
                          Top {item.rank}
                        </span>
                      )}
                    </div>

                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-3 border border-line-soft bg-paper-2">
                      {item.thumbUrl ? (
                        <LazyImage
                          src={item.thumbUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(-45deg,transparent_0,transparent_10px,oklch(0.88_0.02_75_/_0.55)_10px,oklch(0.88_0.02_75_/_0.55)_11px)]">
                          <FileText className="h-6 w-6 text-ink-mute" strokeWidth={1.6} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="line-clamp-2 font-display text-lg font-semibold leading-tight text-ink sm:line-clamp-1 sm:text-xl">
                          {item.title}
                        </h2>
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft sm:line-clamp-1">
                        {item.description || 'Sem descrição'}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <BadgeEducationLevel level={item.educationLevel} />
                        <BadgeSubject
                          subject={item.subject}
                          color={item.subjectColor}
                          textColor={item.subjectTextColor}
                        />
                      </div>
                    </div>

                    <div className="hidden w-40 shrink-0 sm:block">
                      <div className="mb-2 flex items-center justify-end gap-2 text-sm font-semibold text-ink">
                        <Download className="h-4 w-4 text-terracotta" />
                        {formatDownloadsLabel(item.recentDownloads)}
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-paper-2">
                        <div
                          className="h-full rounded-full bg-terracotta transition-all"
                          style={{ width: `${getProgress(item.recentDownloads, topDownloads)}%` }}
                        />
                      </div>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5 sm:mt-0" />
                  </div>

                  <div className="mt-3 flex items-center gap-2 pl-[5.25rem] text-xs font-semibold text-ink sm:hidden">
                    <Download className="h-4 w-4 text-terracotta" />
                    <span>{formatDownloadsLabel(item.recentDownloads)}</span>
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-paper-2">
                      <div
                        className="h-full rounded-full bg-terracotta"
                        style={{ width: `${getProgress(item.recentDownloads, topDownloads)}%` }}
                      />
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {items.length < TOP_LIMIT && (
              <div className="border-t border-dashed border-line bg-paper-2/60 px-4 py-3 text-sm text-ink-mute">
                Mostrando {items.length} materiais disponíveis no catálogo.
              </div>
            )}
          </div>
        )}
      </section>
    </PageScaffold>
  )
}
