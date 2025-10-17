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

interface MetadataResponse {
  subjects: Subject[]
  educationLevels: EducationLevel[]
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
      revalidateOnMount: true,
      dedupingInterval: 30000, // Cache de 30s no cliente
    }
  )

  return {
    subjects: data?.subjects || [],
    educationLevels: data?.educationLevels || [],
    stats: data?.stats || null,
    isLoading,
    error: error?.message
  }
}
