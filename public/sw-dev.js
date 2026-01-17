/**
 * Service Worker para Desenvolvimento
 * 
 * Este arquivo é usado apenas em ambiente de DEV para permitir testar
 * notificações push sem os erros de precache causados pelo Turbopack/HMR.
 */

importScripts('/sw-custom.js');

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
