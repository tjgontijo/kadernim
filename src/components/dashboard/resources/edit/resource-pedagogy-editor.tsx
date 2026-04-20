'use client'

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  BookOpen,
  ListOrdered,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Save,
  Clock,
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
  PedagogicalContent,
  PedagogicalMaterialsSchema,
  PedagogicalObjectivesSchema,
  PedagogicalStepsSchema,
  ResourceStepTypeEnum,
} from '@/lib/resources/schemas/pedagogical-schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchResourcePedagogy, updateResourcePedagogy } from '@/lib/resources/api-client'
import { toast } from 'sonner'

interface ResourcePedagogyEditorProps {
  resourceId: string
  sections?: Array<'objectives' | 'steps' | 'materials'>
}

export function ResourcePedagogyEditor({ resourceId, sections }: ResourcePedagogyEditorProps) {
  const queryClient = useQueryClient()
  const visibleSections = new Set(sections ?? ['objectives', 'steps', 'materials'])
  const showObjectives = visibleSections.has('objectives')
  const showSteps = visibleSections.has('steps')
  const showMaterials = visibleSections.has('materials')

  const { data: initialContent, isLoading: isLoadingContent } = useQuery({
    queryKey: ['admin-resource-pedagogy', resourceId],
    queryFn: () => fetchResourcePedagogy(resourceId),
  })

  const form = useForm<PedagogicalContent>({
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
      form.reset({
        objectives: initialContent.objectives ?? [],
        steps: initialContent.steps ?? [],
        materials: initialContent.materials ?? [],
      })
      return
    }

    if (!isLoadingContent) {
      form.reset({
        objectives: [{ id: crypto.randomUUID(), text: '', order: 1 }],
        steps: [{ id: crypto.randomUUID(), type: 'DISCUSSION', title: '', content: '', order: 1 }],
        materials: [],
      })
    }
  }, [initialContent, isLoadingContent, form])

  const applyServerContent = (content: PedagogicalContent | null, message: string) => {
    if (content) {
      form.reset({
        objectives: content.objectives ?? [],
        steps: content.steps ?? [],
        materials: content.materials ?? [],
      })
    }

    queryClient.invalidateQueries({ queryKey: ['admin-resource-pedagogy', resourceId] })
    queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
    toast.success(message)
  }

  const saveObjectivesMutation = useMutation({
    mutationFn: (objectives: PedagogicalContent['objectives']) =>
      updateResourcePedagogy(resourceId, { objectives }),
    onSuccess: (content) => applyServerContent(content, 'Objetivos atualizados com sucesso!'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar objetivos')
    },
  })

  const saveStepsMutation = useMutation({
    mutationFn: (steps: PedagogicalContent['steps']) => updateResourcePedagogy(resourceId, { steps }),
    onSuccess: (content) => applyServerContent(content, 'Passo a passo atualizado com sucesso!'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar passos da aula')
    },
  })

  const saveMaterialsMutation = useMutation({
    mutationFn: (materials: NonNullable<PedagogicalContent['materials']>) =>
      updateResourcePedagogy(resourceId, { materials }),
    onSuccess: (content) => applyServerContent(content, 'Materiais atualizados com sucesso!'),
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar materiais')
    },
  })

  const handleSaveObjectives = () => {
    const objectives = form
      .getValues('objectives')
      .map((objective, index) => ({ ...objective, order: index + 1 }))

    const parsed = PedagogicalObjectivesSchema.safeParse(objectives)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Objetivos inválidos')
      return
    }

    saveObjectivesMutation.mutate(parsed.data)
  }

  const handleSaveSteps = () => {
    const steps = form.getValues('steps').map((step, index) => ({ ...step, order: index + 1 }))

    const parsed = PedagogicalStepsSchema.safeParse(steps)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Passos inválidos')
      return
    }

    saveStepsMutation.mutate(parsed.data)
  }

  const handleSaveMaterials = () => {
    const materials = (form.getValues('materials') ?? []).map((material) => ({
      ...material,
      quantity: Number(material.quantity) || 1,
    }))

    const parsed = PedagogicalMaterialsSchema.safeParse(materials)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Materiais inválidos')
      return
    }

    saveMaterialsMutation.mutate(parsed.data)
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
      <form className="space-y-8 pb-8">
        {showObjectives && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Objetivos de Aprendizagem
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest"
                  onClick={handleSaveObjectives}
                  disabled={saveObjectivesMutation.isPending}
                >
                  {saveObjectivesMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => appendObjective({ id: crypto.randomUUID(), text: '', order: objectiveFields.length + 1 })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
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
                            placeholder="O que o aluno deve aprender com este recurso?"
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
        )}

        {showSteps && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-primary" />
                Momentos da Aula (Steps)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest"
                  onClick={handleSaveSteps}
                  disabled={saveStepsMutation.isPending}
                >
                  {saveStepsMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() =>
                    appendStep({
                      id: crypto.randomUUID(),
                      type: 'ACTIVITY',
                      title: '',
                      content: '',
                      duration: '15 min',
                      order: stepFields.length + 1,
                    })
                  }
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
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
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="h-10 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ResourceStepTypeEnum.options.map((option) => (
                                <SelectItem key={option} value={option} className="text-xs">
                                  {option}
                                </SelectItem>
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
        )}

        {showMaterials && (
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b py-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                Materiais Necessários (Opcional)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest"
                  onClick={handleSaveMaterials}
                  disabled={saveMaterialsMutation.isPending}
                >
                  {saveMaterialsMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Salvar
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/5"
                  onClick={() => appendMaterial({ id: crypto.randomUUID(), name: '', quantity: 1 })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar
                </Button>
              </div>
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
                          onChange={(event) => field.onChange(parseInt(event.target.value, 10) || 1)}
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
        )}
      </form>
    </Form>
  )
}
