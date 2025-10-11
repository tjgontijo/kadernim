// Service Worker para Kadernim PWA
const CACHE_NAME = 'kadernim-v1';
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  // Adicione outras rotas importantes aqui
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker sendo instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto');
      return cache.addAll(urlsToCache);
    })
  );
  // Force o service worker a se tornar ativo imediatamente
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Garante que o service worker controle todas as páginas imediatamente
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - retorna a resposta do cache
      if (response) {
        return response;
      }
      
      // Clone da requisição
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(
        (response) => {
          // Verifica se recebemos uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }
      );
    })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon.png',
        badge: '/icon.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: data.id || '1',
          url: data.url || '/',
        },
        actions: data.actions || [
          {
            action: 'explore',
            title: 'Ver detalhes',
            icon: '/images/system/check.png'
          }
        ],
        // Configurações específicas para iOS
        tag: data.tag || 'kadernim-notification', // Agrupa notificações com a mesma tag
        renotify: data.renotify || false, // Se deve vibrar/tocar mesmo se há notificação com a mesma tag
      };
      
      console.log('Mostrando notificação:', data.title);
      event.waitUntil(
        self.registration.showNotification(data.title, options)
      );
    } catch (error) {
      console.error('Erro ao processar notificação push:', error);
      
      // Fallback para formato simples se não for JSON
      const text = event.data.text();
      event.waitUntil(
        self.registration.showNotification('Kadernim', {
          body: text,
          icon: '/icon.png'
        })
      );
    }
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Clique em notificação recebido.');
  event.notification.close();
  
  // Obter dados da notificação
  const urlToOpen = event.notification.data?.url || '/';
  
  // Lidar com ações específicas
  if (event.action === 'explore') {
    console.log('Ação "explore" selecionada');
    // Implementar lógica específica para a ação "explore"
  }
  
  // Abrir ou focar na janela existente
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Verificar se já existe uma janela/aba aberta
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não houver janela aberta, abrir uma nova
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// Evento quando uma notificação é fechada sem interação
self.addEventListener('notificationclose', (event) => {
  console.log('Notificação fechada sem clique');
  // Aqui você pode implementar analytics ou outras ações
});

// Sincronização em segundo plano (útil para enviar dados quando o usuário está offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('Sincronizando dados em segundo plano');
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados (implementar conforme necessário)
async function syncData() {
  // Implementar lógica de sincronização
  console.log('Dados sincronizados com sucesso');
}
