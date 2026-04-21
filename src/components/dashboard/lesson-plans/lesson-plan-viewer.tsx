'use client'

import { Calendar, Clock3, Download, FileText, Archive, ArchiveRestore } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { LessonPlanRecord } from '@/lib/lesson-plans/schemas'
import { Button } from '@/components/ui/button'
import { useDownloadFile } from '@/hooks/utils/use-download-file'

interface LessonPlanViewerProps {
  plan: LessonPlanRecord
  onToggleArchive?: (archived: boolean) => void
  isArchiving?: boolean
}

function modeLabel(mode: LessonPlanRecord['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisão'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliação diagnóstica'
  return 'Tarefa'
}

export function LessonPlanViewer({ plan, onToggleArchive, isArchiving = false }: LessonPlanViewerProps) {
  const { downloadFile, downloading } = useDownloadFile()
  const content = plan.content
  const snapshot = plan.sourceSnapshot
  const createdAt = format(new Date(plan.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  const isArchived = Boolean(plan.archivedAt)

  const handleCopy = async () => {
    const sections = [
      `Plano de aula: ${plan.title}`,
      `Recurso: ${snapshot.title}`,
      `Disciplina: ${snapshot.subject.name}`,
      `Etapa: ${snapshot.educationLevel.name}`,
      `Série: ${snapshot.grades.map((grade) => grade.name).join(', ') || 'Nao informada'}`,
      '',
      `Visão geral: ${content.overview}`,
      `Objetivo: ${content.objective}`,
      '',
      'BNCC:',
      ...content.bncc.map((skill) => `${skill.code} - ${skill.description}`),
      '',
      'Materiais:',
      ...content.materials.map((item) => `- ${item}`),
    ]

    await navigator.clipboard.writeText(sections.join('\n'))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4 border border-line bg-card shadow-1 p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="font-display text-3xl leading-tight text-ink">{plan.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-ink-mute">
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => downloadFile(`/api/v1/planner/${plan.id}/export/pdf`, { filename: `${plan.title}.pdf` })}
              disabled={downloading !== null}
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => downloadFile(`/api/v1/planner/${plan.id}/export/docx`, { filename: `${plan.title}.docx` })}
              disabled={downloading !== null}
            >
              <Download className="h-4 w-4" />
              DOCX
            </Button>
            <Button variant="outline" className="rounded-full" onClick={handleCopy}>
              Copiar texto
            </Button>
            {onToggleArchive && (
              <Button
                variant="outline"
                className="rounded-full"
                disabled={isArchiving}
                onClick={() => onToggleArchive(!isArchived)}
              >
                {isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {isArchived ? 'Desarquivar' : 'Arquivar'}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-4 border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-mute">Recurso de origem</p>
          <p className="mt-1 font-display text-xl text-ink">{snapshot.title}</p>
          <p className="mt-2 text-sm text-ink-soft">{snapshot.description || 'Sem descrição'}</p>
        </div>
        <div className="rounded-4 border border-line bg-card p-5">
          <p className="text-xs uppercase tracking-[0.12em] font-semibold text-ink-mute">Contexto</p>
          <p className="mt-1 text-sm text-ink"><strong>Etapa:</strong> {snapshot.educationLevel.name}</p>
          <p className="mt-1 text-sm text-ink"><strong>Série:</strong> {snapshot.grades.map((grade) => grade.name).join(', ') || 'Nao informada'}</p>
          <p className="mt-1 text-sm text-ink"><strong>Disciplina:</strong> {snapshot.subject.name}</p>
        </div>
      </section>

      <section className="rounded-4 border border-line bg-card p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl text-ink">Visão geral</h2>
          <p className="mt-2 text-sm text-ink-soft">{content.overview}</p>
          <p className="mt-2 text-sm text-ink">{content.objective}</p>
        </div>

        <div>
          <h3 className="font-semibold text-ink">BNCC</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {content.bncc.map((skill) => (
              <li key={skill.code}>{skill.code} - {skill.description}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold text-ink">Materiais</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {content.materials.map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink">Preparação</h3>
            <ul className="mt-2 space-y-1 text-sm text-ink-soft">
              {content.preparation.map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-4 border border-line bg-card p-6">
        <h2 className="font-display text-xl text-ink mb-4">Desenvolvimento da aula</h2>
        <div className="space-y-4">
          {content.flow.map((step, index) => (
            <article key={`${step.title}-${index}`} className="rounded-3 border border-line bg-paper-2 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-mute">{step.durationMinutes} min</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-ink-mute">Professora</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {step.teacherActions.map((item, itemIndex) => (
                      <li key={`${item}-${itemIndex}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.1em] text-ink-mute">Alunos</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                    {step.studentActions.map((item, itemIndex) => (
                      <li key={`${item}-${itemIndex}`}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-4 border border-line bg-card p-5">
          <h3 className="font-semibold text-ink">Avaliação</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-soft">
            {content.assessment.evidence.map((item, index) => (
              <li key={`${item}-${index}`}>• {item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink"><strong>Pergunta rápida:</strong> {content.assessment.quickCheck}</p>
        </div>
        <div className="rounded-4 border border-line bg-card p-5">
          <h3 className="font-semibold text-ink">Adaptações</h3>
          <p className="mt-2 text-sm text-ink-soft"><strong>Menos tempo:</strong> {content.adaptations.lessTime}</p>
          <p className="mt-2 text-sm text-ink-soft"><strong>Mais desafio:</strong> {content.adaptations.moreDifficulty}</p>
          <p className="mt-2 text-sm text-ink-soft"><strong>Grupo:</strong> {content.adaptations.groupWork}</p>
        </div>
      </section>

      <section className="rounded-4 border border-line bg-card p-5">
        <h3 className="font-semibold text-ink">Observações</h3>
        <p className="mt-2 text-sm text-ink-soft">{plan.teacherNote || content.teacherNotes || 'Sem observações adicionais.'}</p>
      </section>
    </div>
  )
}
