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
        console.log('[PWA] Service Worker registrado');

        const checkVersionAndNotify = (worker: ServiceWorker) => {
          fetch('/version.json?t=' + Date.now())
            .then(res => res.json())
            .then(data => {
              const newVersion = data.version;
              if (newVersion === currentVersion) return; // Evita notificar a versão atual

              const versionDisplay = currentVersion ? `v${currentVersion} → v${newVersion}` : `v${newVersion}`;

              toast('Nova versão disponível!', {
                description: versionDisplay,
                duration: Infinity,
                action: {
                  label: 'Atualizar',
                  onClick: () => {
                    worker.postMessage({ type: 'SKIP_WAITING' });
                  },
                },
              });
            })
            .catch(() => {
              // Fallback se não conseguir pegar a versão: notifica de qualquer jeito
              toast('Nova versão disponível!', {
                description: 'Clique para atualizar e receber as novidades.',
                duration: Infinity,
                action: {
                  label: 'Atualizar',
                  onClick: () => {
                    worker.postMessage({ type: 'SKIP_WAITING' });
                  },
                },
              });
            });
        };

        if (registration.waiting) {
          checkVersionAndNotify(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              checkVersionAndNotify(newWorker);
            }
          });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        // Verificar a cada 1 minuto (em vez de 5)
        const interval = setInterval(() => registration.update(), 60 * 1000);

        // Forçar verificação quando o app volta para o primeiro plano (foreground)
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update();
          }
        };
        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
          clearInterval(interval);
          window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      })
      .catch((error) => console.error('[PWA] Erro ao registrar SW:', error))
  }, [currentVersion])

  return null
}
