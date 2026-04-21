'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock3, Search, Archive, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { Input } from '@/components/ui/input'
import { fetchLessonPlans } from '@/lib/lesson-plans/api-client'
import type { LessonPlanListItem } from '@/lib/lesson-plans/schemas'

function modeLabel(mode: LessonPlanListItem['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisão'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliação diagnóstica'
  return 'Tarefa'
}

export default function PlannerPage() {
  const [search, setSearch] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['planner-list', showArchived],
    queryFn: () => fetchLessonPlans({ includeArchived: showArchived }),
  })

  const items = useMemo(() => {
    const source = data ?? []
    const normalized = search.trim().toLowerCase()

    if (!normalized) return source

    return source.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalized)
        || (item.sourceResourceTitle ?? '').toLowerCase().includes(normalized)
        || (item.subjectName ?? '').toLowerCase().includes(normalized)
        || (item.gradeName ?? '').toLowerCase().includes(normalized)
      )
    })
  }, [data, search])

  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <PageScaffold.Header
        title="Planejador"
        action={
          <button
            type="button"
            onClick={() => setShowArchived((value) => !value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              showArchived
                ? 'border-sage bg-sage-2 text-sage'
                : 'border-line bg-card text-ink hover:bg-paper-2'
            }`}
          >
            <Archive className="mr-1 inline h-4 w-4" />
            {showArchived ? 'Mostrando arquivados' : 'Mostrar arquivados'}
          </button>
        }
      />

      <PageScaffold.Controls>
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, recurso ou disciplina"
            className="h-11 rounded-3 border-line bg-card pl-9"
          />
        </div>
      </PageScaffold.Controls>

      <section className="px-4 sm:px-0">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-4 border border-line bg-paper-2" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-4 border border-dashed border-line bg-card p-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-ink-mute" />
            <p className="mt-3 text-sm text-ink-soft">Nenhum plano encontrado.</p>
            <p className="mt-1 text-xs text-ink-mute">Crie um plano direto na página de um recurso.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/planner/${item.id}`} className="block rounded-4 border border-line bg-card p-4 shadow-1 transition-colors hover:bg-paper-2/60 sm:p-5">
                <article className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl leading-tight text-ink">{item.title}</h2>
                    <p className="mt-1 text-sm text-ink-soft">{item.sourceResourceTitle || 'Plano sem recurso de origem'}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {item.subjectName && <span className="rounded-full border border-line bg-paper px-3 py-1">{item.subjectName}</span>}
                      {item.gradeName && <span className="rounded-full border border-line bg-paper px-3 py-1">{item.gradeName}</span>}
                      <span className="rounded-full border border-line bg-paper px-3 py-1">{modeLabel(item.mode)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 space-y-1 text-right text-sm text-ink-mute">
                    <div className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {item.durationMinutes} min
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(item.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    {item.archivedAt && (
                      <div className="text-xs font-semibold text-sage">Arquivado</div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageScaffold>
  )
}
