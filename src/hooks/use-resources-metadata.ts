// src/hooks/use-resources-metadata.ts
'use client'

import useSWR from 'swr'

interface Subject {
  id: string
  name: string
  slug: string
}

interface EducationLevel {
  id: string
  name: string
  slug: string
}

interface LibraryStats {
  isPremium: boolean
  isAdmin: boolean
}

interface ResourceStats {
  total: number
  free: number
  premium: number
}

interface MetadataResponse {
  subjects: Subject[]
  educationLevels: EducationLevel[]
  resourceStats: ResourceStats
  stats: LibraryStats | null
}

const fetcher = (url: string) => fetch(url, {
  credentials: 'include'
}).then(res => {
  if (!res.ok) throw new Error('Erro ao carregar metadados')
  return res.json()
})

export function useResourcesMetadata() {
  const { data, error, isLoading } = useSWR<MetadataResponse>(
    '/api/v1/resources/metadata',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      dedupingInterval: 21600000, // Cache de 6 horas (mudam raramente)
      revalidateIfStale: false,
    }
  )

  return {
    subjects: data?.subjects || [],
    educationLevels: data?.educationLevels || [],
    resourceStats: data?.resourceStats || { total: 0, free: 0, premium: 0 },
    stats: data?.stats || null,
    isLoading,
    error: error?.message
  }
}
