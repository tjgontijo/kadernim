'use client'

import { Button } from '@/components/ui/button'

interface ResourceUpsellBannerProps {
  title?: string
  description?: string
  ctaLabel?: string
  onSubscribe?: () => void
}

export function ResourceUpsellBanner({
  title = 'Desbloqueie todos os recursos por apenas R$9,90* ao mês',
  description = 'Tenha acesso ilimitado a todos os recursos exclusivos que vão economizar seu tempo de planejamento e enriquecer suas aulas. Por apenas R$9,90/mês ou R$97,00/ano',
  ctaLabel = 'Desbloquear Agora',
  onSubscribe,
}: ResourceUpsellBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5 shadow-sm group">
      <div className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-10 [background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--primary))_0,transparent_50%),radial-gradient(125%_125%_at_0%_0%,hsl(var(--secondary))_0,transparent_50%),radial-gradient(125%_125%_at_100%_0%,hsl(var(--accent))_0,transparent_50%)]" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col">
          <h3 className="text-sm sm:text-base font-black text-foreground leading-tight uppercase tracking-tight italic">Assine por <span className="text-primary tracking-normal">R$9,90/mês</span></h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold">Acesso ilimitado e imediato a todos os materiais.</p>
        </div>
        <Button onClick={() => onSubscribe?.()} size="sm" className="h-9 sm:h-11 px-8 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0">
          {ctaLabel}
        </Button>
      </div>
    </div>

  )
}
