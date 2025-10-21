// src/app/(dashboard)/resources/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { ResourcesFilters } from '@/components/resources/resources-filters'
import { ResourcesGrid } from '@/components/resources/resources-grid'
import { useResourcesLibrary } from '@/hooks/use-resources-library'
import { useResourcesMetadata } from '@/hooks/use-resources-metadata'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { AdSlot } from '@/components/ads'

export default function ResourcesPage() {
  const [filters, setFilters] = useState({
    subjectId: 'all',
    educationLevelId: 'all'
  })
  const [displayedCount, setDisplayedCount] = useState(24)
  const ITEMS_PER_LOAD = 24

  // Buscar metadados
  const {
    subjects,
    educationLevels,
    stats,
    isLoading: metadataLoading,
    error: metadataError
  } = useResourcesMetadata()

  // Buscar recursos com filtros (buscar todos de uma vez)
  const {
    resources,
    isLoading: resourcesLoading,
    errorMessage: resourcesError
  } = useResourcesLibrary({
    page: 1,
    pageSize: 1000, // Buscar todos
    subjectId: filters.subjectId !== 'all' ? filters.subjectId : undefined,
    educationLevelId: filters.educationLevelId !== 'all' ? filters.educationLevelId : undefined
  })

  // Handler para mudança de filtros
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setDisplayedCount(ITEMS_PER_LOAD) // Resetar contagem ao filtrar
  }, [ITEMS_PER_LOAD])

  // Handler para carregar mais
  const handleLoadMore = useCallback(() => {
    setDisplayedCount(prev => prev + ITEMS_PER_LOAD)
  }, [ITEMS_PER_LOAD])

  // Recursos exibidos
  const displayedResources = resources.slice(0, displayedCount)
  const hasMore = displayedCount < resources.length

  // Loading inicial
  if (metadataLoading && !stats) {
    return (
      <div className="container mx-auto py-4 px-4 md:px-6 max-w-7xl">
        <div className="mb-6">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-24" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full rounded-xl" />
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
    )
  }

  // Erro nos metadados
  if (metadataError) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar informações da biblioteca. Tente recarregar a página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 md:px-6 max-w-7xl">
      {/* Banner Premium - Topo */}
      <div className="mb-6">
        <AdSlot 
          slot="header" 
          variant="compact" 
          creative="conversion"
        />
      </div>

      {/* Filtros */}
      <ResourcesFilters
        subjects={subjects}
        educationLevels={educationLevels}
        onFilterChange={handleFilterChange}
      />

      {/* Erro ao carregar recursos */}
      {resourcesError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{resourcesError}</AlertDescription>
        </Alert>
      )}

      {/* Grid de recursos */}
      <ResourcesGrid
        resources={displayedResources}
        isLoading={resourcesLoading}
      />

      {/* Botão Carregar Mais */}
      {!resourcesLoading && hasMore && (
        <div className="flex justify-center mt-8 mb-4">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Carregar mais {Math.min(ITEMS_PER_LOAD, resources.length - displayedCount)} recursos
          </button>
        </div>
      )}

      {/* Contador de recursos */}
      {!resourcesLoading && resources.length > 0 && (
        <div className="text-center text-sm text-muted-foreground mt-4 mb-8">
          Exibindo {displayedResources.length} de {resources.length} recursos
        </div>
      )}
    </div>
  )
}
