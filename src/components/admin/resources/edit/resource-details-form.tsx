'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Layout, Settings, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/admin/shared/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import {
  UpdateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/schemas/admin/resources'
import { EducationLevelLabels } from '@/constants/educationLevel'
import { SubjectLabels } from '@/constants/subject'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ResourceDetailsFormProps {
  resource: {
    id: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    isFree: boolean
  }
}

export function ResourceDetailsForm({ resource }: ResourceDetailsFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<UpdateResourceInput>({
    resolver: zodResolver(UpdateResourceSchema),
    defaultValues: {
      title: resource.title,
      description: resource.description,
      educationLevel: resource.educationLevel,
      subject: resource.subject,
      isFree: resource.isFree,
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateResourceInput) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resource.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update resource')
      }

      return response.json()
    },
    onSuccess: () => {
      toast('Alterações salvas', {
        description: 'Os dados do recurso foram atualizados com sucesso.',
      })
      queryClient.invalidateQueries({ queryKey: ['resource-detail', resource.id] })
    },
    onError: (error) => {
      toast.error('Erro ao atualizar recurso')
      console.error('Erro ao atualizar recurso:', error)
    },
  })

  const onSubmit = (data: UpdateResourceInput) => {
    updateMutation.mutate(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8">

          {/* Main Info Card */}
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">Título do Recurso</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Introdução ao Estudo dos Gases"
                        className="bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary h-10 text-base px-3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Descrição Detalhada</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        placeholder="Descreva o conteúdo deste recurso para os alunos, use negritos, listas e até vídeos para enriquecer o material..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6 border-t border-muted/30">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl p-4 bg-muted/5 border border-dashed">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-bold">Conteúdo Gratuito</FormLabel>
                        <FormDescription className="text-xs">
                          Ao ativar, qualquer usuário poderá baixar este recurso sem assinar.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-90"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorization Card */}
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="bg-muted/30 border-b py-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                Categorização
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nível de Educação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/10 border-muted-foreground/20 h-12 w-full text-base font-medium">
                            <SelectValue placeholder="Selecione o nível escolar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {Object.entries(EducationLevelLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="py-3">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Matéria / Assunto Principal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/10 border-muted-foreground/20 h-12 w-full text-base font-medium">
                            <SelectValue placeholder="Selecione a disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {Object.entries(SubjectLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="py-3">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-5 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.history.back()}
              className="px-10 h-14 font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Descartar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-12 h-14 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
