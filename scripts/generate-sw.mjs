import { generateSW } from 'workbox-build';

const swConfig = {
  swDest: 'public/sw.js',
  globDirectory: '.next',
  globPatterns: [
    'static/**/*.{js,css,woff2}',
  ],
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
      },
    },
    {
      urlPattern: ({ request }) => 
        request.destination === 'script' || request.destination === 'style',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        },
      },
    },
    {
      urlPattern: ({ request }) => request.destination === 'image',
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
        },
      },
    },
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutos
        },
      },
    },
  ],
  // Adicionar suporte a mensagens para update detection
  additionalManifestEntries: [
    { url: '/offline', revision: null }
  ],
  // Configuração para offline fallback
  navigateFallback: '/offline',
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api\//],
};

generateSW(swConfig).then(({ count, size }) => {
  console.log(`✅ Service worker gerado com sucesso!`);
  console.log(`📦 ${count} arquivos pré-cacheados, totalizando ${(size / 1024 / 1024).toFixed(2)} MB.`);
}).catch((error) => {
  console.error('❌ Erro ao gerar service worker:', error);
  process.exit(1);
});