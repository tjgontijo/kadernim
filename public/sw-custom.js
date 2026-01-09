// Custom Service Worker logic
// Listen for the SKIP_WAITING message from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Activate the new service worker immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});
