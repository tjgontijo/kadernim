'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Calendar, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { createLessonPlanFromResource } from '@/lib/lesson-plans/api-client'
import type { LessonPlanMode } from '@/lib/lesson-plans/schemas'

interface CreateResourceLessonPlanDialogProps {
  resourceId: string
}

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '50 min', value: 50 },
  { label: '2 aulas', value: 100 },
]

const MODES: Array<{ label: string; value: LessonPlanMode }> = [
  { label: 'Aula completa', value: 'FULL_LESSON' },
  { label: 'Revisão', value: 'REVIEW' },
  { label: 'Atividade em grupo', value: 'GROUP_ACTIVITY' },
  { label: 'Avaliação diagnóstica', value: 'DIAGNOSTIC' },
  { label: 'Tarefa', value: 'HOMEWORK' },
]

export function CreateResourceLessonPlanDialog({ resourceId }: CreateResourceLessonPlanDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [durationMinutes, setDurationMinutes] = useState(50)
  const [mode, setMode] = useState<LessonPlanMode>('FULL_LESSON')
  const [teacherNote, setTeacherNote] = useState('')

  const createMutation = useMutation({
    mutationFn: () =>
      createLessonPlanFromResource(resourceId, {
        durationMinutes,
        mode,
        teacherNote: teacherNote.trim() || undefined,
      }),
    onSuccess: (result) => {
      toast.success('Plano de aula criado')
      setOpen(false)
      router.push(result.redirectUrl)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar plano de aula')
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full rounded-full border-line text-ink hover:bg-paper-2">
          <Calendar className="h-4 w-4" />
          Criar plano de aula
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl rounded-4 border-line bg-card p-0 overflow-hidden" showCloseButton>
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Criar plano de aula</DialogTitle>
          <DialogDescription>
            Monte um plano com IA a partir deste recurso em poucos cliques.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.11em] font-semibold text-ink-mute mb-2">Duração</p>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDurationMinutes(item.value)}
                  className={`rounded-3 border px-3 py-2 text-sm font-semibold transition-colors ${
                    durationMinutes === item.value
                      ? 'border-terracotta bg-terracotta-2 text-terracotta'
                      : 'border-line bg-paper text-ink hover:bg-paper-2'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.11em] font-semibold text-ink-mute mb-2">Tipo de uso</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-3 border px-3 py-2 text-sm font-semibold text-left transition-colors ${
                    mode === item.value
                      ? 'border-sage bg-sage-2 text-sage'
                      : 'border-line bg-paper text-ink hover:bg-paper-2'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.11em] font-semibold text-ink-mute mb-2">Observação opcional</p>
            <Textarea
              maxLength={500}
              value={teacherNote}
              onChange={(event) => setTeacherNote(event.target.value)}
              placeholder="Ex.: turma com dificuldade em leitura"
              className="min-h-[96px] border-line bg-paper"
            />
            <p className="mt-1 text-xs text-ink-mute text-right">{teacherNote.length}/500</p>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="rounded-full bg-terracotta text-white hover:bg-[oklch(0.60_0.12_42)]"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {createMutation.isPending ? 'Gerando plano...' : 'Gerar plano de aula'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
