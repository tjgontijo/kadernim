'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Verificar se o navegador suporta Service Worker
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado neste navegador');
      return;
    }

    // Só registrar em produção
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log('Service Worker desabilitado em ambiente de desenvolvimento');
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
