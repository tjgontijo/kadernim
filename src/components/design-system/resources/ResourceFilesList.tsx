import { File, FileText, Presentation, Download, RefreshCw } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ResourceFilesList({ files, onDownload, downloadingFileId }: any) {
  if (!files || files.length === 0) return null

  return (
    <div className="bg-card border border-line rounded-4 p-[20px_22px] shadow-1 mb-[20px]">
      <div className="flex items-center gap-[8px] font-display text-[16px] font-semibold mb-[14px] text-ink after:content-[''] after:flex-1 after:border-t after:border-dashed after:border-line after:mt-[4px]">
        Arquivos inclusos
      </div>
      <div className="flex flex-col">
        {files.map((f: any, i: number) => (
          <button
            key={f.id}
            onClick={(e) => onDownload(e, f)}
            disabled={downloadingFileId === f.id}
            className={`flex items-center gap-[12px] py-[10px] text-left transition-colors group ${
              i > 0 ? 'border-t border-line-soft' : ''
            }`}
          >
            <div className={`w-[36px] h-[36px] rounded-3 flex items-center justify-center shrink-0 ${
              f.name.endsWith('.pdf') ? 'bg-terracotta-2 text-terracotta' :
              f.name.endsWith('.docx') || f.name.endsWith('.doc') ? 'bg-[oklch(0.94_0.045_260)] text-[oklch(0.38_0.10_260)]' :
              f.name.endsWith('.pptx') || f.name.endsWith('.ppt') ? 'bg-mustard-2 text-[oklch(0.50_0.13_82)]' :
              'bg-paper-2 text-ink-soft'
            }`}>
              {f.name.endsWith('.pdf') ? <FileText className="h-[18px] w-[18px]" /> : 
                f.name.endsWith('.pptx') ? <Presentation className="h-[18px] w-[18px]" /> :
                <File className="h-[18px] w-[18px]" />}
            </div>
            <div className="flex-1 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-[14px] font-medium text-ink group-hover:text-terracotta transition-colors truncate mb-[2px] cursor-help">
                    {f.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {f.name}
                </TooltipContent>
              </Tooltip>
              <div className="text-[11px] text-ink-mute font-mono tracking-[0.02em]">
                Clique para baixar
              </div>
            </div>
            <div className="text-ink-mute p-[6px] disabled:opacity-50">
              {downloadingFileId === f.id ? (
                <RefreshCw className="h-[16px] w-[16px] animate-spin text-terracotta" />
              ) : (
                <Download className="h-[16px] w-[16px] group-hover:text-terracotta transition-colors" strokeWidth={2} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
