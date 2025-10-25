'use client'

// Página de edição de recurso

import { useState, useEffect } from 'react'
import { ResourceForm } from '@/components/resources/ResourceForm'

type ResourceResponse = {
  id: string
  title: string
  description: string
  imageUrl: string
  isFree: boolean
  isActive: boolean
  subjectId: string
  educationLevelId: string
  subject?: { name: string }
  educationLevel?: { name: string }
}

export default function ResourceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const [resource, setResource] = useState<ResourceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [id, setId] = useState<string | null>(null)

  // Primeiro, extrair o id do params
  useEffect(() => {
    const extractId = async () => {
      const { id: resourceId } = await params
      setId(resourceId)
    }
    extractId()
  }, [params])

  // Depois, buscar o recurso quando temos o id
  useEffect(() => {
    if (!id) return

    const fetchResource = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/resources/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch resource')
        }
        const data = await response.json()
        setResource(data)
      } catch (error) {
        console.error('Error fetching resource:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResource()
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-4">
        <p>Recurso não encontrado.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <ResourceForm resource={resource} />
    </div>
  )
}
