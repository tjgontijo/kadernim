'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

// Definir o schema de validação
const subjectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  slug: z.string().min(2, {
    message: 'O slug deve ter pelo menos 2 caracteres.',
  }).regex(/^[a-z0-9-]+$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens.',
  }),
  iconName: z.string().optional(),
})

type SubjectFormValues = z.infer<typeof subjectFormSchema>

// Tipo para a disciplina existente
type Subject = {
  id: string
  name: string
  slug: string
  iconName: string | null
  createdAt: Date
  updatedAt: Date
}

interface SubjectFormProps {
  subject?: Subject
}

export function SubjectForm({ subject }: SubjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isEditing = !!subject

  // Definir valores padrão do formulário
  const defaultValues: Partial<SubjectFormValues> = {
    name: subject?.name || '',
    slug: subject?.slug || '',
    iconName: subject?.iconName || '',
  }

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues,
  })

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  // Atualizar o slug quando o nome mudar
  const currentSlug = form.watch('slug')

  // Só atualiza o slug automaticamente se o usuário não tiver modificado manualmente
  const handleNameChange = (name: string) => {
    if (!currentSlug || currentSlug === generateSlug(form.getValues('name'))) {
      form.setValue('slug', generateSlug(name), { shouldValidate: true })
    }
  }

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
      
      router.push('/dashboard/settings/subjects')
      router.refresh()
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error)
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a disciplina')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
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
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: matematica" 
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
              name="iconName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Ícone (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: math" 
                      {...field} 
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/settings/subjects')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
