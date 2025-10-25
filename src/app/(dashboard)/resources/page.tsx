// src/app/(dashboard)/resources/page.tsx
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { ResourcesVirtualGrid } from '@/components/resources/ResourcesVirtualGrid'
import { ResourceFilters } from '@/components/resources/ResourceFilters'
import { AdSlot } from '@/components/ads/AdSlot'
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = `${baseUrl}/api/v1/resources?${searchParams.toString()}`

  // Obter cookies para autenticação
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    next: { 
      revalidate: 60, // Cache por 60 segundos
      tags: ['resources'] // Tag para invalidação seletiva
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch resources')
  }

  return response.json()
}

function ResourcesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams
  
  return (
    <div className="container mx-auto px-2 md:px-4 py-6 space-y-6 max-w-7xl">
      {/* Ad Slot */}
      <AdSlot 
        slot="header" 
        variant='compact'
        className="w-full max-w-4xl mx-auto"
      />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Recursos Pedagógicos
          </h1>
          <p className="text-gray-600 mt-1">
            Explore nossa biblioteca de materiais educacionais
          </p>
        </div>
        
        <Suspense fallback={<div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />}>
          <ResourceFiltersWrapper params={params} />
        </Suspense>
      </div>



      {/* Resources Grid */}
      <Suspense fallback={<ResourcesLoading />}>
        <ResourcesContent params={params} />
      </Suspense>

      {/* Bottom Ad */}
      <AdSlot 
        slot="footer" 
        variant='compact'
        className="w-full max-w-4xl mx-auto"
      />
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
      <div className="space-y-6">
        {/* Virtual Grid */}
        <ResourcesVirtualGrid 
          resources={data.resources}
          isPremium={data.userInfo.isPremium}
        />
      </div>
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
