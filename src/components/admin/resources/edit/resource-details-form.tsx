'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Settings, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  CreateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/schemas/admin/resources'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor'

interface ResourceDetailsFormProps {
  resource: {
    id?: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    isFree: boolean
    grades: string[]
    externalId?: number
  }
  onSuccess?: (resource: any) => void
}

export function ResourceDetailsForm({ resource, onSuccess }: ResourceDetailsFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!resource.id

  const form = useForm<UpdateResourceInput>({
    resolver: zodResolver(isEditing ? UpdateResourceSchema : CreateResourceSchema),
    defaultValues: {
      title: resource.title,
      description: resource.description,
      isFree: resource.isFree,
      externalId: resource.externalId || null
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing
        ? `/api/v1/admin/resources/${resource.id}`
        : `/api/v1/admin/resources`

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to save resource')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast(isEditing ? 'Alterações salvas' : 'Recurso criado', {
        description: isEditing
          ? 'Os dados do recurso foram atualizados com sucesso.'
          : 'O novo recurso foi adicionado ao catálogo.',
      })
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['resource-detail', resource.id] })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar recurso')
    },
  })

  const onSubmit = (data: UpdateResourceInput) => {
    saveMutation.mutate(data)
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
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="externalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">ID Externo (Yampi)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 37235525"
                          className="bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary h-10 text-base px-3"
                          value={field.value || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-5 pt-6">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-12 h-14 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? 'Salvar Alterações' : 'Criar Recurso'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
