'use client'

import { use } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LessonPlanViewer } from '@/components/dashboard/lesson-plans/lesson-plan-viewer'
import { deleteLessonPlan, fetchLessonPlanById } from '@/lib/lesson-plans/api-client'

export default function LessonPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: plan, isLoading } = useQuery({
    queryKey: ['planner-detail', id],
    queryFn: () => fetchLessonPlanById(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLessonPlan(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['planner-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['planner-list'] })
      queryClient.invalidateQueries({ queryKey: ['planner-counts'] })
      toast.success('Plano de aula excluído')
      router.push('/planner')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir plano de aula')
    },
  })

  if (isLoading) {
    return (
      <div className="dashboard-page-container py-8 space-y-4">
        <div className="h-9 w-40 animate-pulse rounded-3 bg-paper-2" />
        <div className="h-72 animate-pulse rounded-4 bg-paper-2" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="dashboard-page-container py-8">
        <div className="mx-auto max-w-3xl">
        <div className="mt-6 rounded-4 border border-line bg-card p-8 text-center text-ink-soft">
          Plano de aula não encontrado.
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page-container py-8">
      <LessonPlanViewer
        plan={plan}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
