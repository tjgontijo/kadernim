'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lock, Unlock, Calendar, Tag, Loader2 } from 'lucide-react'
import { useNavigationCache } from '@/hooks/use-navigation-cache'

interface Resource {
  id: string
  title: string
  description: string
  imageUrl: string
  subjectId: string
  subjectName: string
  educationLevelId: string
  educationLevelName: string
  isFree: boolean
  hasAccess: boolean
  createdAt: string
  updatedAt: string
}

interface UserInfo {
  isPremium: boolean
  premiumExpiresAt: string | null
}

interface ResourceCardProps {
  resource: Resource
  userInfo: UserInfo
}

export function ResourceCard({ resource, userInfo: _userInfo }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { handleResourceHover, navigateToResource } = useNavigationCache()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getAccessStatus = () => {
    if (resource.isFree) {
      return { icon: Unlock, text: 'Gratuito', color: 'text-green-600 bg-green-50' }
    }
    
    if (resource.hasAccess) {
      return { icon: Unlock, text: 'Acessível', color: 'text-blue-600 bg-blue-50' }
    }
    
    return { icon: Lock, text: 'Premium', color: 'text-orange-600 bg-orange-50' }
  }

  const handleClick = () => {
    setIsNavigating(true)
    navigateToResource(resource.id)
  }

  const handleMouseEnter = () => {
    handleResourceHover(resource.id)
  }

  const accessStatus = getAccessStatus()
  const AccessIcon = accessStatus.icon

  const isLocked = !resource.isFree && !resource.hasAccess

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 h-full flex flex-col ${
        isLocked ? 'opacity-60' : ''
      } ${isNavigating ? 'scale-[0.98] opacity-75' : ''}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {!imageError && resource.imageUrl ? (
          <Image
            src={resource.imageUrl}
            alt={resource.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-xs">Sem imagem</span>
            </div>
          </div>
        )}
        
        {/* Access Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${accessStatus.color}`}>
            <AccessIcon className="w-3 h-3" />
            {accessStatus.text}
          </span>
        </div>

        {/* Loading Overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Loader2 className="w-5 h-5 animate-spin spinner-force text-blue-600" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className={`font-semibold text-sm line-clamp-2 ${
            isLocked ? 'text-gray-500' : 'text-gray-900'
          }`}>
            {resource.title}
          </h3>
          {isLocked && (
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>

        {/* Description */}
        <p className={`text-xs line-clamp-2 mb-3 flex-1 ${
          isLocked ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {resource.description}
        </p>

        {/* Metadata */}
        <div className={`space-y-2 text-xs ${
          isLocked ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>{resource.subjectName}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(resource.createdAt)}</span>
          </div>
          
          <div className="text-xs text-gray-400">
            {resource.educationLevelName}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          {resource.hasAccess ? (
            <button
              onClick={handleClick}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center block relative ${
                isNavigating ? 'pointer-events-none' : ''
              }`}
            >
              {isNavigating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin spinner-force" style={{ animation: 'spin 1s linear infinite' }} />
                  Carregando...
                </span>
              ) : (
                'Acessar Recurso'
              )}
            </button>
          ) : (
            <button
              onClick={handleClick}
              className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center block relative ${
                isNavigating ? 'pointer-events-none' : ''
              }`}
            >
              {isNavigating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin spinner-force" style={{ animation: 'spin 1s linear infinite' }} />
                  Carregando...
                </span>
              ) : (
                'Ver Detalhes'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}