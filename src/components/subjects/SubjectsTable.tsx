'use client'

import { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, BookOpen, ArrowUpDown } from 'lucide-react'
import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { CustomEmpty } from '@/components/ui/custom-empty'
import { DataTable } from '@/components/ui/data-table'
import { SubjectDeleteDialog } from './SubjectDeleteDialog'
import { SubjectFormDialog } from './SubjectFormDialog'

// Define the Subject type based on the Prisma model
type Subject = {
  id: string
  name: string
  slug: string
  iconName: string | null
  createdAt: Date
  updatedAt: Date
}

export function SubjectsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  
  // Estado para os diálogos
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null)

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/subjects')
      if (!response.ok) {
        throw new Error('Failed to fetch subjects')
      }
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (subject: Subject) => {
    setSubjectToEdit(subject)
    setFormDialogOpen(true)
  }

  const handleCreate = () => {
    setSubjectToEdit(null)
    setFormDialogOpen(true)
  }

  const handleDelete = (subject: Subject) => {
    setSubjectToDelete(subject)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!subjectToDelete) return

    try {
      const response = await fetch(`/api/subjects/${subjectToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete subject')
      }

      // Refresh the subjects list
      fetchSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
    } finally {
      setDeleteDialogOpen(false)
      setSubjectToDelete(null)
    }
  }

  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <div>{row.getValue('slug')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        const subject = row.original
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(subject)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4 cursor-pointer" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(subject)}
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

      {subjects.length === 0 && !isLoading ? (
        <CustomEmpty
          icon={<BookOpen className="h-10 w-10" />}
          title="Nenhuma disciplina encontrada"
          description="Crie sua primeira disciplina para começar"
          action={
            <Button onClick={handleCreate} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4 cursor-pointer" />
              Nova Disciplina
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={subjects}
          isLoading={isLoading}
          searchColumn="name"
          searchPlaceholder="Buscar disciplinas..."
          actionButton={
            <Button onClick={handleCreate} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4 cursor-pointer" />
              Nova Disciplina
            </Button>
          }
        />
      )}

      {/* Diálogo de exclusão */}
      <SubjectDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        subject={subjectToDelete}
      />
      
      {/* Diálogo de criação/edição */}
      <SubjectFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        subject={subjectToEdit || undefined}
        onSuccess={fetchSubjects}
      />
    </div>
  )
}
