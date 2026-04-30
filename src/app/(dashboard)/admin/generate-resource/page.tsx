'use client'

import { useState } from 'react'
import { Loader2, ChevronLeft, Check, BookMarked, Sparkles, Download, RotateCcw } from 'lucide-react'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/index'
import { useEducationLevels, useGrades, useSubjects } from '@/hooks/taxonomy/use-taxonomy'
import { useBnccSkills } from '@/hooks/bncc/use-bncc-skills'
import type { EducationLevel, Grade, Subject } from '@/lib/taxonomy/types'
import type { BnccSkillListItem } from '@/lib/bncc/schemas/bncc-schemas'
import type { ResourceProposal } from '@/mastra/agents/generate-resource/shared/schemas'

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface WizardState {
  educationLevel: EducationLevel | null
  grade: Grade | null
  subject: Subject | null
  skill: BnccSkillListItem | null
  selectedProposal: ResourceProposal | null
  questionCount: number
}

const TOTAL_STEPS = 5
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

// ─── Progress ─────────────────────────────────────────────────────────────────

function Progress({ step, onBack }: { step: Step; onBack: () => void }) {
  const done = step - 1
  return (
    <div className="flex items-center gap-4 mb-10">
      <button
        type="button"
        onClick={onBack}
        disabled={step === 1}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-card text-ink-mute transition-colors hover:border-terracotta/40 hover:text-ink disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-terracotta transition-all duration-500 ease-out"
          style={{ width: `${(done / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums text-ink-mute w-8 text-right">
        {done}/{TOTAL_STEPS}
      </span>
    </div>
  )
}

// ─── Option row ───────────────────────────────────────────────────────────────

function Option({
  index,
  selected,
  onClick,
  children,
}: {
  index: number
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-4 rounded-3 border px-5 py-4 text-left transition-all',
        selected
          ? 'border-terracotta bg-terracotta-2/50 shadow-sm'
          : 'border-line bg-card hover:border-terracotta/40 hover:bg-paper-2',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-black transition-all',
          selected
            ? 'border-terracotta bg-terracotta text-white'
            : 'border-line bg-paper-2 text-ink-mute group-hover:border-terracotta/40 group-hover:text-ink',
        )}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : LETTERS[index]}
      </span>
      <span className={cn('text-sm font-semibold leading-snug', selected ? 'text-ink' : 'text-ink-soft')}>
        {children}
      </span>
    </button>
  )
}

// ─── Skill option ─────────────────────────────────────────────────────────────

function SkillOption({
  index,
  skill,
  selected,
  onClick,
}: {
  index: number
  skill: BnccSkillListItem
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-4 rounded-3 border px-5 py-4 text-left transition-all',
        selected
          ? 'border-terracotta bg-terracotta-2/50 shadow-sm'
          : 'border-line bg-card hover:border-terracotta/40 hover:bg-paper-2',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-black mt-0.5 transition-all',
          selected
            ? 'border-terracotta bg-terracotta text-white'
            : 'border-line bg-paper-2 text-ink-mute group-hover:border-terracotta/40',
        )}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : LETTERS[index] ?? index + 1}
      </span>
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-terracotta mb-1">
          <BookMarked className="h-3 w-3 shrink-0" />
          {skill.code}
        </span>
        <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">{skill.description}</p>
      </div>
    </button>
  )
}

// ─── Proposal card ────────────────────────────────────────────────────────────

function ProposalCard({
  index,
  proposal,
  selected,
  onClick,
}: {
  index: number
  proposal: ResourceProposal
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full flex-col gap-3 rounded-3 border px-5 py-4 text-left transition-all',
        selected
          ? 'border-terracotta bg-terracotta-2/50 shadow-sm'
          : 'border-line bg-card hover:border-terracotta/40 hover:bg-paper-2',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs font-black mt-0.5 transition-all',
            selected
              ? 'border-terracotta bg-terracotta text-white'
              : 'border-line bg-paper-2 text-ink-mute group-hover:border-terracotta/40 group-hover:text-ink',
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : LETTERS[index]}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-bold leading-snug mb-1', selected ? 'text-ink' : 'text-ink-soft')}>
            {proposal.theme}
          </p>
          <span className={cn(
            'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold mb-2',
            selected ? 'bg-terracotta/15 text-terracotta' : 'bg-paper-2 text-ink-mute border border-line',
          )}>
            {proposal.approach}
          </span>
          <p className="text-xs text-ink-mute leading-relaxed">{proposal.summary}</p>
        </div>
      </div>
    </button>
  )
}

// ─── Skeleton list ────────────────────────────────────────────────────────────

function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-3 bg-paper-2" />
      ))}
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepEtapa({ state, onSelect }: { state: WizardState; onSelect: (l: EducationLevel) => void }) {
  const { data: levels = [], isLoading } = useEducationLevels()
  return (
    <>
      <p className="text-2xl font-bold text-ink mb-6">Qual etapa de ensino?</p>
      {isLoading ? <SkeletonList rows={3} /> : (
        <div className="space-y-2">
          {levels.map((level: EducationLevel, i) => (
            <Option key={level.slug} index={i} selected={state.educationLevel?.slug === level.slug} onClick={() => onSelect(level)}>
              {level.name}
            </Option>
          ))}
        </div>
      )}
    </>
  )
}

function StepAno({ state, onSelect }: { state: WizardState; onSelect: (g: Grade) => void }) {
  const { data: grades = [], isLoading } = useGrades(state.educationLevel?.slug)
  return (
    <>
      <p className="text-2xl font-bold text-ink mb-2">Qual ano / faixa?</p>
      <p className="text-sm text-ink-mute mb-6">{state.educationLevel?.name}</p>
      {isLoading ? <SkeletonList rows={5} /> : (
        <div className="space-y-2">
          {grades.map((grade: Grade, i) => (
            <Option key={grade.slug} index={i} selected={state.grade?.slug === grade.slug} onClick={() => onSelect(grade)}>
              {grade.name}
            </Option>
          ))}
        </div>
      )}
    </>
  )
}

function StepComponente({ state, onSelect }: { state: WizardState; onSelect: (s: Subject) => void }) {
  const { data: subjects = [], isLoading } = useSubjects(state.educationLevel?.slug, state.grade?.slug)
  return (
    <>
      <p className="text-2xl font-bold text-ink mb-2">Qual componente curricular?</p>
      <p className="text-sm text-ink-mute mb-6">{state.educationLevel?.name} · {state.grade?.name}</p>
      {isLoading ? <SkeletonList rows={4} /> : subjects.length === 0
        ? <p className="text-sm text-ink-mute">Nenhum componente disponível.</p>
        : (
          <div className="space-y-2">
            {subjects.map((subject: Subject, i) => (
              <Option key={subject.slug} index={i} selected={state.subject?.slug === subject.slug} onClick={() => onSelect(subject)}>
                {subject.name}
              </Option>
            ))}
          </div>
        )}
    </>
  )
}

function StepHabilidade({ state, onSelect }: { state: WizardState; onSelect: (s: BnccSkillListItem) => void }) {
  const { items, isLoading } = useBnccSkills({
    educationLevel: state.educationLevel?.slug,
    grades: state.grade ? [state.grade.slug] : undefined,
    subject: state.subject?.slug,
  }, 60)

  return (
    <>
      <div className="flex items-baseline gap-3 mb-2">
        <p className="text-2xl font-bold text-ink">Qual habilidade BNCC?</p>
        {!isLoading && items.length > 0 && (
          <span className="text-sm text-ink-mute">{items.length} habilidades</span>
        )}
      </div>
      <p className="text-sm text-ink-mute mb-6">
        {state.subject?.name} · {state.grade?.name}
      </p>
      {isLoading ? <SkeletonList rows={6} /> : items.length === 0
        ? <p className="text-sm text-ink-mute">Nenhuma habilidade encontrada.</p>
        : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {items.map((skill, i) => (
              <SkillOption key={skill.id} index={i} skill={skill} selected={state.skill?.id === skill.id} onClick={() => onSelect(skill)} />
            ))}
          </div>
        )}
    </>
  )
}

function StepProposta({
  state,
  proposals,
  loading,
  error,
  onSelect,
}: {
  state: WizardState
  proposals: ResourceProposal[]
  loading: boolean
  error: string | null
  onSelect: (p: ResourceProposal) => void
}) {
  return (
    <>
      <p className="text-2xl font-bold text-ink mb-2">Qual abordagem para o recurso?</p>
      <p className="text-sm text-ink-mute mb-6">
        <span className="font-mono font-bold text-terracotta">{state.skill?.code}</span>
        {' · '}{state.subject?.name} · {state.grade?.name}
      </p>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-ink-mute">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Gerando propostas…</p>
        </div>
      )}

      {error && (
        <div className="rounded-3 border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>
      )}

      {!loading && !error && proposals.length > 0 && (
        <div className="space-y-3">
          {proposals.map((proposal, i) => (
            <ProposalCard
              key={i}
              index={i}
              proposal={proposal}
              selected={state.selectedProposal?.theme === proposal.theme}
              onClick={() => onSelect(proposal)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function StepGerar({
  state,
  loading,
  error,
  previewHtml,
  onQuestionCountChange,
  onGenerate,
  onReset,
}: {
  state: WizardState
  loading: boolean
  error: string | null
  previewHtml: string | null
  onQuestionCountChange: (n: number) => void
  onGenerate: (f: 'html' | 'pdf') => void
  onReset: () => void
}) {
  const skill = state.skill!
  const proposal = state.selectedProposal!

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-bold text-ink mb-2">Pronto para gerar!</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {[state.educationLevel?.name, state.grade?.name, state.subject?.name].filter(Boolean).map((l) => (
            <span key={l} className="rounded-full border border-line bg-paper-2 px-3 py-1 text-xs font-semibold text-ink-soft">{l}</span>
          ))}
          <span className="rounded-full border border-terracotta/30 bg-terracotta-2/50 px-3 py-1 font-mono text-xs font-bold text-terracotta">
            {skill.code}
          </span>
        </div>
      </div>

      <div className="rounded-3 border border-terracotta/20 bg-terracotta-2/30 p-4 space-y-1">
        <p className="text-xs font-semibold text-terracotta uppercase tracking-wide">{proposal.approach}</p>
        <p className="text-sm font-bold text-ink">{proposal.theme}</p>
        <p className="text-xs text-ink-mute leading-relaxed">{proposal.summary}</p>
      </div>

      <div className="flex items-end gap-4 flex-wrap">
        <div className="space-y-1.5">
          <Label htmlFor="q-count">Questões <span className="font-normal text-ink-mute">(opcional)</span></Label>
          <Input
            id="q-count"
            type="number"
            min={1}
            max={20}
            value={state.questionCount}
            onChange={(e) => onQuestionCountChange(parseInt(e.target.value) || 0)}
            placeholder="Auto"
            className="w-24"
          />
        </div>
        <div className="flex gap-2 pb-0.5">
          <Button onClick={() => onGenerate('html')} disabled={loading} size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Gerando…' : 'Gerar Preview'}
          </Button>
          <Button variant="outline" onClick={() => onGenerate('pdf')} disabled={loading} size="lg">
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-3 border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>
      )}

      {previewHtml && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">Preview</p>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Gerar outra
            </Button>
          </div>
          <div className="rounded-4 border border-line overflow-hidden">
            <iframe srcDoc={previewHtml} className="w-full border-none" style={{ minHeight: 720 }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourceGeneratorPage() {
  const [step, setStep] = useState<Step>(1)
  const [state, setState] = useState<WizardState>({
    educationLevel: null, grade: null, subject: null, skill: null, selectedProposal: null, questionCount: 5,
  })
  const [proposals, setProposals] = useState<ResourceProposal[]>([])
  const [proposalsLoading, setProposalsLoading] = useState(false)
  const [proposalsError, setProposalsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const advance = () => setStep((s) => Math.min(s + 1, 6) as Step)
  const back = () => setStep((s) => Math.max(s - 1, 1) as Step)

  const fetchProposals = async (skill: BnccSkillListItem, questionCount: number) => {
    setProposalsLoading(true)
    setProposalsError(null)
    setProposals([])
    try {
      const res = await fetch('/api/v1/resources/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bnccCode: skill.code, questionCount }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao gerar propostas')
      const d = await res.json()
      if (d.success) setProposals(d.proposals)
      else throw new Error(d.error || 'Erro desconhecido')
    } catch (err) {
      setProposalsError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setProposalsLoading(false)
    }
  }

  const handleGenerate = async (format: 'html' | 'pdf') => {
    if (!state.skill) return
    setLoading(true)
    setError(null)
    setPreviewHtml(null)
    try {
      const res = await fetch('/api/v1/resources/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bnccCode: state.skill.code,
          questionCount: state.questionCount || undefined,
          selectedProposal: state.selectedProposal,
          format,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erro ao gerar')
      if (format === 'pdf') {
        const url = URL.createObjectURL(await res.blob())
        Object.assign(document.createElement('a'), { href: url, download: `recurso_${state.skill.code}.pdf` }).click()
        URL.revokeObjectURL(url)
      } else {
        const d = await res.json()
        if (d.success) setPreviewHtml(d.previewHtml ?? null)
        else setError(d.error ?? 'Erro desconhecido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setState({ educationLevel: null, grade: null, subject: null, skill: null, selectedProposal: null, questionCount: 5 })
    setProposals([])
    setProposalsError(null)
    setPreviewHtml(null)
    setError(null)
  }

  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <PageScaffold.Header title="Gerador de Recursos" />

      <div className="max-w-2xl mx-auto">
        <Progress step={step} onBack={back} />

        {step === 1 && (
          <StepEtapa state={state} onSelect={(level) => {
            setState((s) => ({ ...s, educationLevel: level, grade: null, subject: null, skill: null, selectedProposal: null }))
            advance()
          }} />
        )}
        {step === 2 && (
          <StepAno state={state} onSelect={(grade) => {
            setState((s) => ({ ...s, grade, subject: null, skill: null, selectedProposal: null }))
            advance()
          }} />
        )}
        {step === 3 && (
          <StepComponente state={state} onSelect={(subject) => {
            setState((s) => ({ ...s, subject, skill: null, selectedProposal: null }))
            advance()
          }} />
        )}
        {step === 4 && (
          <StepHabilidade state={state} onSelect={(skill) => {
            setState((s) => ({ ...s, skill, selectedProposal: null }))
            fetchProposals(skill, state.questionCount)
            advance()
          }} />
        )}
        {step === 5 && (
          <StepProposta
            state={state}
            proposals={proposals}
            loading={proposalsLoading}
            error={proposalsError}
            onSelect={(proposal) => {
              setState((s) => ({ ...s, selectedProposal: proposal }))
              advance()
            }}
          />
        )}
        {step === 6 && (
          <StepGerar
            state={state}
            loading={loading}
            error={error}
            previewHtml={previewHtml}
            onQuestionCountChange={(n) => setState((s) => ({ ...s, questionCount: n }))}
            onGenerate={handleGenerate}
            onReset={handleReset}
          />
        )}
      </div>
    </PageScaffold>
  )
}
