'use client'

import { useEffect, useRef } from 'react'

export default function ServiceWorkerRegister() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Service Worker apenas em produção
    const isProduction = process.env.NODE_ENV === 'production'

    if (!isProduction) {
      console.log('[PWA] Service Worker desabilitado em desenvolvimento')
      return
    }

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Evitar registro duplicado
    if (registrationRef.current) {
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        registrationRef.current = registration
        console.log('[PWA] Service Worker registrado')

        // Função para atualizar automaticamente
        const autoUpdate = (worker: ServiceWorker) => {
          console.log('[PWA] Nova versão detectada, atualizando automaticamente...')
          worker.postMessage({ type: 'SKIP_WAITING' })
        }

        // Se já tem um SW aguardando, atualizar
        if (registration.waiting) {
          autoUpdate(registration.waiting)
        }

        // Escutar quando um novo SW for instalado
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // Novo SW instalado e há um controller ativo (significa que é uma atualização)
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              autoUpdate(newWorker)
            }
          })
        })

        // Quando o controller mudar (novo SW assumiu), recarregar a página
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return
          refreshing = true
          console.log('[PWA] Novo Service Worker ativo, recarregando...')
          window.location.reload()
        })

        // Verificar atualizações a cada 5 minutos (não 1 minuto)
        const interval = setInterval(() => {
          registration.update().catch(err => {
            console.warn('[PWA] Erro ao verificar atualizações:', err)
          })
        }, 5 * 60 * 1000)

        // Verificar quando o app volta para o primeiro plano
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(err => {
              console.warn('[PWA] Erro ao verificar atualizações:', err)
            })
          }
        }
        window.addEventListener('visibilitychange', handleVisibilityChange)

        // Cleanup
        return () => {
          clearInterval(interval)
          window.removeEventListener('visibilitychange', handleVisibilityChange)
        }
      } catch (error) {
        console.error('[PWA] Erro ao registrar Service Worker:', error)
      }
    }

    registerSW()
  }, []) // Sem dependências - roda apenas uma vez

  return null
}
