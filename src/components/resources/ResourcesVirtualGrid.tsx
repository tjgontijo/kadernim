'use client'

import { useState, useEffect, useMemo } from 'react'
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
}

export function ResourcesVirtualGrid({ resources, isPremium }: ResourcesVirtualGridProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const { columnCount, itemWidth } = useMemo(() => {
    // Ajustar padding para mobile - mais espaço nas laterais
    const isMobile = windowSize.width <= 640
    const padding = isMobile ? 32 : 32 // 16px de cada lado no mobile, 16px no desktop
    const containerWidth = Math.max(windowSize.width - padding, 280)
    
    const minItemWidth = isMobile ? 280 : 300
    const maxItemWidth = isMobile ? 350 : 380
    const gap = isMobile ? 16 : 24 // Gap menor no mobile

    let cols = Math.floor((containerWidth + gap) / (minItemWidth + gap))
    cols = Math.max(1, Math.min(cols, 4)) // Between 1 and 4 columns

    const actualItemWidth = Math.min(
      maxItemWidth,
      Math.floor((containerWidth - (cols - 1) * gap) / cols)
    )

    return {
      columnCount: cols,
      itemWidth: actualItemWidth
    }
  }, [windowSize.width])

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

  if (windowSize.width === 0) {
    return <div className="h-96 flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="w-full px-4 md:px-0">
      <div 
        className="grid gap-4 md:gap-6 justify-center"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(${itemWidth}px, 1fr))`
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
    </div>
  )
}