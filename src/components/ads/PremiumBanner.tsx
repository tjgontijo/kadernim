'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Sparkles, Crown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface PremiumBannerProps {
  slot: 'header' | 'inline' | 'sidebar' | 'footer'
  variant?: 'default' | 'compact' | 'minimal'
  dismissible?: boolean // Mantém prop mas não usa mais localStorage
}

const bannerContent = {
  header: {
    icon: Crown,
    title: '🎓 Desbloqueie Todo o Potencial da Plataforma',
    description: 'Acesse +200 recursos pedagógicos, materiais exclusivos e muito mais com o Plano Premium.',
    cta: 'Ver Planos Premium',
    ctaSecondary: 'Saiba Mais'
  },
  inline: {
    icon: Sparkles,
    title: '✨ Quer Acesso Ilimitado?',
    description: 'Faça upgrade e tenha acesso a todos os recursos pedagógicos.',
    cta: 'Fazer Upgrade',
    ctaSecondary: null
  },
  sidebar: {
    icon: Zap,
    title: '⚡ Premium',
    description: 'Desbloqueie tudo por apenas R$ 197/ano',
    cta: 'Upgrade',
    ctaSecondary: null
  },
  footer: {
    icon: Crown,
    title: 'Aproveite ao Máximo a Plataforma',
    description: 'Upgrade para Premium e acesse recursos ilimitados',
    cta: 'Ver Planos',
    ctaSecondary: null
  }
}

export function PremiumBanner({ slot, variant = 'default', dismissible = true }: PremiumBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const content = bannerContent[slot]
  const Icon = content.icon

  if (isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Apenas fecha temporariamente (volta ao recarregar a página)
    // Comportamento tipo AdSense - sempre volta!
  }

  // Variante Minimal (apenas CTA)
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <Icon className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
          {content.title}
        </span>
        <Button asChild size="sm" variant="default" className="ml-auto">
          <Link href="/#pricing">{content.cta}</Link>
        </Button>
      </div>
    )
  }

  // Variante Compact
  if (variant === 'compact') {
    return (
      <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-purple-600" />
          </button>
        )}
        
        <div className="p-4 flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
              {content.title}
            </h3>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              {content.description}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Link href="/#pricing">{content.cta}</Link>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Variante Default (completa)
  return (
    <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="h-4 w-4 text-purple-600" />
        </button>
      )}
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-purple-950/20" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
              {content.title}
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              {content.description}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Link href="/#pricing">{content.cta}</Link>
              </Button>
              
              {content.ctaSecondary && (
                <Button asChild variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Link href="/#pricing">{content.ctaSecondary}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
