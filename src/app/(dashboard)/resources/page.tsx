// src/app/(dashboard)/resources/page.tsx
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { ResourcesVirtualGrid } from '@/components/resources/ResourcesVirtualGrid'
import { ResourceFilters } from '@/components/resources/ResourceFilters'
import { AdSlot } from '@/components/ads/AdSlot'
import { ResourceListSkeleton } from '@/components/ui/resource-skeleton'
import type { UnifiedResourcesResponse } from '@/app/api/v1/resources/route'

interface ResourcesPageProps {
  searchParams: Promise<{
    subjectId?: string
    educationLevelId?: string
    search?: string
  }>
}

async function fetchResources(params: {
  subjectId?: string
  educationLevelId?: string
  search?: string
}): Promise<UnifiedResourcesResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.subjectId) searchParams.set('subjectId', params.subjectId)
  if (params.educationLevelId) searchParams.set('educationLevelId', params.educationLevelId)
  if (params.search) searchParams.set('search', params.search)

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')

  if (!host) {
    throw new Error('Host não disponível para montar URL da API')
  }

  const protocol = headerList.get('x-forwarded-proto') ?? 'http'
  const baseUrl = `${protocol}://${host}`
  const url = `${baseUrl}/api/v1/resources?${searchParams.toString()}`

  const response = await fetch(url, {
    headers: {
      cookie: headerList.get('cookie') ?? ''
    },
    next: { 
      revalidate: 180, // Cache por 180 segundos
      tags: ['resources'] // Tag para invalidação seletiva
    }
  })

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error('Failed to fetch resources')
  }

  return response.json()
}

function ResourcesLoading() {
  return (
    <div className="space-y-6">
      <ResourceListSkeleton count={12} />
    </div>
  )
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams
  
  return (
    <div className="min-h-screen">
      {/* Container principal com padding responsivo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Ad Slot */}
        <div className="mb-6">
          <AdSlot 
            slot="header" 
            variant='compact'
            className="w-full max-w-4xl mx-auto"
          />
        </div>

        {/* Header Section - Título à esquerda, filtro à direita */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Recursos Pedagógicos
            </h1>
            <p className="text-gray-600 mt-1">
              Explore nossa biblioteca de materiais educacionais
            </p>
          </div>
          
          <div className="flex-shrink-0 sm:self-end">
            <Suspense fallback={<div className="h-12 w-64 bg-gray-200 rounded-full animate-pulse" />}>
              <ResourceFiltersWrapper params={params} />
            </Suspense>
          </div>
        </div>

        {/* Resources Grid Section */}
        <div className="mb-6">
          <Suspense fallback={<ResourcesLoading />}>
            <ResourcesContent params={params} />
          </Suspense>
        </div>

        {/* Bottom Ad */}
        <div className="mt-8">
          <AdSlot 
            slot="footer" 
            variant='compact'
            className="w-full max-w-4xl mx-auto"
          />
        </div>
      </div>
    </div>
  )
}

async function ResourceFiltersWrapper({ 
  params 
}: { 
  params: { subjectId?: string; educationLevelId?: string; search?: string } 
}) {
  try {
    const data = await fetchResources(params)
    
    return (
      <ResourceFilters 
        subjects={data.metadata.subjects}
        educationLevels={data.metadata.educationLevels}
        className="w-full sm:w-auto sm:min-w-[320px]"
      />
    )
  } catch (error) {
    console.error('Error loading filters:', error)
    return <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
  }
}

async function ResourcesContent({ 
  params 
}: { 
  params: { subjectId?: string; educationLevelId?: string; search?: string } 
}) {
  try {
    const data = await fetchResources(params)
    
    return (
      <ResourcesVirtualGrid 
        resources={data.resources}
        isPremium={data.userInfo.isPremium}
        className="justify-center md:justify-start"
      />
    )
  } catch (error) {
    console.error('Error loading resources:', error)
    
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar recursos
          </h3>
          <p className="text-gray-600">
            Não foi possível carregar os recursos. Tente novamente.
          </p>
        </div>
      </div>
    )
  }
}
