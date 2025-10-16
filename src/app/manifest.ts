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
    name: appName,
    short_name: appName,
    description: appDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b', // Cor do background (tema escuro)
    theme_color: '#09090b', // Cor do background (tema escuro) - status bar
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
