import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  if (!process.env.NEXT_PUBLIC_APP_NAME) {
    throw new Error('NEXT_PUBLIC_APP_NAME não está definido no .env')
  }

  if (!process.env.NEXT_PUBLIC_APP_DESCRIPTION) {
    throw new Error('NEXT_PUBLIC_APP_DESCRIPTION não está definido no .env')
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME
  const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION

  return {
    id: '/?source=pwa',
    name: appName,
    short_name: appName,
    description: appDescription,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F6F8', // Cor de fundo do splash nativo
    theme_color: '#2563EB', // Cor da status bar
    icons: [
      // Ícones normais (any) - OBRIGATÓRIO para iOS
      {
        src: '/pwa/apple-icon-180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/system/icon-1024x1024.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any'
      },
      // Ícones maskable para Android adaptativo
      {
        src: '/pwa/manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/pwa/manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
    ],
  }
}
