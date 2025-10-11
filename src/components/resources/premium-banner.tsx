'use client'

import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export function PremiumBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/80 to-primary p-6 shadow-md">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
      
      <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Acesso Premium</h2>
          <p className="mt-1 text-sm text-white/80 sm:text-base">
            Desbloqueie todos os recursos pedagógicos com nossa assinatura premium.
          </p>
        </div>
        
        <Button 
          size="lg" 
          variant="secondary"
          className="bg-white text-primary hover:bg-gray-100 font-medium cursor-pointer"
        >
          <Zap className="mr-2 h-4 w-4" />
          Assinar agora
        </Button>
      </div>
    </div>
  )
}
