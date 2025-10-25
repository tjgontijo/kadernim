// src/components/ads/AdSlot.tsx
'use client'

import { useSubscriberStatus } from '@/hooks/use-subscriber-status'
import { PremiumBanner } from './PremiumBanner'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: 'header' | 'inline' | 'sidebar' | 'footer'
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  creative?: 'conversion' | 'testimonial' | 'urgency'
  position?: number // Para inline ads (ex: após 3 itens)
}

export function AdSlot({ slot, className, variant = 'default', creative = 'conversion', position }: AdSlotProps) {
  const { showAds, isLoading } = useSubscriberStatus()
  
  // Não renderiza nada se ainda está carregando ou se o usuário é premium/admin
  if (isLoading || !showAds) {
    return null
  }
  
  return (
    <div 
      className={cn('ad-slot', `ad-slot-${slot}`, className)}
      data-ad-slot={slot}
      data-ad-position={position}
    >
      <PremiumBanner slot={slot} variant={variant} creative={creative} />
    </div>
  )
}
