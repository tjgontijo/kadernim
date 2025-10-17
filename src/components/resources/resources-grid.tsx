// src/components/resources/resources-grid.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, FileText, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { AdInjector } from '@/components/ads'

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
  fileCount: number
  hasAccess: boolean
}

interface ResourcesGridProps {
  resources: Resource[]
  isLoading?: boolean
}

export function ResourcesGrid({ resources, isLoading }: ResourcesGridProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleCardClick = (id: string) => {
    setLoadingId(id)
    startTransition(() => {
      router.push(`/resources/${id}`)
    })
  }

  if (isLoading && resources.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum recurso encontrado</h3>
        <p className="text-muted-foreground max-w-md">
          Tente ajustar os filtros ou a busca para encontrar o que procura.
        </p>
      </div>
    )
  }

  // Separar recursos por acesso
  const accessibleResources = resources.filter(r => r.hasAccess)
  const lockedResources = resources.filter(r => !r.hasAccess)
  const showDivider = accessibleResources.length > 0 && lockedResources.length > 0

  const renderCard = (resource: Resource, options?: { priority?: boolean }) => {
    const isCardLoading = loadingId === resource.id
    
    return (
      <Card
        key={resource.id}
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300",
          "hover:shadow-xl hover:-translate-y-1",
          !resource.hasAccess && "opacity-75 hover:opacity-100",
          isCardLoading && "pointer-events-none animate-pulse ring-2 ring-indigo-500"
        )}
        onClick={() => handleCardClick(resource.id)}
      >
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={resource.imageUrl}
          alt={resource.title}
          fill
          priority={options?.priority}
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
        
        {/* Overlay de loading */}
        {isCardLoading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
            <span className="text-white text-sm font-medium">Abrindo...</span>
          </div>
        )}

        {/* Badge de bloqueado */}
        {!resource.hasAccess && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
              <Lock className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        )}

        {/* Badge de gratuito */}
        {resource.isFree && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white">
              Gratuito
            </Badge>
          </div>
        )}

        {/* Contador de arquivos */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
            <FileText className="h-3 w-3 mr-1" />
            {resource.fileCount}
          </Badge>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[3rem]">
          {resource.title}
        </h3>

        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {resource.subjectName}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {resource.educationLevelName}
          </Badge>
        </div>
      </div>
    </Card>
    )
  }

  return (
    <div>
      {/* Recursos com acesso */}
      {accessibleResources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AdInjector injectAfter={10} variant="compact">
            {accessibleResources.map((resource, index) =>
              renderCard(resource, { priority: index === 0 })
            )}
          </AdInjector>
        </div>
      )}

      {/* Divisor */}
      {showDivider && (
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
            Recursos Premium
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Recursos bloqueados */}
      {lockedResources.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AdInjector injectAfter={10} variant="compact">
            {lockedResources.map((resource, index) =>
              renderCard(resource, { priority: accessibleResources.length === 0 && index === 0 })
            )}
          </AdInjector>
        </div>
      )}
    </div>
  )
}
