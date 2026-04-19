'use client'

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  BookOpen, 
  ListOrdered, 
  Plus, 
  Trash2, 
  GripVertical, 
  Loader2, 
  Save,
  Clock,
  Type
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  PedagogicalContentSchema, 
  PedagogicalContent,
  ResourceStepTypeEnum
} from '@/lib/resources/schemas/pedagogical-schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchResourcePedagogy, updateResourcePedagogy } from '@/lib/resources/api-client'
import { toast } from 'sonner'
// Removendo uuid package para usar crypto.randomUUID() nativo

interface ResourcePedagogyEditorProps {
  resourceId: string
}

export function ResourcePedagogyEditor({ resourceId }: ResourcePedagogyEditorProps) {
  const queryClient = useQueryClient()

  const { data: initialContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['admin-resource-pedagogy', resourceId],
    queryFn: () => fetchResourcePedagogy(resourceId),
  })

  const form = useForm<PedagogicalContent>({
    resolver: zodResolver(PedagogicalContentSchema),
    defaultValues: {
      objectives: [],
      steps: [],
      materials: [],
    },
  })

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: 'objectives',
  })

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: 'steps',
  })

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control: form.control,
    name: 'materials',
  })

  useEffect(() => {
    if (initialContent) {
      form.reset(initialContent)
    } else if (!isLoadingContent) {
        // Se carregar e não tiver nada, inicializa um esqueleto básico
        form.reset({
            objectives: [{ id: crypto.randomUUID(), text: '', order: 1 }],
            steps: [{ id: crypto.randomUUID(), type: 'DISCUSSION', title: '', content: '', order: 1 }],
            materials: []
        })
    }
  }, [initialContent, isLoadingContent, form])

  const saveMutation = useMutation({
    mutationFn: (data: PedagogicalContent) => updateResourcePedagogy(resourceId, data),
    onSuccess: () => {
      toast.success('Conteúdo pedagógico atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['admin-resource-pedagogy', resourceId] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar conteúdo pedagógico')
    },
  })

  const onSubmit = (data: PedagogicalContent) => {
    // Garantir que a ordem está correta
    const orderedData = {
        ...data,
        objectives: data.objectives.map((o, idx) => ({ ...o, order: idx + 1 })),
        steps: data.steps.map((s, idx) => ({ ...s, order: idx + 1 })),
        materials: data.materials?.map((m, idx) => ({ ...m, order: idx + 1 })) || []
    }
    saveMutation.mutate(orderedData)
  }

  if (isLoadingContent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        
        {/* 📋 OBJETIVOS DE APRENDIZAGEM */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Objetivos de Aprendizagem
                </CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => appendObjective({ id: crypto.randomUUID(), text: '', order: objectiveFields.length + 1 })}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Objetivo
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {objectiveFields.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed rounded-xl border-muted">
                    <p className="text-xs text-muted-foreground">Nenhum objetivo adicionado.</p>
                </div>
            )}
            
            {objectiveFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start p-4 bg-muted/5 rounded-xl border group">
                <div className="flex flex-col gap-2 pt-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {index + 1}
                    </span>
                    <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`objectives.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="O que o aluno deve aprender com este recurso? (Ex: Identificar frações equivalentes...)"
                              className="bg-transparent border-none focus-visible:ring-0 text-sm min-h-[80px] p-0 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeObjective(index)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 📍 PASSO A PASSO DA AULA (STEPS) */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    Momentos da Aula (Steps)
                </CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => appendStep({ 
                        id: crypto.randomUUID(), 
                        type: 'ACTIVITY', 
                        title: '', 
                        content: '', 
                        duration: '15 min',
                        order: stepFields.length + 1 
                    })}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Momento
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-6">
            {stepFields.map((field, index) => (
              <div key={field.id} className="relative p-6 bg-card border rounded-2xl shadow-sm space-y-4 group">
                <div className="absolute -left-3 top-6 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-lg">
                    {index + 1}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/4 space-y-3">
                        <FormField
                            control={form.control}
                            name={`steps.${index}.type`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</FormLabel>
                                    <Select 
                                        value={field.value} 
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ResourceStepTypeEnum.options.map(opt => (
                                                <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`steps.${index}.duration`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Duração
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: 15 min" className="h-10 text-xs" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        <FormField
                            control={form.control}
                            name={`steps.${index}.title`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Título do Momento</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: Aquecimento e Contextualização" className="h-10 font-bold" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`steps.${index}.content`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Orientações ao Professor</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder="Detalhamento do que fazer neste momento..."
                                            className="min-h-[120px] text-sm leading-relaxed"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive text-[10px] font-bold uppercase h-8"
                        onClick={() => removeStep(index)}
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remover este momento
                    </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 📦 MATERIAIS NECESSÁRIOS */}
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Save className="h-4 w-4 text-primary" />
                    Materiais Necessários (Opcional)
                </CardTitle>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => appendMaterial({ id: crypto.randomUUID(), name: '', quantity: 1 })}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Adicionar Material
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-3">
             {materialFields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end group">
                    <FormField
                        control={form.control}
                        name={`materials.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome do Material</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: Papel Sulfite A4" className="h-10 text-sm" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`materials.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem className="w-24">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Qtd</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field} 
                                        onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                                        className="h-10 text-sm" 
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-destructive mb-1"
                        onClick={() => removeMaterial(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
             ))}
          </CardContent>
        </Card>

        {/* 🚀 FLOAT SAVER BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4 flex justify-center z-50">
            <Button 
                type="submit" 
                size="lg"
                disabled={saveMutation.isPending}
                className="px-[56px] h-12 rounded-full font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
            >
                {saveMutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Conteúdo Pedagógico
                    </>
                )}
            </Button>
        </div>
      </form>
    </Form>
  )
}
