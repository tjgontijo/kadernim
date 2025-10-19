// src/hooks/use-recently-acquired.ts
'use client'

import useSWR from 'swr'

interface FetcherError extends Error {
  status?: number
}

interface RecentResource {
  id: string
  title: string
  description: string
  imageUrl: string
  isFree: boolean
  subjectId: string
  subjectName: string
  educationLevelId: string
  educationLevelName: string
  hasAccess: boolean
  acquiredAt: string
}

interface RecentlyAcquiredResponse {
  resources: RecentResource[]
}

const fetcher = async (url: string): Promise<RecentlyAcquiredResponse> => {
  const res = await fetch(url, {
    credentials: 'include'
  })

  if (!res.ok) {
    let message = 'Erro ao carregar recursos recentes'
    try {
      const data = await res.json()
      if (data?.error) {
        message = data.error
      }
    } catch {
      // Ignorar erro ao decodificar JSON
    }

    const fetchError = new Error(message) as FetcherError
    fetchError.status = res.status
    throw fetchError
  }

  return res.json()
}

export function useRecentlyAcquired(limit = 10) {
  const { data, error, isLoading } = useSWR<RecentlyAcquiredResponse, FetcherError>(
    `/api/v1/resources/recently-acquired?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache de 30s no cliente
    }
  )

  return {
    resources: data?.resources || [],
    isLoading,
    error,
    errorMessage: error?.message,
    isUnauthorized: error?.status === 401,
    hasResources: (data?.resources?.length || 0) > 0
  }
}
