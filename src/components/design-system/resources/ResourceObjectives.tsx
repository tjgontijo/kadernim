import { Check } from 'lucide-react'

interface ResourceObjectivesProps {
  objectives?: Array<{ id: string; text: string; order: number }>
}

export function ResourceObjectives({ objectives }: ResourceObjectivesProps) {
  if (!objectives || objectives.length === 0) return null

  const renderText = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
    return { __html: html }
  }

  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <h3 className="font-display font-semibold text-[20px] mb-[20px] text-ink flex items-center gap-[8px]">
        <span className="text-terracotta text-[18px] opacity-60">01</span> Objetivos de aprendizagem
      </h3>
      <ul className="flex flex-col gap-[16px]">
        {objectives.sort((a, b) => a.order - b.order).map((obj) => (
          <li key={obj.id} className="flex items-start gap-[12px]">
            <div className="mt-[2px] shrink-0 text-terracotta bg-terracotta-2 p-[4px] rounded-full">
               <Check strokeWidth={2.5} className="h-[14px] w-[14px]" />
            </div>
            <div 
              className="text-[14px] leading-[1.5] text-ink"
              dangerouslySetInnerHTML={renderText(obj.text)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
