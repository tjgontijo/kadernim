import { Layers, Clock, Users, FileText, RefreshCw, Download } from 'lucide-react'
import type { ResourceDetail } from '@/lib/resources/types'

interface ResourceMetricsProps {
  resource: ResourceDetail
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  PRINTABLE_ACTIVITY: 'Atividade imprimível',
  LESSON_PLAN: 'Plano de aula',
  GAME: 'Jogo',
  ASSESSMENT: 'Avaliação',
  OTHER: 'Recurso didático',
}

export function ResourceMetrics({ resource }: ResourceMetricsProps) {
  const updatedDate = resource.curatedAt 
    ? new Date(resource.curatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recentemente'
    
  const schoolYearLabel =
    resource.gradeLabels && resource.gradeLabels.length > 0
      ? resource.gradeLabels.length <= 2
        ? resource.gradeLabels.join(', ')
        : `${resource.gradeLabels[0]}, ${resource.gradeLabels[1]} +${resource.gradeLabels.length - 2}`
      : 'Não definido'

  return (
    <div className="bg-card border border-line rounded-4 p-[24px] shadow-1 mb-[20px]">
      <div className="flex items-center gap-[8px] font-display text-[14px] font-semibold mb-[16px] text-ink/80 border-b border-dashed border-line pb-[12px]">
        Informações do material
      </div>
      <div className="grid grid-cols-2 gap-y-[16px] gap-x-[20px]">
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Layers className="h-[12px] w-[12px]" strokeWidth={2} />
            páginas
          </div>
          <div className="text-[14px] font-medium text-ink">
            {resource.pagesCount ? `${resource.pagesCount} páginas` : '--'}
          </div>
        </div>
        
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Clock className="h-[12px] w-[12px]" strokeWidth={2} />
            duração
          </div>
          <div className="text-[14px] font-medium text-ink">
            {(() => {
              const stepSum = resource.steps?.reduce((acc, step) => {
                const num = step.duration?.match(/\d+/)?.[0]
                return acc + (num ? parseInt(num) : 0)
              }, 0) || 0
              
              const finalDuration = stepSum > 0 ? stepSum : resource.estimatedDurationMinutes
              return finalDuration ? `~ ${finalDuration} min` : '--'
            })()}
          </div>
        </div>

        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Users className="h-[12px] w-[12px]" strokeWidth={2} />
            ano escolar
          </div>
          <div className="text-[14px] font-medium text-ink">{schoolYearLabel}</div>
        </div>

        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <FileText className="h-[12px] w-[12px]" strokeWidth={2} />
            tipo
          </div>
          <div className="text-[14px] font-medium text-ink">
            {RESOURCE_TYPE_LABELS[resource.resourceType] || 'Material'}
          </div>
        </div>

        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <RefreshCw className="h-[12px] w-[12px]" strokeWidth={2} />
            atualizado
          </div>
          <div className="text-[14px] font-medium text-ink">
            {updatedDate}
          </div>
        </div>

        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Download className="h-[12px] w-[12px]" strokeWidth={2} />
            downloads
          </div>
          <div className="text-[14px] font-medium text-ink">
            {resource.downloadCount}
          </div>
        </div>
      </div>
    </div>
  )
}
