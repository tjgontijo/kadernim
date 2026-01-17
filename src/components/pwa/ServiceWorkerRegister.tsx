'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiceWorkerRegister() {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)

  useEffect(() => {
    // Busca a versão local (do arquivo gerado no build) com cache-busting
    fetch('/version.json?v=' + Date.now())
      .then(res => res.json())
      .then(data => setCurrentVersion(data.version))
      .catch(() => console.error('[PWA] Erro ao carregar versão local'))

    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado')

        const notifyUpdate = (newWorker: ServiceWorker) => {
          // Busca a nova versão do servidor
          fetch('/version.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
              const newVersion = data.version
              const versionDisplay = currentVersion ? `v${currentVersion} → v${newVersion}` : `v${newVersion}`

              toast('Nova versão disponível!', {
                description: versionDisplay,
                duration: Infinity,
                action: {
                  label: 'Atualizar',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                  },
                },
              })
            })
        }

        if (registration.waiting) {
          notifyUpdate(registration.waiting)
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate(newWorker)
            }
          })
        })

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

        // Verificar a cada 5 minutos
        const interval = setInterval(() => registration.update(), 5 * 60 * 1000)
        return () => clearInterval(interval)
      })
      .catch((error) => console.error('[PWA] Erro ao registrar SW:', error))
  }, [currentVersion])

  return null
}
