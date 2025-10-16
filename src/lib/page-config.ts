// src/lib/page-config.ts

export interface PageConfig {
  title: string
  showBack: boolean
  backHref?: string
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  '/feed': { title: 'Atualizações', showBack: false },
  '/resources': { title: 'Meus Recursos', showBack: false },
  '/notifications': { title: 'Notificações', showBack: false },
  '/settings': { title: 'Configurações', showBack: false },
  '/plans': { title: 'Planos Premium', showBack: true, backHref: '/resources' },
  '/requests': { title: 'Solicitações', showBack: true, backHref: '/resources' },
  '/admin': { title: 'Administração', showBack: true, backHref: '/settings' },
  '/admin/subjects': { title: 'Disciplinas', showBack: true, backHref: '/admin' },
  '/admin/education-levels': { title: 'Níveis de Ensino', showBack: true, backHref: '/admin' },
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
    return { title: 'Detalhes do Recurso', showBack: true, backHref: '/resources' }
  }

  // Default fallback
  return { title: 'Kadernim', showBack: false }
}
