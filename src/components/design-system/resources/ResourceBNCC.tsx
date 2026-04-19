interface ResourceBNCCProps {
  skills?: Array<{ id: string; code: string; description: string }>
}

export function ResourceBNCC({ skills }: ResourceBNCCProps) {
  if (!skills || skills.length === 0) return null

  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <h3 className="font-display font-semibold text-[20px] mb-[20px] text-ink flex items-center gap-[8px]">
        <span className="text-terracotta text-[18px] opacity-60">03</span> Habilidades BNCC
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {skills.map((b) => (
           <div key={b.id} className="flex flex-col gap-[8px] p-[16px] rounded-3 border border-line bg-paper-2">
             <span className="font-mono text-[11px] font-semibold tracking-[0.05em] text-ink">{b.code}</span>
             <span className="text-[13px] leading-[1.5] text-ink-soft">{b.description}</span>
           </div>
        ))}
      </div>
    </div>
  )
}
