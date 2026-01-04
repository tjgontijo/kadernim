// sw-custom.js - Custom Service Worker code
// Este arquivo é importado pelo Workbox-generated SW

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Recebido SKIP_WAITING, ativando nova versão...')
        self.skipWaiting()
    }
})

// Log de versão para debug
console.log('[SW] Service Worker customizado carregado')
