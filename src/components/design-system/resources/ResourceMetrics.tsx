import { Layers, Clock, Users, RefreshCw, Download, GraduationCap, BookOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ResourceDetail } from '@/lib/resources/types'

interface ResourceMetricsProps {
  resource: ResourceDetail
}

export function ResourceMetrics({ resource }: ResourceMetricsProps) {
  const displayDate = resource.curatedAt || resource.updatedAt
  
  const updatedDate = displayDate
    ? formatDistanceToNow(new Date(displayDate), { addSuffix: true, locale: ptBR })
    : 'Recentemente'
    
  const schoolYearLabel =
    resource.gradeLabels && resource.gradeLabels.length > 0
      ? resource.gradeLabels.length <= 3
        ? resource.gradeLabels.join(', ')
        : `${resource.gradeLabels[0]}, ${resource.gradeLabels[1]} +${resource.gradeLabels.length - 2}`
      : 'Não definido'

  return (
    <div className="bg-card border border-line rounded-4 p-[24px] shadow-1 mb-[20px]">
      <div className="flex items-center gap-[8px] font-display text-[14px] font-semibold mb-[16px] text-ink/80 border-b border-dashed border-line pb-[12px]">
        Informações do material
      </div>
      <div className="grid grid-cols-2 gap-y-[16px] gap-x-[20px]">
        {/* Etapa */}
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <GraduationCap className="h-[12px] w-[12px]" strokeWidth={2} />
            Etapa
          </div>
          <div className="text-[14px] font-medium text-ink">
            {resource.educationLevel || '--'}
          </div>
        </div>

        {/* Componente */}
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <BookOpen className="h-[12px] w-[12px]" strokeWidth={2} />
            Componente
          </div>
          <div className="text-[14px] font-medium text-ink">
            {resource.subject || '--'}
          </div>
        </div>

        {/* Ano / Série */}
        <div className="flex flex-col gap-[2px] col-span-2">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Users className="h-[12px] w-[12px]" strokeWidth={2} />
            Ano / Série
          </div>
          <div className="text-[14px] font-medium text-ink">{schoolYearLabel}</div>
        </div>

        <div className="border-t border-dashed border-line col-span-2 my-1" />

        {/* Páginas */}
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <Layers className="h-[12px] w-[12px]" strokeWidth={2} />
            páginas
          </div>
          <div className="text-[14px] font-medium text-ink">
            {resource.pagesCount ? `${resource.pagesCount} páginas` : '--'}
          </div>
        </div>
        
        {/* Duração */}
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

        {/* Atualizado */}
        <div className="flex flex-col gap-[2px]">
          <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
            <RefreshCw className="h-[12px] w-[12px]" strokeWidth={2} />
            atualizado
          </div>
          <div className="text-[14px] font-medium text-ink">
            {updatedDate}
          </div>
        </div>

        {/* Downloads */}
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
