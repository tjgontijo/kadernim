'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Layout, Settings, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/admin/editor/rich-text-editor'
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
  CreateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/schemas/admin/resources'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useResourceMeta } from '@/hooks/use-resource-meta'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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
  const { data: metaData } = useResourceMeta()
  const queryClient = useQueryClient()
  const isEditing = !!resource.id

  const form = useForm<UpdateResourceInput>({
    resolver: zodResolver(isEditing ? UpdateResourceSchema : CreateResourceSchema),
    defaultValues: {
      title: resource.title,
      description: resource.description,
      educationLevel: resource.educationLevel,
      subject: resource.subject,
      isFree: resource.isFree,
      grades: resource.grades || [],
      ...(isEditing ? {} : { externalId: resource.externalId || null })
    },
  })

  // Watch education level to filter grades
  const selectedEducationLevel = form.watch('educationLevel')
  const availableGrades = (metaData?.grades || []).filter(
    (g) => g.educationLevelKey === selectedEducationLevel
  )

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
                          {(metaData?.educationLevels || []).map((level) => (
                            <SelectItem key={level.key} value={level.key} className="py-3">
                              {level.label}
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
                          {(metaData?.subjects || []).map((subject) => (
                            <SelectItem key={subject.key} value={subject.key} className="py-3">
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Grade Selection (Anos / Séries) */}
                <FormField
                  control={form.control}
                  name="grades"
                  render={({ field }) => (
                    <FormItem className="flex flex-col md:col-span-2 pt-4 border-t border-dashed mt-4">
                      <div className="flex flex-col gap-1 mb-3">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Anos / Séries (Grades)</FormLabel>
                        <FormDescription className="text-[10px]">Selecione os anos específicos para este recurso. Se nenhum for selecionado, será considerado aplicável a todo o nível.</FormDescription>
                      </div>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          value={field.value || []}
                          onValueChange={field.onChange}
                          className="flex flex-wrap justify-start gap-2"
                        >
                          {availableGrades.length > 0 ? (
                            availableGrades.map((grade) => (
                              <ToggleGroupItem
                                key={grade.key}
                                value={grade.key}
                                className="h-9 px-4 rounded-full border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-xs font-medium transition-all"
                              >
                                {grade.label}
                              </ToggleGroupItem>
                            ))
                          ) : (
                            <div className="h-20 w-full flex items-center justify-center border border-dashed rounded-xl bg-muted/5">
                              <span className="text-xs text-muted-foreground italic">
                                {selectedEducationLevel ? 'Nenhum ano cadastrado para este nível' : 'Selecione um nível de educação primeiro'}
                              </span>
                            </div>
                          )}
                        </ToggleGroup>
                      </FormControl>
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
