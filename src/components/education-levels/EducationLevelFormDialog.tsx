'use client'

import React, { useState, useEffect } from 'react'
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

// Tipo para o nível de ensino existente
type EducationLevel = {
  id: string
  name: string
  ageRange: string | null
  createdAt: Date
  updatedAt: Date
}

interface EducationLevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  educationLevel?: EducationLevel
  onSuccess?: () => void
}

// Definir o schema de validação
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  ageRange: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function EducationLevelFormDialog({ 
  open, 
  onOpenChange, 
  educationLevel,
  onSuccess 
}: EducationLevelFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!educationLevel

  // Definir valores padrão do formulário
  const defaultValues = React.useMemo(() => ({
    name: '',
    ageRange: '',
  }), [])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  
  // Reset form values when educationLevel changes
  useEffect(() => {
    if (educationLevel) {
      form.reset({
        name: educationLevel.name,
        ageRange: educationLevel.ageRange || '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [form, educationLevel, defaultValues])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      const url = isEditing 
        ? `/api/education-levels/${educationLevel.id}` 
        : '/api/education-levels'
      
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
        throw new Error(error.message || 'Ocorreu um erro ao salvar o nível de ensino')
      }

      toast.success(
        isEditing ? 'Nível de ensino atualizado com sucesso!' : 'Nível de ensino criado com sucesso!'
      )
      
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Erro ao salvar nível de ensino:', error)
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o nível de ensino')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Nível de Ensino' : 'Novo Nível de Ensino'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os detalhes do nível de ensino abaixo.' 
              : 'Preencha os detalhes para criar um novo nível de ensino.'}
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
                      placeholder="Ex: Educação Infantil" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa etária (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: 0-5 anos" 
                      {...field} 
                      value={field.value || ''}
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
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="cursor-pointer"
              >
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
