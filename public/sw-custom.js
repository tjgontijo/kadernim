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
