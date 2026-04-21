'use client'

import Link from 'next/link'
import { use } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LessonPlanViewer } from '@/components/dashboard/lesson-plans/lesson-plan-viewer'
import { archiveLessonPlan, fetchLessonPlanById } from '@/lib/lesson-plans/api-client'

export default function LessonPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const { data: plan, isLoading } = useQuery({
    queryKey: ['planner-detail', id],
    queryFn: () => fetchLessonPlanById(id),
  })

  const archiveMutation = useMutation({
    mutationFn: (archived: boolean) => archiveLessonPlan(id, { archived }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['planner-detail', id], updated)
      queryClient.invalidateQueries({ queryKey: ['planner-list'] })
      toast.success(updated.archivedAt ? 'Plano arquivado' : 'Plano desarquivado')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar plano')
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-0 py-8 space-y-4">
        <div className="h-9 w-40 animate-pulse rounded-3 bg-paper-2" />
        <div className="h-72 animate-pulse rounded-4 bg-paper-2" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-0 py-8">
        <Link href="/planner">
          <Button variant="outline" className="rounded-full border-line">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o planejador
          </Button>
        </Link>
        <div className="mt-6 rounded-4 border border-line bg-card p-8 text-center text-ink-soft">
          Plano de aula não encontrado.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-0 py-8">
      <Link href="/planner">
        <Button variant="outline" className="mb-5 rounded-full border-line">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o planejador
        </Button>
      </Link>

      <LessonPlanViewer
        plan={plan}
        onToggleArchive={(archived) => archiveMutation.mutate(archived)}
        isArchiving={archiveMutation.isPending}
      />
    </div>
  )
}
