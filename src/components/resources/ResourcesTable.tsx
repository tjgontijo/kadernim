'use client'

import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudDataTable } from '@/components/ui/crud-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

type Resource = {
  id: string
  title: string
  description: string
  imageUrl: string
  isFree: boolean
  createdAt: string
  updatedAt: string
  subject: {
    id: string
    name: string
  }
  educationLevel: {
    id: string
    name: string
  }
}

export function ResourcesTable() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/v1/admin/resources')
      
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      
      const data = await response.json()
      setResources(data.resources || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Erro ao carregar recursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleView = (resource: Resource) => {
    window.open(`/resources/${resource.id}`, '_blank')
  }

  const handleEdit = (resource: Resource) => {
    window.location.href = `/admin/resources/${resource.id}/edit`
  }

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Tem certeza que deseja excluir "${resource.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/v1/admin/resources/${resource.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }

      toast.success('Recurso excluído com sucesso')
      fetchResources() // Refresh the list
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Erro ao excluir recurso')
    }
  }

  const columns: ColumnDef<Resource>[] = [
    {
      accessorKey: 'imageUrl',
      header: 'Imagem',
      cell: ({ row }) => {
        const resource = row.original
        return (
          <div className="w-12 h-12 relative rounded-md overflow-hidden">
            <Image
              src={resource.imageUrl || '/placeholder-image.jpg'}
              alt={resource.title}
              fill
              className="object-cover"
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => {
        const resource = row.original
        return (
          <div className="max-w-xs">
            <p className="font-medium truncate">{resource.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {resource.description}
            </p>
          </div>
        )
      }
    },
    {
      accessorKey: 'subject.name',
      header: 'Disciplina',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.subject.name}</Badge>
      )
    },
    {
      accessorKey: 'educationLevel.name',
      header: 'Nível',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.educationLevel.name}</Badge>
      )
    },
    {
      accessorKey: 'isFree',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant={row.original.isFree ? 'default' : 'destructive'}>
          {row.original.isFree ? 'Gratuito' : 'Premium'}
        </Badge>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Criado em',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString('pt-BR')}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const resource = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(resource)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(resource)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(resource)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    }
  ]

  return (
    <CrudDataTable
      columns={columns}
      data={resources}
      isLoading={loading}
      searchColumn="title"
      searchPlaceholder="Buscar recursos..."
      emptyState={{
        icon: <div />,
        title: 'Nenhum recurso encontrado',
        description: 'Não há recursos cadastrados no sistema.'
      }}
    />
  )
}