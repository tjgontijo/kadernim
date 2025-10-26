"use client"

import { useEffect, useCallback } from "react"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"

export default function ServiceWorkerUpdate() {
  const updateServiceWorker = useCallback(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      })
    }
  }, [])

  const checkForUpdates = useCallback(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update()
        }
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const handleControllerChange = () => {
        window.location.reload()
      }

      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          toast.success('Nova versão disponível!', {
            description: 'Clique para atualizar o aplicativo',
            action: {
              label: 'Atualizar',
              onClick: () => {
                updateServiceWorker()
                setTimeout(() => window.location.reload(), 100)
              }
            },
            duration: 10000,
            icon: <RefreshCw className="h-4 w-4" />
          })
        }
      }

      // Detectar quando um novo service worker está disponível
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', handleMessage)

      // Verificar atualizações periodicamente (a cada 30 minutos)
      const interval = setInterval(checkForUpdates, 30 * 60 * 1000)

      // Verificar imediatamente quando o componente monta
      checkForUpdates()

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        navigator.serviceWorker.removeEventListener('message', handleMessage)
        clearInterval(interval)
      }
    }
  }, [updateServiceWorker, checkForUpdates])

  return null
}