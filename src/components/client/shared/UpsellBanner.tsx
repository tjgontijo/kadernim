'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

interface UpsellBannerProps {
  title?: string
  description?: string
  ctaLabel?: string
  benefits?: string[]
  onSubscribe?: () => void
}

export function UpsellBanner({
  title = 'Acesso Total: De R$347 por R$147 à vista',
  description = 'Desbloqueie todos os recursos exclusivos, materiais e ferramentas premium para transformar seu planejamento agora.',
  ctaLabel = 'Quero Acesso Agora',
  benefits = [
    'Criação ilimitada de planos de aula',
    'Solicitação de recursos exclusivos',
    'Voto em novas funcionalidades da comunidade',
  ],
  onSubscribe,
}: UpsellBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 sm:p-8 shadow-xl group">
      {/* Subtle Background elements */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-primary" />
      <div className="pointer-events-none absolute -right-24 -top-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-primary/20" />

      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <Sparkles size={14} className="fill-primary/20" />
              Oferta Especial de Lançamento
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-foreground leading-tight uppercase tracking-tighter italic">
                {title}
              </h3>
              <p className="text-sm font-bold text-muted-foreground/80 tracking-tight">
                {description}
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 shrink-0 w-full lg:w-auto">
          <Button
            onClick={() => onSubscribe?.()}
            size="lg"
            className="w-full lg:w-auto h-14 px-10 rounded-xl text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3"
          >
            {ctaLabel}
            <ArrowRight size={18} />
          </Button>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-center">
            Acesso imediato • Pagamento Seguro
          </p>
        </div>
      </div>
    </div>
  )
}
