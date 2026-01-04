/**
 * Service Worker Update Listener
 *
 * Detecta quando há uma nova versão do Service Worker disponível
 * e notifica a aplicação para mostrar prompt de atualização ao usuário.
 *
 * Como funciona:
 * 1. Browser verifica periodicamente se /sw.js mudou
 * 2. Quando detecta mudança, dispara evento 'updatefound'
 * 3. Este listener captura e chama onUpdateAvailable
 * 4. UI mostra prompt pro usuário decidir quando atualizar
 */

export interface SwUpdateListenerOptions {
  /**
   * Callback chamado quando nova versão do SW está disponível
   */
  onUpdateAvailable: (registration: ServiceWorkerRegistration) => void;

  /**
   * Callback chamado quando atualização é instalada e ativa
   */
  onUpdateInstalled?: () => void;
}

/**
 * Registra listener para detectar atualizações do Service Worker
 */
export function registerSwUpdateListener(options: SwUpdateListenerOptions) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW Update] Service Worker não suportado');
    return null;
  }

  const { onUpdateAvailable, onUpdateInstalled } = options;

  // Listener para quando controller muda (update foi ativado)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    console.log('[SW Update] Controller mudou, recarregando página...');
    onUpdateInstalled?.();
    window.location.reload();
  });

  // Registra o Service Worker e configura listeners
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('[SW Update] Service Worker registrado');

      // Listener para quando novo SW é encontrado
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        console.log('[SW Update] Nova versão detectada, aguardando instalação...');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Novo SW instalado e há um SW ativo (update disponível)
            console.log('[SW Update] Nova versão instalada e pronta, notificando usuário...');
            onUpdateAvailable(registration);
          }
        });
      });

      // Verificar se já existe update esperando
      if (registration.waiting && navigator.serviceWorker.controller) {
        console.log('[SW Update] Update já disponível (detectado na inicialização)');
        onUpdateAvailable(registration);
      }

      // Forçar check manual a cada 1 hora (em adição ao check automático do browser)
      setInterval(() => {
        console.log('[SW Update] Verificando atualizações manualmente...');
        registration.update();
      }, 60 * 60 * 1000); // 1 hora
    })
    .catch((error) => {
      console.error('[SW Update] Erro ao registrar Service Worker:', error);
    });
}

/**
 * Ativa a atualização do Service Worker
 * (envia mensagem pro SW waiting fazer skipWaiting)
 */
export function activateUpdate(registration: ServiceWorkerRegistration) {
  const waiting = registration.waiting;
  if (!waiting) {
    console.warn('[SW Update] Nenhum SW waiting encontrado');
    return;
  }

  console.log('[SW Update] Ativando nova versão...');

  // Envia mensagem pro SW fazer skipWaiting()
  waiting.postMessage({ type: 'SKIP_WAITING' });
}
