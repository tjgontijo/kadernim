'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Verificar se o navegador suporta Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado neste navegador');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  }, []);

  return null;
}
