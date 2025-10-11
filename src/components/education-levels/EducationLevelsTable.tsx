'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, School, ArrowUpDown } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CrudDataTable } from '@/components/ui/crud-data-table'
import { EducationLevelDeleteDialog } from './EducationLevelDeleteDialog'
import { EducationLevelFormDialog } from './EducationLevelFormDialog'

// Define the EducationLevel type based on the Prisma model
type EducationLevel = {
  id: string
  name: string
  slug: string
  ageRange: string | null
  createdAt: Date
  updatedAt: Date
}

export function EducationLevelsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [educationLevelToDelete, setEducationLevelToDelete] = useState<EducationLevel | null>(null)
  const [educationLevelToEdit, setEducationLevelToEdit] = useState<EducationLevel | null>(null)

  // Fetch education levels on component mount
  useEffect(() => {
    fetchEducationLevels()
  }, [])

  const fetchEducationLevels = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/education-levels')
      if (!response.ok) {
        throw new Error('Failed to fetch education levels')
      }
      const data = await response.json()
      setEducationLevels(data)
    } catch (error) {
      console.error('Error fetching education levels:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (educationLevel: EducationLevel) => {
    setEducationLevelToEdit(educationLevel)
    setFormDialogOpen(true)
  }

  const handleCreate = () => {
    setEducationLevelToEdit(null)
    setFormDialogOpen(true)
  }

  const handleDelete = (educationLevel: EducationLevel) => {
    setEducationLevelToDelete(educationLevel)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!educationLevelToDelete) return

    try {
      const response = await fetch(`/api/education-levels/${educationLevelToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete education level')
      }

      // Refresh the education levels list
      fetchEducationLevels()
    } catch (error) {
      console.error('Error deleting education level:', error)
    } finally {
      setDeleteDialogOpen(false)
      setEducationLevelToDelete(null)
    }
  }

  const columns: ColumnDef<EducationLevel>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="cursor-pointer"
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'ageRange',
      header: 'Faixa Etária',
      cell: ({ row }) => {
        const ageRange = row.getValue('ageRange')
        return ageRange ? (
          <Badge variant="outline">{ageRange as string}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">Não definida</span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="cursor-pointer"
          >
            Data de Criação
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date
        return <div>{new Date(date).toLocaleDateString('pt-BR')}</div>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const educationLevel = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(educationLevel)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4 cursor-pointer" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(educationLevel)}
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4 cursor-pointer" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-4">
      <CrudDataTable
        columns={columns}
        data={educationLevels}
        isLoading={isLoading}
        searchColumn="name"
        searchPlaceholder="Buscar níveis de ensino..."
        createButtonLabel="Novo Nível de Ensino"
        onCreate={handleCreate}
        emptyState={{
          icon: <School className="h-10 w-10" />,
          title: "Nenhum nível de ensino encontrado",
          description: "Crie seu primeiro nível de ensino para começar"
        }}
      />

      {/* Diálogo de exclusão */}
      <EducationLevelDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        educationLevel={educationLevelToDelete}
      />
      
      {/* Diálogo de criação/edição */}
      <EducationLevelFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        educationLevel={educationLevelToEdit || undefined}
        onSuccess={fetchEducationLevels}
      />
    </div>
  )
}
