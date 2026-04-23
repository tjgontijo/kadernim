import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, RefreshCw, Heart, Presentation, File, FileText } from 'lucide-react'
import type { ResourceDetail } from '@/lib/resources/types'
import { CreateResourceLessonPlanDialog } from '@/components/dashboard/lesson-plans/create-resource-lesson-plan-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ResourceActionSidebarProps {
  resource: ResourceDetail
  onDownload: (e: React.MouseEvent, file: { id: string; name: string }) => void
  downloadingFileId: string | null
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ResourceActionSidebar({ resource, onDownload, downloadingFileId }: ResourceActionSidebarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const author = resource.author

  const { data: interaction, refetch: refetchInteraction } = useQuery({
    queryKey: ['resource-interact', resource.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/resources/${resource.id}/interact`)
      if (!res.ok) throw new Error('Failed to load interaction')
      const json = await res.json()
      return json.data as { isSaved: boolean } | null
    },
    staleTime: 1000 * 60 * 5,
  })

  const isSaved = interaction?.isSaved ?? false

  const handleToggleSave = async () => {
    setLoadingAction('save')
    try {
      await fetch(`/api/v1/resources/${resource.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' }),
      })
      await refetchInteraction()
    } finally {
      setLoadingAction(null)
    }
  }

  const files = resource.files || []

  return (
      <div className="bg-card border border-line rounded-4 p-[24px] shadow-2 mb-[20px]">
        <div className="flex flex-wrap gap-[6px] mb-[14px]">
          <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] text-[12px] font-semibold rounded-full leading-[1.5] whitespace-nowrap bg-[oklch(0.94_0.045_260)] text-[oklch(0.38_0.10_260)]">
            {resource.subject}
          </span>
          <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] text-[12px] font-semibold rounded-full leading-[1.5] whitespace-nowrap bg-paper-2 text-ink-soft border border-line">
            <span className="inline-block w-[10px] h-[10px] rounded-[2px] bg-terracotta"></span>
            {resource.educationLevel}
          </span>
          {resource.isCurated && (
            <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] text-[12px] font-semibold rounded-full leading-[1.5] whitespace-nowrap bg-sage-2 text-sage">
              <span className="w-[6px] h-[6px] rounded-full bg-current"></span>
              Curadoria Kadernim
            </span>
          )}
        </div>

        <h1 className="font-display text-[26px] font-semibold leading-[1.2] tracking-[-0.015em] mb-[8px] text-ink">
          {resource.title}
        </h1>

        <div className="flex items-center gap-[8px] text-[13px] text-ink-mute mb-[18px]">
          {author ? (
            <>
              por
              <span className="flex items-center gap-[6px] pt-[2px] pr-[8px] pb-[2px] pl-[2px] bg-paper-2 rounded-full">
                <div className="w-[22px] h-[22px] rounded-full bg-sage-2 text-sage flex items-center justify-center font-display font-semibold text-[10px]">
                  {getInitials(author.displayName)}
                </div>
                <strong className="text-ink font-semibold border-none">{author.displayName}</strong>
              </span>
              {resource.isCurated && <span className="text-[12px]">· curadoria Kadernim</span>}
            </>
          ) : (
            <span className="text-[12px]">Equipe Kadernim</span>
          )}
        </div>


        <button 
          onClick={handleToggleSave}
          disabled={loadingAction === 'save'}
          className={`absolute top-[24px] right-[24px] w-[36px] h-[36px] flex items-center justify-center rounded-full transition-all border ${
            isSaved 
              ? 'bg-terracotta/5 border-terracotta/20 text-terracotta' 
              : 'bg-card border-line text-ink-mute hover:text-terracotta hover:bg-paper-2'
          }`}
          aria-label={isSaved ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          {loadingAction === 'save' ? (
            <RefreshCw className="h-[16px] w-[16px] animate-spin" />
          ) : (
            <Heart className={`h-[18px] w-[18px] ${isSaved ? 'fill-current' : ''}`} strokeWidth={isSaved ? 2.5 : 2} />
          )}
        </button>

        {files.length > 0 && (
          <div className="pt-[16px] border-t border-dashed border-line">
            <div className="flex items-center gap-[8px] font-display text-[14px] font-semibold mb-[12px] text-ink/80">
              Arquivos para baixar
            </div>
            <div className="flex flex-col">
              {files.map((f, i) => (
                <button
                  key={f.id}
                  onClick={(e) => onDownload(e, f)}
                  disabled={downloadingFileId === f.id}
                  className={`flex items-center gap-[12px] py-[10px] text-left transition-colors group ${
                    i > 0 ? 'border-t border-line-soft/50' : ''
                  }`}
                >
                  <div className={`w-[32px] h-[32px] rounded-2 flex items-center justify-center shrink-0 ${
                    f.name.endsWith('.pdf') ? 'bg-terracotta/10 text-terracotta' :
                    'bg-paper-2 text-ink-soft'
                  }`}>
                    {f.name.endsWith('.pdf') ? <FileText className="h-[16px] w-[16px]" /> : 
                      f.name.endsWith('.pptx') ? <Presentation className="h-[16px] w-[16px]" /> :
                      <File className="h-[16px] w-[16px]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-[13px] font-medium text-ink group-hover:text-terracotta transition-colors truncate cursor-help">
                          {f.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {f.name}
                      </TooltipContent>
                    </Tooltip>
                    <div className="text-[10px] text-ink-mute font-mono tracking-[0.02em] flex items-center gap-[6px]">
                      {(f as any).pageCount > 0 && (
                        <span className="text-terracotta/70 font-semibold">
                          {(f as any).pageCount} {(f as any).pageCount === 1 ? 'página' : 'páginas'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-ink-mute p-[4px] disabled:opacity-50">
                    {downloadingFileId === f.id ? (
                      <RefreshCw className="h-[14px] w-[14px] animate-spin text-terracotta" />
                    ) : (
                      <Download className="h-[14px] w-[14px] group-hover:text-terracotta transition-colors" strokeWidth={2} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
  )
}
