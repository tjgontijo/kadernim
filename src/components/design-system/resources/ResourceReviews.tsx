import { Star } from 'lucide-react'

export function ResourceReviews() {
  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <h3 className="font-display font-semibold text-[20px] mb-[20px] text-ink flex items-center gap-[8px]">
        <span className="text-terracotta text-[18px] opacity-60">04</span> O que dizem as professoras
      </h3>
      <div className="flex items-center gap-[16px] mb-[32px] pb-[20px] border-b border-dashed border-line">
        <div className="font-display font-bold text-[36px] text-ink leading-none">4.8</div>
        <div className="flex flex-col gap-[4px]">
           <div className="flex text-mustard gap-[2px]">
             {[1,2,3,4,5].map(i => <Star key={i} className="w-[14px] h-[14px] fill-current" />)}
           </div>
           <div className="text-[12px] text-ink-mute tracking-[0.02em]">baseado em 47 avaliações</div>
        </div>
      </div>
      <div className="flex gap-[16px] items-start border-b border-line pb-[24px] mb-[24px]">
        <div className="w-[36px] h-[36px] shrink-0 bg-terracotta-2 text-terracotta flex items-center justify-center font-display font-semibold rounded-full text-[14px]">JM</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-[8px] mb-[6px]">
            <strong className="font-semibold text-ink text-[14px]">Juliana Martins</strong>
            <span className="text-ink-mute text-[12px]">· Prof. 2º ano · Belo Horizonte</span>
          </div>
          <p className="text-[14px] text-ink-soft leading-[1.5] mb-[8px]">
            As crianças amaram! Adaptei trocando a pizza por bolo de fubá, e funcionou muito bem no contexto da minha escola rural.
          </p>
          <div className="text-[12px] text-ink-mute tracking-[0.02em]">há 2 dias</div>
        </div>
      </div>
      <button className="text-[13px] text-terracotta font-semibold hover:underline">Ver todas as avaliações</button>
    </div>
  )
}
