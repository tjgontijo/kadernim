interface ResourceTimelineProps {
  steps?: Array<{
    id: string
    type: string
    title: string
    duration: string | null
    content: string
    order: number
  }>
}

export function ResourceTimeline({ steps }: ResourceTimelineProps) {
  if (!steps || steps.length === 0) return null

  const renderContent = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
    return { __html: html }
  }

  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <h3 className="font-display font-semibold text-[20px] mb-[20px] text-ink flex items-center gap-[8px]">
        <span className="text-terracotta text-[18px] opacity-60">02</span> Como conduzir a aula
      </h3>
      <div className="border-l border-dashed border-line ml-[14px] pl-[28px] py-[4px] flex flex-col gap-[28px] relative">
        {steps.sort((a, b) => a.order - b.order).map((step, i) => (
           <div key={step.id} className="relative">
             <div className="absolute -left-[43px] top-[2px] w-[28px] h-[28px] rounded-full border border-line bg-paper-2 flex items-center justify-center font-display font-semibold text-[13px] text-ink">
               {i + 1}
             </div>
             <div className="font-display font-semibold text-[16px] text-ink leading-none mb-[6px]">{step.title}</div>
             <div className="text-[12px] font-mono text-ink-mute tracking-[0.02em] mb-[10px] uppercase">
                {step.duration || 'Duração variável'}
             </div>
             <div 
               className="text-[14px] leading-[1.6] text-ink-soft whitespace-pre-wrap"
               dangerouslySetInnerHTML={renderContent(step.content)}
             />
           </div>
        ))}
      </div>
    </div>
  )
}
