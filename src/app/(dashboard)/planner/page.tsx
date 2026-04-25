'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock3, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { fetchLessonPlans } from '@/lib/lesson-plans/api-client'
import type { LessonPlanListItem } from '@/lib/lesson-plans/schemas'
import { PlannerFilters, type PlannerFiltersValue } from '@/components/dashboard/planner/planner-filters'

function modeLabel(mode: LessonPlanListItem['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisão'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliação diagnóstica'
  return 'Tarefa'
}

export default function PlannerPage() {
  const [filters, setFilters] = useState<PlannerFiltersValue>({})

  const { data, isLoading } = useQuery({
    queryKey: ['planner-list', filters],
    queryFn: () => fetchLessonPlans({
      q: filters.q,
      educationLevel: filters.educationLevel,
      grade: filters.grade,
      subject: filters.subject,
    }),
  })

  const items = useMemo(() => data ?? [], [data])

  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <PageScaffold.Header title="Planos de Aula" />

      <PageScaffold.Controls>
        <PlannerFilters value={filters} onChange={setFilters} />
      </PageScaffold.Controls>

      <section className="px-0">
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
