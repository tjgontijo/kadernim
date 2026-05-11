'use client'

import { useState } from 'react'
import { Download, ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGrades, useSubjects } from '@/hooks/taxonomy/use-taxonomy'
import {
  useQuestionBankDocxExport,
  useQuestionBankFeedback,
  useQuestionBankGoogleDocsExport,
  useQuestionBankRequest,
} from '@/hooks/question-bank/use-question-bank'

const FUNDAMENTAL_2_SLUG = 'ensino-fundamental-2'

export default function QuestionBankPage() {
  const [gradeSlug, setGradeSlug] = useState('')
  const [subjectSlug, setSubjectSlug] = useState('')
  const [count, setCount] = useState(10)
  const [difficulty, setDifficulty] = useState<'mixed' | 'easy' | 'medium' | 'hard'>('mixed')
  const [lastRequestId, setLastRequestId] = useState<string | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])

  const { data: grades = [] } = useGrades(FUNDAMENTAL_2_SLUG)
  const { data: subjects = [] } = useSubjects(FUNDAMENTAL_2_SLUG, gradeSlug || undefined)

  const requestMutation = useQuestionBankRequest()
  const feedbackMutation = useQuestionBankFeedback()
  const exportDocxMutation = useQuestionBankDocxExport()
  const exportGoogleMutation = useQuestionBankGoogleDocsExport()

  const items = requestMutation.data?.items ?? []
  const hasItems = items.length > 0
  const hasSelection = selectedQuestionIds.length > 0

  async function handleGenerate() {
    if (!gradeSlug || !subjectSlug) {
      toast.error('Selecione ano e disciplina')
      return
    }

    try {
      const result = await requestMutation.mutateAsync({
        gradeSlug,
        subjectSlug,
        count,
        difficulty,
      })
      setLastRequestId(result.requestId)
      setSelectedQuestionIds(result.items.map((item) => item.id))
      if (result.generatedCount === 0 && result.items.length < count) {
        toast.warning(`Cobertura parcial: ${result.items.length}/${count}. Geracao de deficit entra na proxima fase.`)
      } else {
        toast.success('Questoes carregadas')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao buscar questoes')
    }
  }

  async function handleFeedback(questionId: string, positive: boolean) {
    try {
      await feedbackMutation.mutateAsync({
        questionId,
        input: {
          rating: positive ? 'POSITIVE' : 'NEGATIVE',
          reason: positive ? undefined : 'UNCLEAR',
        },
      })
      toast.success('Feedback registrado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar feedback')
    }
  }

  async function handleExportDocx() {
    if (!lastRequestId || selectedQuestionIds.length === 0) return
    try {
      const blob = await exportDocxMutation.mutateAsync({
        requestId: lastRequestId,
        questionIds: selectedQuestionIds,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `question-bank-${lastRequestId}.docx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('DOCX exportado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar DOCX')
    }
  }

  function toggleSelection(questionId: string, checked: boolean) {
    setSelectedQuestionIds((prev) =>
      checked ? Array.from(new Set([...prev, questionId])) : prev.filter((id) => id !== questionId)
    )
  }

  function selectAll(checked: boolean) {
    setSelectedQuestionIds(checked ? items.map((item) => item.id) : [])
  }

  async function handleExportGoogleDocs() {
    if (!lastRequestId) return
    try {
      const result = await exportGoogleMutation.mutateAsync(lastRequestId)
      window.open(result.data.url, '_blank')
      toast.success('Google Docs criado')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar Google Docs')
    }
  }

  return (
    <PageScaffold className="pt-4 sm:pt-6">
      <PageScaffold.Header title="Banco de Questoes" />

      <section className="rounded-4 border border-line bg-card p-4 sm:p-6 space-y-4">
        <Label className="text-sm">Etapa 1: filtros e geração</Label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label>Ano</Label>
            <Select value={gradeSlug} onValueChange={setGradeSlug}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.slug} value={grade.slug}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Disciplina</Label>
            <Select value={subjectSlug} onValueChange={setSubjectSlug}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {subjects
                  .filter((subject) => ['lingua-portuguesa', 'historia', 'geografia', 'ciencias'].includes(subject.slug))
                  .map((subject) => (
                    <SelectItem key={subject.slug} value={subject.slug}>{subject.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Dificuldade</Label>
            <Select value={difficulty} onValueChange={(value) => setDifficulty(value as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mista</SelectItem>
                <SelectItem value="easy">Facil</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="hard">Dificil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Quantidade</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} disabled={requestMutation.isPending}>
            Buscar questoes
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-4 border border-line bg-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label className="text-sm">Etapa 2: preview e seleção</Label>
          <label className="text-xs text-ink-mute flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasItems && selectedQuestionIds.length === items.length}
              onChange={(e) => selectAll(e.target.checked)}
              disabled={!hasItems}
            />
            Selecionar todas
          </label>
        </div>
        <p className="text-xs text-ink-mute">{selectedQuestionIds.length} questão(ões) selecionada(s).</p>
      </section>

      <section className="mt-4 rounded-4 border border-line bg-card p-4 sm:p-6 space-y-3">
        <Label className="text-sm">Etapa 3: exportação</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportDocx}
            disabled={!lastRequestId || !hasSelection || exportDocxMutation.isPending}
          >
            <Download className="h-4 w-4 mr-1.5" /> DOCX
          </Button>
          <Button
            variant="outline"
            onClick={handleExportGoogleDocs}
            disabled={!lastRequestId || !hasSelection || exportGoogleMutation.isPending}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" /> Google Docs
          </Button>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {items.map((item, idx) => (
          <article key={item.id} className="rounded-4 border border-line bg-card p-4 sm:p-5">
            <label className="mb-3 text-xs text-ink-mute flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedQuestionIds.includes(item.id)}
                onChange={(e) => toggleSelection(item.id, e.target.checked)}
                disabled={!hasItems}
              />
              Incluir no DOCX
            </label>
            <div className="text-xs text-ink-mute mb-2">
              #{idx + 1} · {item.questionTypeName} · {item.difficulty}
            </div>
            <p className="text-sm text-ink leading-relaxed">{item.prompt}</p>
            {item.instruction && <p className="text-xs text-ink-mute mt-2">{item.instruction}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleFeedback(item.id, true)} disabled={feedbackMutation.isPending}>
                <ThumbsUp className="h-4 w-4 mr-1.5" /> Boa
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleFeedback(item.id, false)} disabled={feedbackMutation.isPending}>
                <ThumbsDown className="h-4 w-4 mr-1.5" /> Problema
              </Button>
            </div>
          </article>
        ))}

        {!requestMutation.isPending && items.length === 0 && (
          <div className="rounded-4 border border-dashed border-line bg-card p-8 text-center text-sm text-ink-mute">
            Nenhuma questao carregada ainda.
          </div>
        )}
      </section>
    </PageScaffold>
  )
}
