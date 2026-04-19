export function ResourceRelatedStrip() {
  return (
    <section className="mt-[56px] pt-[40px] border-t border-dashed border-line">
      <div className="flex items-baseline justify-between mb-[20px]">
        <h3 className="font-display font-semibold text-[24px] tracking-[-0.01em] text-ink">Combina com esta aula</h3>
        <span className="font-hand text-[18px] text-terracotta">~ escolhidas a dedo</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
         {/* Placeholder related cards matching HTML `.r-card` */}
         <div className="bg-card border border-line rounded-4 overflow-hidden shadow-1 flex flex-col hover:-translate-y-0.5 hover:shadow-3 transition-all cursor-pointer group">
            <div className="aspect-[4/3] bg-terracotta-2 relative flex items-center justify-center">
               <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0,transparent_10px,oklch(0.88_0.02_75_/_0.5)_10px,oklch(0.88_0.02_75_/_0.5)_11px)]"></div>
               <span className="font-mono text-[10px] text-ink-mute uppercase tracking-[0.12em] z-10 font-bold">Atividade Imprimível</span>
            </div>
            <div className="p-[14px_16px_18px] flex flex-col gap-[10px] flex-1">
               <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] text-[10px] font-semibold rounded-full leading-[1.5] whitespace-nowrap bg-[oklch(0.94_0.045_260)] text-[oklch(0.38_0.10_260)] w-max">Matemática</span>
               <div className="font-display font-semibold text-[16px] text-ink leading-[1.25] group-hover:text-terracotta transition-colors">Dominó das frações equivalentes</div>
            </div>
         </div>
         {/* More cards can be generated from standard collection component */}
      </div>
    </section>
  )
}
