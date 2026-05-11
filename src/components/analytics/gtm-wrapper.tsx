'use client'

import { usePathname } from 'next/navigation'
import { GoogleTagManager } from '@next/third-parties/google'

export function GTMWrapper() {
  const pathname = usePathname()
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  if (!gtmId || pathname?.startsWith('/dashboard')) {
    return null
  }

  return <GoogleTagManager gtmId={gtmId} />
}

