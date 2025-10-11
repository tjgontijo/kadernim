'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Só registrar Service Worker em produção ou localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Service Workers não funcionam bem com certificados auto-assinados via IP
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker não suportado neste navegador');
      return;
    }

    // Só registrar em localhost ou produção
    if (!isLocalhost && !isProduction) {
      console.log('Service Worker desabilitado em desenvolvimento via IP (certificado auto-assinado)');
      console.log('Use localhost ou deploy em produção para testar PWA');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
        
        // Mensagem mais amigável para erro de SSL
        if (error.name === 'SecurityError') {
          console.log('💡 Dica: Para testar PWA em desenvolvimento, use https://localhost:3000');
        }
      });
  }, []);

  return null;
}
