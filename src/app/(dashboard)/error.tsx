'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log do erro para monitoramento (no console do cliente por enquanto)
    console.error('[Dashboard Error Boundary]:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      
      <h2 className="text-2xl font-display font-bold text-ink mb-2">
        Ops! Algo não carregou como esperado
      </h2>
      
      <p className="text-ink-soft max-w-md mb-8 leading-relaxed">
        Tivemos um problema temporário ao processar esta página. 
        Geralmente, um simples recarregamento resolve o problema.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => reset()}
          className="bg-terracotta hover:bg-terracotta-hover text-white rounded-full px-8 h-12 font-semibold flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Tentar novamente
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
          className="rounded-full px-8 h-12 font-semibold border-line"
        >
          Recarregar página
        </Button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <pre className="mt-8 p-4 bg-paper-2 rounded-lg text-[10px] text-ink-mute max-w-full overflow-auto text-left border border-line">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
    </div>
  )
}
