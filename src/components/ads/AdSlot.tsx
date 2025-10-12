'use client'

import { usePremiumStatus } from '@/hooks/use-premium-status'
import { PremiumBanner } from './PremiumBanner'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slot: 'header' | 'inline' | 'sidebar' | 'footer'
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  position?: number // Para inline ads (ex: após 3 itens)
}

/**
 * AdSlot - Sistema de injeção de banners premium
 * Funciona como AdSense: só aparece para usuários free
 */
export function AdSlot({ slot, className, variant = 'default', position }: AdSlotProps) {
  const { showAds } = usePremiumStatus()
  
  // Não renderiza nada se o usuário é premium
  if (!showAds) {
    return null
  }
  
  return (
    <div 
      className={cn('ad-slot', `ad-slot-${slot}`, className)}
      data-ad-slot={slot}
      data-ad-position={position}
    >
      <PremiumBanner slot={slot} variant={variant} />
    </div>
  )
}
