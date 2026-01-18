// Custom Service Worker logic for Kadernim PWA
// This file is imported by the generated sw.js

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
  if (!event.data) return;

  try {
    const data = event.data.json();
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

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('[SW] Erro ao processar push data:', error);

    // Fallback para texto plano se não for JSON
    const text = event.data.text();
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
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Se já tiver uma janela aberta, focar nela e navegar
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              if (focusedClient) return focusedClient.navigate(urlToOpen);
              return undefined;
            });
          }
        }
        // Se não tiver janela, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }

        return undefined;
      })
  );
});
