'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  const handleUpdate = () => {
    if (waitingWorker) {
      // Envia mensagem para o SW ativar imediatamente
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdatePrompt(false)

      // Recarrega a página após o SW assumir
      window.location.reload()
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado')

        // Verifica se já há uma versão esperando
        if (registration.waiting) {
          setWaitingWorker(registration.waiting)
          setShowUpdatePrompt(true)
        }

        // Detecta quando uma nova versão está disponível
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Há uma nova versão pronta
              setWaitingWorker(newWorker)
              setShowUpdatePrompt(true)

              toast('Nova versão disponível!', {
                description: 'Toque para atualizar o app.',
                duration: Infinity,
                action: {
                  label: 'Atualizar',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  },
                },
              })
            }
          })
        })

        // Listener para quando o SW assume controle
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

        // Verifica por atualizações periodicamente (a cada 60 segundos)
        setInterval(() => {
          registration.update()
        }, 60 * 1000)
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar SW:', error)
      })
  }, [])

  // Componente visual de update (além do toast)
  if (showUpdatePrompt && waitingWorker) {
    return (
      <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="font-medium text-sm">Nova versão disponível!</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            className="rounded-xl font-bold"
          >
            Atualizar
          </Button>
        </div>
      </div>
    )
  }

  return null
}
