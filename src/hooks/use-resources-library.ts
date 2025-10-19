// src/hooks/use-resources-library.ts
'use client'

import useSWR from 'swr'
import { useCallback, useMemo } from 'react'

interface FetcherError extends Error {
  status?: number
}

interface Resource {
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
}

interface Pagination {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

interface LibraryResponse {
  resources: Resource[]
  pagination: Pagination
}

interface UseResourcesLibraryOptions {
  page?: number
  pageSize?: number
  subjectId?: string
  educationLevelId?: string
}

const fetcher = async (url: string): Promise<LibraryResponse> => {
  const res = await fetch(url, {
    credentials: 'include'
  })

  if (!res.ok) {
    let message = 'Erro ao carregar recursos'
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

export function useResourcesLibrary(options: UseResourcesLibraryOptions = {}) {
  const {
    page = 1,
    pageSize = 24,
    subjectId,
    educationLevelId
  } = options

  // Construir URL com parâmetros
  const url = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    
    if (subjectId && subjectId !== 'all') {
      params.set('subjectId', subjectId)
    }
    
    if (educationLevelId && educationLevelId !== 'all') {
      params.set('educationLevelId', educationLevelId)
    }
    
    return `/api/v1/resources/my-library?${params.toString()}`
  }, [page, pageSize, subjectId, educationLevelId])

  const { data, error, isLoading, mutate } = useSWR<LibraryResponse, FetcherError>(
    url,
    fetcher,
    {
      keepPreviousData: true, // Mantém dados anteriores durante carregamento
      revalidateOnFocus: false, // Não revalida ao focar na aba
      revalidateOnReconnect: false, // Não revalida ao reconectar
      dedupingInterval: 120000, // Evita requisições duplicadas em 2min (2 minuto)
      revalidateIfStale: false, // Não revalida se dados estão "stale"
    }
  )

  const refresh = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    resources: data?.resources || [],
    pagination: data?.pagination,
    isLoading,
    error,
    errorMessage: error?.message,
    isUnauthorized: error?.status === 401,
    refresh
  }
}
