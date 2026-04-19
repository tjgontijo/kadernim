import { useState, useEffect } from 'react'
import { Download, RefreshCw, ArrowDownToLine, Calendar, Layers, Clock, Users, FileText, Bookmark, BookmarkCheck } from 'lucide-react'
import type { ResourceDetail } from '@/lib/resources/types'

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

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  PRINTABLE_ACTIVITY: 'Atividade imprimível',
  LESSON_PLAN: 'Plano de aula',
  GAME: 'Jogo',
  ASSESSMENT: 'Avaliação',
  OTHER: 'Recurso didático',
}

export function ResourceActionSidebar({ resource, onDownload, downloadingFileId }: ResourceActionSidebarProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isPlanned, setIsPlanned] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const author = resource.author
  const updatedDate = resource.curatedAt 
    ? new Date(resource.curatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recentemente'

  useEffect(() => {
    async function loadInteraction() {
      try {
        const res = await fetch(`/api/v1/resources/${resource.id}/interact`)
        const json = await res.json()
        if (json.data) {
          setIsSaved(json.data.isSaved)
          setIsPlanned(json.data.isPlanned)
        }
      } catch (err) {
        console.error('Failed to load interaction', err)
      }
    }
    loadInteraction()
  }, [resource.id])

  const handleToggleSave = async () => {
    setLoadingAction('save')
    try {
      const res = await fetch(`/api/v1/resources/${resource.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save' }),
      })
      const json = await res.json()
      if (json.data) setIsSaved(json.data.isSaved)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleTogglePlan = async () => {
    // Simple toggle for now, in a real app might open a date picker
    setLoadingAction('plan')
    try {
      const res = await fetch(`/api/v1/resources/${resource.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'plan', plannedFor: !isPlanned ? new Date() : null }),
      })
      const json = await res.json()
      if (json.data) setIsPlanned(json.data.isPlanned)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
      <div className="bg-card border border-line rounded-4 p-[24px] shadow-2 mb-[20px]">
        {/* ... existing header ... */}
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

        <div className="flex flex-col gap-[8px]">
          {resource.files && resource.files.length > 0 ? (
            <button
              onClick={(e) => onDownload(e, resource.files[0])}
              disabled={downloadingFileId !== null}
              className="w-full inline-flex items-center justify-center gap-[8px] px-[20px] py-[12px] font-body text-[15px] font-semibold rounded-full bg-terracotta text-white hover:bg-[oklch(0.60_0.12_42)] disabled:opacity-70 transition-colors shadow-1"
              style={{ boxShadow: '0 1px 0 oklch(0.45 0.10 42), var(--shadow-1)' }}
            >
              {downloadingFileId === resource.files[0].id ? (
                  <RefreshCw className="h-[16px] w-[16px] animate-spin" />
              ) : (
                  <Download className="h-[16px] w-[16px]" strokeWidth={2} />
              )}
              Baixar material completo
            </button>
          ) : (
            <button className="w-full inline-flex items-center justify-center gap-[8px] px-[20px] py-[12px] font-body text-[15px] font-semibold rounded-full bg-card border border-line text-ink-mute opacity-50 cursor-not-allowed">
              Sem arquivos
            </button>
          )}
          
          <div className="grid grid-cols-2 gap-[8px]">
            <button 
              onClick={handleToggleSave}
              disabled={loadingAction === 'save'}
              className={`w-full inline-flex items-center justify-center gap-[8px] px-[20px] py-[12px] font-body text-[15px] font-semibold rounded-full border transition-all shadow-1 ${
                isSaved 
                  ? 'bg-sage-2 border-sage text-sage' 
                  : 'bg-card border-line text-ink hover:bg-paper-2'
              }`}
            >
              {loadingAction === 'save' ? (
                <RefreshCw className="h-[16px] w-[16px] animate-spin" />
              ) : isSaved ? (
                <BookmarkCheck className="h-[16px] w-[16px]" strokeWidth={2} />
              ) : (
                <Bookmark className="h-[16px] w-[16px]" strokeWidth={1.8} />
              )}
              {isSaved ? 'Salvo' : 'Salvar'}
            </button>
            <button 
              onClick={handleTogglePlan}
              disabled={loadingAction === 'plan'}
              className={`w-full inline-flex items-center justify-center gap-[8px] px-[20px] py-[12px] font-body text-[15px] font-semibold rounded-full border transition-all shadow-1 ${
                isPlanned 
                  ? 'bg-terracotta-2 border-terracotta text-terracotta' 
                  : 'bg-card border-line text-ink hover:bg-paper-2'
              }`}
            >
              <Calendar className="h-[16px] w-[16px]" strokeWidth={1.8} />
              {isPlanned ? 'Planejado' : 'Planejar'}
            </button>
          </div>
        </div>

        <hr className="border-0 border-t border-dashed border-line my-[20px]" />

        <div className="grid grid-cols-2 gap-y-[16px] gap-x-[20px]">
          {/* ... existing footer metrics ... */}
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
              {resource.estimatedDurationMinutes ? `~ ${resource.estimatedDurationMinutes} min` : '--'}
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="flex items-center gap-[5px] text-[11px] text-ink-mute uppercase tracking-[0.1em] font-semibold">
              <Users className="h-[12px] w-[12px]" strokeWidth={2} />
              ano escolar
            </div>
            <div className="text-[14px] font-medium text-ink">Ver BNCC</div>
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
