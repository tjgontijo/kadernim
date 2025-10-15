// src/components/resources/resource-grid.tsx
'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { FileSearch } from 'lucide-react'
import { ResourceCard } from './resource-card'
import { AdInjector } from '@/components/ads'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'

interface Resource {
  id: string
  title: string
  description: string
  imageUrl: string
  subjectName: string
  educationLevelName: string
  isFree: boolean
  hasAccess: boolean
  fileCount: number
}

interface ResourceGridProps {
  resources: Resource[]
}

function ResourceGridComponent({ resources }: ResourceGridProps) {
  const router = useRouter()

  if (!resources || resources.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSearch className="h-10 w-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Nenhum recurso encontrado</EmptyTitle>
          <EmptyDescription>
            Tente ajustar os filtros ou a busca para encontrar o que procura.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent />
      </Empty>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="resource-grid"
    >
      <AdInjector injectAfter={8} variant="compact">
        {resources.map(resource => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            title={resource.title}            
            imageUrl={resource.imageUrl}
            hasAccess={resource.hasAccess}            
            onClick={() => router.push(`/resources/${resource.id}`)}
          />
        ))}
      </AdInjector>
    </div>
  )
}

export const ResourceGrid = memo(ResourceGridComponent)
