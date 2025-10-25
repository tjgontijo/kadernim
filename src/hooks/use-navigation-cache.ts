'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { navigationCache, CACHE_KEYS } from '@/lib/navigation-cache'

interface UseNavigationCacheOptions {
  prefetchOnHover?: boolean
  cacheTime?: number
}

export function useNavigationCache(options: UseNavigationCacheOptions = {}) {
  const router = useRouter()
  const { prefetchOnHover = true, cacheTime = 5 * 60 * 1000 } = options

  // Prefetch de dados para navegação mais rápida
  const prefetchResource = useCallback(async (resourceId: string) => {
    const cacheKey = CACHE_KEYS.RESOURCE_DETAIL(resourceId)
    
    // Se já está em cache, não precisa fazer prefetch
    if (navigationCache.has(cacheKey)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/resources/${resourceId}`)
      if (response.ok) {
        const data = await response.json()
        navigationCache.set(cacheKey, data, cacheTime)
      }
    } catch (error) {
      console.warn('Falha no prefetch do recurso:', error)
    }
  }, [cacheTime])

  // Prefetch da lista de recursos
  const prefetchResourcesList = useCallback(async (params: URLSearchParams = new URLSearchParams()) => {
    const cacheKey = CACHE_KEYS.RESOURCES_LIST(params.toString())
    
    if (navigationCache.has(cacheKey)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/resources?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        navigationCache.set(cacheKey, data, cacheTime)
      }
    } catch (error) {
      console.warn('Falha no prefetch da lista de recursos:', error)
    }
  }, [cacheTime])

  // Navegação otimizada com cache
  const navigateToResource = useCallback((resourceId: string) => {
    // Prefetch dos dados antes da navegação
    prefetchResource(resourceId)
    
    // Usar router.push para navegação
    router.push(`/resources/${resourceId}`)
  }, [router, prefetchResource])

  // Voltar para lista com cache
  const navigateToResourcesList = useCallback((params?: URLSearchParams) => {
    const searchParams = params?.toString() || ''
    
    // Prefetch da lista se necessário
    prefetchResourcesList(params)
    
    // Navegação
    const url = searchParams ? `/resources?${searchParams}` : '/resources'
    router.push(url)
  }, [router, prefetchResourcesList])

  // Invalidar cache quando necessário
  const invalidateCache = useCallback((pattern?: string) => {
    if (pattern) {
      navigationCache.invalidatePattern(pattern)
    } else {
      navigationCache.clear()
    }
  }, [])

  // Handlers para eventos de hover (prefetch)
  const handleResourceHover = useCallback((resourceId: string) => {
    if (prefetchOnHover) {
      prefetchResource(resourceId)
    }
  }, [prefetchOnHover, prefetchResource])

  // Limpar cache quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Não limpar o cache aqui, pois queremos mantê-lo para navegação
    }
  }, [])

  return {
    prefetchResource,
    prefetchResourcesList,
    navigateToResource,
    navigateToResourcesList,
    invalidateCache,
    handleResourceHover,
  }
}