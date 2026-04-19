import { Share2, Link as LinkIcon, Flag } from 'lucide-react'

export function ResourceShareCard() {
  return (
    <div className="bg-card border border-line rounded-4 p-[16px_20px] shadow-1">
      <div className="flex items-center gap-[12px]">
        <button className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-full text-[13px] font-semibold text-ink-soft hover:bg-paper-2 hover:text-ink transition-colors border-transparent">
          <Share2 className="w-[16px] h-[16px]" strokeWidth={1.8} />
          Compartilhar
        </button>
        <button className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-full text-[13px] font-semibold text-ink-soft hover:bg-paper-2 hover:text-ink transition-colors border-transparent">
          <LinkIcon className="w-[16px] h-[16px]" strokeWidth={1.8} />
          Copiar link
        </button>
        <button className="flex items-center justify-center p-[8px] rounded-full text-ink-mute hover:bg-paper-2 hover:text-ink transition-colors border-transparent ml-auto">
          <Flag className="w-[16px] h-[16px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}
