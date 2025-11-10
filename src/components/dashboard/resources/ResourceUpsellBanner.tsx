'use client'

import { Button } from '@/components/ui/button'

interface ResourceUpsellBannerProps {
  title?: string
  description?: string
  ctaLabel?: string
  onSubscribe?: () => void
}

export function ResourceUpsellBanner({
  title = 'Desbloqueie todos os recursos por apenas R$19,90 ao mês',
  description = 'Assine agora para ter acesso ilimitado a todos os recursos exclusivos do Kadernim e a todas as atualizações durannte todo o ano por apenas R$19,90 ao mês ou R$199,00 à vista.',
  ctaLabel = 'Assinar agora',
  onSubscribe,
}: ResourceUpsellBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-white p-6">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(125%_125%_at_50%_10%,#e0e7ff_0,transparent_50%),radial-gradient(125%_125%_at_0%_0%,#cffafe_0,transparent_50%),radial-gradient(125%_125%_at_100%_0%,#fce7f3_0,transparent_50%)]" />
      <div className="relative flex flex-col gap-3">
        <h3 className="text-md font-semibold text-gray-900 text-center">{title}</h3>
        <p className="text-sm text-gray-600 text-left">{description}</p>
        <Button onClick={() => onSubscribe?.()} size="sm" className="mt-1 w-full">
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
