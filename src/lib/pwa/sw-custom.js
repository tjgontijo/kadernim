// Custom Service Worker logic for Kadernim PWA
// This file is copied to public/sw-custom.js during the build process
// Source: src/lib/pwa/sw-custom.js

// Listen for the SKIP_WAITING message from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

// Activate the new service worker immediately when it takes over
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim())
})

// --- PUSH NOTIFICATIONS ---

// Escutar evento de Push
self.addEventListener('push', (event) => {
    console.log('[SW] Evento de Push recebido!');

    if (!event.data) {
        console.warn('[SW] Push recebido mas sem dados.');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[SW] Dados do Push (JSON):', data);

        const title = data.title || 'Kadernim';

        // Helper para validar se o valor é um caminho válido (URL ou path relativo)
        const isPath = (val) => val && (val.startsWith('/') || val.startsWith('http'));

        const options = {
            body: data.body,
            icon: isPath(data.icon) ? data.icon : '/images/icons/apple-icon.png',
            badge: isPath(data.badge) ? data.badge : '/pwa/manifest-icon-192.maskable.png',
            image: isPath(data.image) ? data.image : undefined,
            tag: data.tag || 'kadernim-push',
            data: {
                url: data.url || '/'
            },
            // Vibrar: [on, off, on] em ms
            vibrate: [100, 50, 100],
            // Requer interação do usuário para fechar em alguns OS/Navs
            requireInteraction: true
        };

        console.log('[SW] Exibindo notificação:', title, options);
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('[SW] Erro ao processar push data (provavelmente não é JSON):', error);

        // Fallback para texto plano se não for JSON
        const text = event.data.text();
        console.log('[SW] Fallback para texto:', text);

        event.waitUntil(
            self.registration.showNotification('Kadernim', {
                body: text,
                icon: '/images/icons/apple-icon.png'
            })
        );
    }
});

// Escutar clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notificação clicada!', event.notification.tag);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                console.log(`[SW] Buscando janelas abertas para focar: ${windowClients.length}`);
                // Se já tiver uma janela aberta, focar nela e navegar
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.includes(location.origin) && 'focus' in client) {
                        console.log('[SW] Focando em janela existente:', client.url);
                        return client.focus().then((focusedClient) => {
                            if (focusedClient) return focusedClient.navigate(urlToOpen);
                            return undefined;
                        });
                    }
                }
                // Se não tiver janela, abrir uma nova
                if (clients.openWindow) {
                    console.log('[SW] Abrindo nova janela:', urlToOpen);
                    return clients.openWindow(urlToOpen);
                }

                return undefined;
            })
    );
});
