'use client'

import { ResourceCard } from './ResourceCard'

type Resource = {
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
  createdAt: string
  updatedAt: string
}

interface ResourcesVirtualGridProps {
  resources: Resource[]
  isPremium: boolean
  className?: string
}

export function ResourcesVirtualGrid({ resources, isPremium, className }: ResourcesVirtualGridProps) {
  const gridClassName = className
    ? `grid gap-4 sm:gap-6 ${className}`
    : 'grid gap-4 sm:gap-6'

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum recurso encontrado
        </h3>
        <p className="text-gray-500 max-w-md">
          Não encontramos recursos que correspondam aos seus critérios de busca. 
          Tente ajustar os filtros ou buscar por outros termos.
        </p>
      </div>
    )
  }

  return (
    <div 
      className={gridClassName}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
      }}
    >
      {resources.map((resource) => (
        <ResourceCard 
          key={resource.id} 
          resource={resource} 
          userInfo={{ isPremium, premiumExpiresAt: null }} 
        />
      ))}
    </div>
  )
}