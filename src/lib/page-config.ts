// src/lib/page-config.ts

export interface PageConfig {
  title: string
  showBack: boolean
  backHref?: string
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  '/feed': { title: '', showBack: false },
  '/resources': { title: '', showBack: false },
  '/notifications': { title: '', showBack: false },
  '/settings': { title: '', showBack: false },
  '/plans': { title: '', showBack: true, backHref: '/resources' },
  '/requests': { title: '', showBack: true, backHref: '/resources' },
  '/admin': { title: '', showBack: true, backHref: '/settings' },
  '/admin/subjects': { title: '', showBack: true, backHref: '/admin' },
  '/admin/education-levels': { title: '', showBack: true, backHref: '/admin' },
} as const

/**
 * Obtém configuração da página baseada no pathname
 * Para rotas dinâmicas como /resources/[id], usa fallback genérico
 */
export function getPageConfig(pathname: string): PageConfig {
  // Tentar match exato primeiro
  if (pathname in PAGE_CONFIG) {
    return PAGE_CONFIG[pathname]
  }

  // Fallback para rotas dinâmicas
  if (pathname.startsWith('/resources/') && pathname !== '/resources') {
    return { title: '', showBack: true, backHref: '/resources' }
  }

  // Default fallback
  return { title: '', showBack: false }
}
