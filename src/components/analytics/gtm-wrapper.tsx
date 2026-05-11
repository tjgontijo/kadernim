'use client'

import { usePathname } from 'next/navigation'
import { GoogleTagManager } from '@next/third-parties/google'

export function GTMWrapper() {
  const pathname = usePathname()
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID

  const isLoggedArea =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/account') ||
    pathname?.startsWith('/billing') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/favorites') ||
    pathname?.startsWith('/planner') ||
    pathname?.startsWith('/question-bank') ||
    pathname?.startsWith('/resources/create') ||
    (pathname?.startsWith('/resources/') && pathname?.endsWith('/edit'))

  if (!gtmId || isLoggedArea) {
    return null
  }

  return <GoogleTagManager gtmId={gtmId} />
}
