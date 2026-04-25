'use client'

import { Calendar, Clock3, Download, FileText, Copy, CheckCircle2, Target, ClipboardList, BookMarked, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { LessonPlanRecord } from '@/lib/lesson-plans/schemas'
import { Button } from '@/components/ui/button'
import { useDownloadFile } from '@/hooks/utils/use-download-file'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'

interface LessonPlanViewerProps {
  plan: LessonPlanRecord
  onDelete?: () => void
  isDeleting?: boolean
}

function modeLabel(mode: LessonPlanRecord['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisão'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliação diagnóstica'
  return 'Tarefa'
}

function formatStepIds(plan: LessonPlanRecord, ids: string[]) {
  if (ids.length === 0) return []

  const byId = new Map(plan.sourceSnapshot.steps.map((step) => [step.id, step.title]))
  return ids
    .map((id) => byId.get(id))
    .filter((title): title is string => Boolean(title))
}

export function LessonPlanViewer({ plan, onDelete, isDeleting = false }: LessonPlanViewerProps) {
  const { downloadFile, downloading } = useDownloadFile()
  const content = plan.content
  const snapshot = plan.sourceSnapshot
  const createdAt = format(new Date(plan.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const totalFlowMinutes = content.flow.reduce((total, step) => total + step.durationMinutes, 0)

  const handleCopy = async () => {
    const sections = [
      `Título: ${plan.title}`,
      `Recurso: ${snapshot.title}`,
      `Disciplina: ${snapshot.subject.name}`,
      `Etapa: ${snapshot.educationLevel.name}`,
      `Série: ${snapshot.grades.map((grade) => grade.name).join(', ') || 'Não informada'}`,
      '',
      `Visão geral: ${content.overview}`,
      `Objetivo: ${content.objective}`,
      '',
      'BNCC:',
      ...content.bncc.map((skill) => `${skill.code} - ${skill.description}`),
      '',
      'Materiais:',
      ...content.materials.map((item) => `- ${item}`),
      '',
      'Fluxo:',
      ...content.flow.map((step, index) => `${index + 1}. ${step.title} (${step.durationMinutes} min)`),
    ]

    await navigator.clipboard.writeText(sections.join('\n'))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4 border border-line bg-card p-4 shadow-1 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-mute">
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-2 px-3 py-1 font-semibold uppercase tracking-[0.12em]">
              Plano de aula
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-2 px-3 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {createdAt}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-2 px-3 py-1">
              <Clock3 className="h-3.5 w-3.5" />
              {plan.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper-2 px-3 py-1">
              <FileText className="h-3.5 w-3.5" />
              {modeLabel(plan.mode)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => downloadFile(`/api/v1/planner/${plan.id}/export/pdf`, { filename: `${plan.title}.pdf` })}
              disabled={downloading !== null}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => downloadFile(`/api/v1/planner/${plan.id}/export/docx`, { filename: `${plan.title}.docx` })}
              disabled={downloading !== null}
            >
              <Download className="h-4 w-4" />
              DOCX
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            {onDelete && (
              <DeleteConfirmDialog
                onConfirm={onDelete}
                isLoading={isDeleting}
                title="Excluir plano de aula?"
                description="Essa ação é permanente e remove este plano de aula do banco de dados."
                confirmText="Excluir permanentemente"
                trigger={
                  <Button variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10">
                    Excluir
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </section>

      <article className="paper-grain rounded-4 border border-line bg-card shadow-2 overflow-hidden">
        <div className="h-1.5 w-full bg-terracotta" />

        <header className="relative border-b border-line px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-mute">Planejamento pedagógico</p>
          <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {plan.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft">
            Plano criado a partir do recurso <strong className="text-ink">{snapshot.title}</strong> para apoio prático em sala de aula.
          </p>
        </header>

        <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
          <section>
            <div className="mb-4 flex items-center gap-3 border-b border-dashed border-line pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">1</div>
              <h2 className="font-display text-2xl text-ink">Contexto</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3 border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Etapa</p>
                <p className="mt-1 text-sm font-semibold text-ink">{snapshot.educationLevel.name}</p>
              </div>
              <div className="rounded-3 border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Série</p>
                <p className="mt-1 text-sm font-semibold text-ink">{snapshot.grades.map((grade) => grade.name).join(', ') || 'Não informada'}</p>
              </div>
              <div className="rounded-3 border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Disciplina</p>
                <p className="mt-1 text-sm font-semibold text-ink">{snapshot.subject.name}</p>
              </div>
              <div className="rounded-3 border border-line bg-paper p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Tempo total</p>
                <p className="mt-1 text-sm font-semibold text-ink">{totalFlowMinutes} minutos</p>
              </div>
            </div>

            <div className="mt-4 rounded-3 border border-line bg-surface-card p-4">
              <div className="mb-2 flex items-center gap-2 text-ink">
                <Target className="h-4 w-4 text-terracotta" />
                <h3 className="font-semibold">Objetivo</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{content.objective}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{content.overview}</p>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3 border-b border-dashed border-line pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">2</div>
              <h2 className="font-display text-2xl text-ink">BNCC e Preparação</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3 border border-line bg-surface-card p-4">
                <div className="mb-3 flex items-center gap-2 text-ink">
                  <BookMarked className="h-4 w-4 text-terracotta" />
                  <h3 className="font-semibold">Habilidades BNCC</h3>
                </div>
                <ul className="space-y-2">
                  {content.bncc.map((skill) => (
                    <li key={skill.code} className="rounded-2 border border-line bg-paper p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-terracotta">{skill.code}</p>
                      <p className="mt-1 text-sm text-ink-soft">{skill.description}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <div className="rounded-3 border border-line bg-surface-card p-4">
                  <h3 className="font-semibold text-ink">Materiais</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                    {content.materials.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3 border border-line bg-surface-card p-4">
                  <h3 className="font-semibold text-ink">Preparação prévia</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                    {content.preparation.map((item, index) => (
                      <li key={`${item}-${index}`} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sage" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-3 border-b border-dashed border-line pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white">3</div>
              <h2 className="font-display text-2xl text-ink">Desenvolvimento da Aula</h2>
            </div>

            <div className="space-y-4">
              {content.flow.map((step, index) => {
                const linkedStepTitles = formatStepIds(plan, step.useResourceStepIds)

                return (
                  <article key={`${step.title}-${index}`} className="rounded-3 border border-line bg-paper p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line pb-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-mute">Etapa {index + 1}</p>
                        <h3 className="mt-1 text-base font-semibold text-ink">{step.title}</h3>
                      </div>
                      <span className="rounded-full border border-line bg-surface-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-mute">
                        {step.durationMinutes} min
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Ações da professora</p>
                        <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                          {step.teacherActions.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`} className="flex gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Ações dos alunos</p>
                        <ul className="mt-2 space-y-2 text-sm text-ink-soft">
                          {step.studentActions.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`} className="flex gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {linkedStepTitles.length > 0 && (
                      <div className="mt-4 rounded-2 border border-line bg-surface-card p-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-mute">Base no recurso</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {linkedStepTitles.map((title) => (
                            <span
                              key={title}
                              className="inline-flex rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-ink-soft"
                            >
                              {title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3 border border-line bg-surface-card p-4">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <ClipboardList className="h-4 w-4 text-terracotta" />
                <h3 className="font-semibold">Avaliação</h3>
              </div>
              <ul className="space-y-2 text-sm text-ink-soft">
                {content.assessment.evidence.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2 border border-line bg-paper p-3 text-sm text-ink">
                <strong>Pergunta rápida:</strong> {content.assessment.quickCheck}
              </p>
            </div>

            <div className="rounded-3 border border-line bg-surface-card p-4">
              <div className="mb-3 flex items-center gap-2 text-ink">
                <Sparkles className="h-4 w-4 text-terracotta" />
                <h3 className="font-semibold">Adaptações</h3>
              </div>
              <div className="space-y-3 text-sm text-ink-soft">
                <p><strong className="text-ink">Menos tempo:</strong> {content.adaptations.lessTime}</p>
                <p><strong className="text-ink">Mais desafio:</strong> {content.adaptations.moreDifficulty}</p>
                <p><strong className="text-ink">Trabalho em grupo:</strong> {content.adaptations.groupWork}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3 border border-line bg-paper p-4">
            <h3 className="font-semibold text-ink">Observações da professora</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {plan.teacherNote || content.teacherNotes || 'Sem observações adicionais.'}
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
