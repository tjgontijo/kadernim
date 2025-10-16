'use client'

import { useEffect, useState } from 'react'

export type ResourceStats = {
  total: number
  free: number
  premium: number
  bySubject: Array<{ subjectId: string; subjectName: string; count: number }>
  byEducationLevel: Array<{ levelId: string; levelName: string; count: number }>
  lastUpdated: string
}

type UseResourceStatsReturn = {
  stats: ResourceStats | null
  isLoading: boolean
  error: Error | null
}

/**
 * Hook para consumir estatísticas de recursos (cacheadas no servidor)
 * Perfeito para banners/marketing que precisam de números reais
 */
export function useResourceStats(): UseResourceStatsReturn {
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function fetchStats() {
      try {
        const response = await fetch('/api/v1/stats/resources', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: ResourceStats = await response.json()
        
        if (active) {
          setStats(data)
          setError(null)
        }
      } catch (err) {
        if (!active) return
        if ((err as Error).name === 'AbortError') return
        setError(err as Error)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchStats()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  return { stats, isLoading, error }
}
