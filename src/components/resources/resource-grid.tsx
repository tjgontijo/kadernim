'use client'

import { ResourceCard } from './resource-card'
import { Resource } from './ResourcesClient'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { FileSearch } from 'lucide-react'
import { AdInjector } from '@/components/ads'
import { useRouter } from 'next/navigation'

interface ResourceGridProps {
  resources: Resource[]
}

export function ResourceGrid({ resources }: ResourceGridProps) {
  const router = useRouter()
  
  // Se não houver recursos, mostrar estado vazio
  if (resources.length === 0) {
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
        <EmptyContent>
          {/* Conteúdo adicional pode ser adicionado aqui se necessário */}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* AdInjector injeta banners automaticamente a cada 4 recursos */}
      <AdInjector injectAfter={8} variant="compact">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            id={resource.id}
            title={resource.title}
            description={resource.description}
            imageUrl={resource.imageUrl}
            subject={resource.subjectName}
            educationLevel={resource.educationLevelName}
            isFree={resource.isFree}
            hasAccess={resource.hasAccess}
            fileCount={resource.fileCount}
            onClick={(id: string) => {
              router.push(`/resources/${id}`)
            }}
          />
        ))}
      </AdInjector>
    </div>
  )
}
