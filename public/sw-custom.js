// Custom Service Worker logic for Kadernim PWA

// =========================================
// Service Worker Lifecycle
// =========================================

// Listen for SKIP_WAITING message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate new service worker immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// =========================================
// Push Notifications
// =========================================

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push recebido sem dados');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Erro ao parsear push data:', e);
    return;
  }

  const options = {
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image || undefined,
    tag: data.tag || 'kadernim-notification',
    data: {
      url: data.url || '/',
      ...data.data
    },
    vibrate: [200, 100, 200],
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Kadernim', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Look for existing window with same origin
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.navigate(urlToOpen).then(() => client.focus());
          }
        }
        // Open new window if none found
        return clients.openWindow(urlToOpen);
      })
  );
});

// Handle notification close (dismissed)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificação fechada:', event.notification.tag);
});
