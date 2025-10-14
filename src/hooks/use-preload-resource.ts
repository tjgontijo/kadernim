'use client'

import { useCallback } from 'react'
import { useIsMobile } from './use-mobile'

export function usePreloadResource() {
  const isMobile = useIsMobile()

  // Função para pré-carregar um recurso específico
  const preloadResource = useCallback((id: string) => {
    // Pré-carrega a página do recurso
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = `/resources/${id}`
    document.head.appendChild(link)
  }, [])

  // Função para pré-carregar os primeiros recursos visíveis
  const preloadVisibleResources = useCallback((resourceIds: string[]) => {
    // No mobile, limitamos a quantidade de recursos pré-carregados para economizar dados
    const limit = isMobile ? 3 : 6
    
    resourceIds.slice(0, limit).forEach(id => {
      preloadResource(id)
    })
  }, [preloadResource, isMobile])

  return { preloadResource, preloadVisibleResources }
}