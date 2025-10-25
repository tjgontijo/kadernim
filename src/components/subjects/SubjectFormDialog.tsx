'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Definir o schema de validação
const subjectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
})

type SubjectFormValues = z.infer<typeof subjectFormSchema>

// Tipo para a disciplina existente
type Subject = {
  id: string
  name: string
  iconName: string | null
  createdAt: Date
  updatedAt: Date
}

interface SubjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: Subject
  onSuccess?: () => void
}

export function SubjectFormDialog({ 
  open, 
  onOpenChange, 
  subject,
  onSuccess 
}: SubjectFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!subject

  // Definir valores padrão do formulário
  const defaultValues: Partial<SubjectFormValues> = {
    name: subject?.name || '',
  }

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues,
  })
  
  // Reset form values when subject changes
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
      })
    } else {
      form.reset({
        name: '',
      })
    }
  }, [form, subject])

  const onSubmit = async (data: SubjectFormValues) => {
    setIsLoading(true)

    try {
      const url = isEditing 
        ? `/api/subjects/${subject.id}` 
        : '/api/subjects'
      
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ocorreu um erro ao salvar a disciplina')
      }

      toast.success(
        isEditing ? 'Disciplina atualizada com sucesso!' : 'Disciplina criada com sucesso!'
      )
      
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error)
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a disciplina')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os detalhes da disciplina abaixo.' 
              : 'Preencha os detalhes para criar uma nova disciplina.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Matemática" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2 h-4 w-4" />}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
