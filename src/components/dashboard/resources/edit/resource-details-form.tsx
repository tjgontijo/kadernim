'use client'

import React, { useState, useRef, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Info, 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  PlusCircle, 
  Trash2, 
  Target, 
  Footprints,
  Type,
  Clock,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  RefreshCcw,
  X,
  CheckCircle2,
  AlertCircle,
  Hash
} from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  createAdminResource,
  updateAdminResource,
} from '@/lib/resources/api-client'
import {
  UpdateResourceSchema,
  CreateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/resources/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/dashboard/editor/rich-text-editor'
import { useResourceMeta } from '@/hooks/resources/use-resources'
import { cn } from '@/lib/utils/index'
import { BnccSelector } from './bncc-selector'

interface ResourceDetailsFormProps {
  resource: {
    id?: string
    title: string
    description: string | null
    educationLevel: string
    subject: string
    grades: string[]
    bnccCodes?: string[]
    thumbUrl?: string | null
    googleDriveUrl?: string | null
    pedagogicalContent?: {
      objectives: { id: string; text: string; order: number }[]
      steps: { id: string; type: string; title: string; duration?: string | null; content: string; order: number }[]
    } | null
  }
  onSuccess?: (resource: any) => void
}

const STEP_TYPES = [
  { value: 'WARMUP', label: '☕ Aquecimento' },
  { value: 'DISTRIBUTION', label: '📦 Distribuição' },
  { value: 'PRACTICE', label: '✍️ Prática' },
  { value: 'CONCLUSION', label: '🏁 Conclusão' },
  { value: 'DISCUSSION', label: '🗣️ Discussão' },
  { value: 'ACTIVITY', label: '📑 Atividade' },
  { value: 'REFLECTION', label: '💭 Reflexão' },
]

// Regex para validar pastas do Google Drive
const DRIVE_FOLDER_REGEX = /^https:\/\/drive\.google\.com\/(drive\/folders\/|open\?id=)([a-zA-Z0-9-_]+)/

export function ResourceDetailsForm({ resource, onSuccess }: ResourceDetailsFormProps) {
  const queryClient = useQueryClient()
  const { data: metaData } = useResourceMeta()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!resource.id
  const [isUploadingThumb, setIsUploadingThumb] = useState(false)

  const form = useForm<UpdateResourceInput>({
    resolver: zodResolver(isEditing ? UpdateResourceSchema : CreateResourceSchema),
    defaultValues: {
      title: resource.title || '',
      description: resource.description || '',
      educationLevel: resource.educationLevel || '',
      subject: resource.subject || '',
      grades: resource.grades || [],
      bnccCodes: resource.bnccCodes || [],
      thumbUrl: resource.thumbUrl || '',
      googleDriveUrl: resource.googleDriveUrl || '',
      pedagogicalContent: resource.pedagogicalContent || {
        objectives: [],
        steps: []
      }
    },
  })

  // Field Arrays
  const { fields: objectives, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "pedagogicalContent.objectives"
  })

  const { fields: steps, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray({
    control: form.control,
    name: "pedagogicalContent.steps"
  })

  // Watchers
  const selectedLevel = form.watch('educationLevel')
  const selectedSubject = form.watch('subject')
  const selectedGrades = form.watch('grades') ?? []
  const currentThumbUrl = form.watch('thumbUrl')
  const driveUrl = form.watch('googleDriveUrl')
  
  const showGrades = !!selectedLevel && !!selectedSubject
  
  const availableGrades = (metaData?.grades || []).filter(
    g => !selectedLevel || g.educationLevelKey === selectedLevel
  )

  // Validação dinâmica do Drive URL
  const isDriveUrlValid = useMemo(() => {
    if (!driveUrl) return null
    return DRIVE_FOLDER_REGEX.test(driveUrl)
  }, [driveUrl])

  const saveMutation = useMutation({
    mutationFn: async (data: any) =>
      isEditing ? updateAdminResource(resource.id!, data) : createAdminResource(data),
    onSuccess: (data) => {
      toast.success(isEditing ? 'Alterações salvas' : 'Recurso criado')
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['admin-resource-detail', resource.id] })
      }
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar recurso')
    },
  })

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingThumb(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/v1/admin/uploads/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Falha no upload')
      
      const data = await response.json()
      form.setValue('thumbUrl', data.url, { shouldValidate: true })
      toast.success('Capa enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao subir imagem de capa')
    } finally {
      setIsUploadingThumb(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const onSubmit = (data: UpdateResourceInput) => {
    saveMutation.mutate(data)
  }

  const toggleGrade = (gradeKey: string) => {
    const current = form.getValues('grades') || []
    if (current.includes(gradeKey)) {
      form.setValue('grades', current.filter(g => g !== gradeKey), { shouldValidate: true })
    } else {
      form.setValue('grades', [...current, gradeKey], { shouldValidate: true })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-32">
        <div className="space-y-12">
          
          {/* Identificação do Recurso */}
          <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-terracotta/40" />
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="w-8 h-8 rounded-full bg-terracotta-2 flex items-center justify-center">
                <Info className="h-4 w-4 text-terracotta" />
              </div>
              <h2 className="font-display text-xl text-ink">Identificação do Recurso</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-stretch">
              
              {/* Coluna 1: Thumb - Fixa Proporção 4:5 */}
              <div className="md:col-span-4 flex flex-col pt-1">
                 <FormLabel className="text-[13px] font-medium text-ink-soft mb-3">Capa do Material</FormLabel>
                 <div 
                   className={cn(
                     "w-full aspect-[4/5] relative group rounded-4 border-2 border-dashed border-line overflow-hidden bg-paper-2 flex flex-col items-center justify-center transition-all cursor-pointer",
                     currentThumbUrl ? "border-solid border-terracotta/20 shadow-sm" : "hover:border-terracotta/40",
                     isUploadingThumb && "opacity-50 pointer-events-none"
                   )}
                   onClick={() => !currentThumbUrl && fileInputRef.current?.click()}
                 >
                    {currentThumbUrl ? (
                      <>
                        <img src={currentThumbUrl} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                           <Button 
                             type="button" 
                             variant="secondary" 
                             size="sm" 
                             className="rounded-full bg-white text-ink hover:bg-paper font-bold px-6"
                             onClick={(e) => {
                               e.stopPropagation();
                               fileInputRef.current?.click();
                             }}
                           >
                             <RefreshCcw className="h-4 w-4 mr-2" /> Trocar
                           </Button>
                           <X 
                             className="absolute top-4 right-4 h-6 w-6 text-white cursor-pointer hover:text-berry transition-colors shadow-2xl"
                             onClick={(e) => {
                               e.stopPropagation();
                               form.setValue('thumbUrl', '');
                             }}
                           />
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-ink-mute/30 mb-2" />
                        <span className="text-[10px] uppercase tracking-widest text-ink-mute font-bold text-center px-4">Upload Capa</span>
                      </>
                    )}
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleThumbUpload}
                    />

                    {isUploadingThumb && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                        <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
                      </div>
                    )}
                 </div>
              </div>

              {/* Coluna 2: Detalhes - Compacta agora com o Drive Link junto */}
              <div className="md:col-span-8 flex flex-col gap-6">
                <div className="space-y-6">
                  {/* Título */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-ink-soft">Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Guia Prático de Alfabetização"
                            className="bg-paper-2 border-line focus-visible:ring-terracotta h-12 text-base px-4 rounded-3"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Nível e Disciplina */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-ink-soft flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5" /> Nível
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-paper-2 border-line h-12 rounded-3 text-ink">
                                <SelectValue placeholder="Nível" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-paper border-line shadow-2">
                              {metaData?.educationLevels.map(lvl => (
                                <SelectItem key={lvl.key} value={lvl.key} className="focus:bg-terracotta-2 focus:text-terracotta">{lvl.label}</SelectItem>
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
                        <FormItem>
                          <FormLabel className="text-[13px] font-medium text-ink-soft flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5" /> Disciplina
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="bg-paper-2 border-line h-12 rounded-3 text-ink">
                                <SelectValue placeholder="Disciplina" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-paper border-line shadow-2">
                              {metaData?.subjects.map(sub => (
                                <SelectItem key={sub.key} value={sub.key} className="focus:bg-terracotta-2 focus:text-terracotta">{sub.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Ano / Série */}
                <FormField
                  control={form.control}
                  name="grades"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[13px] font-medium text-ink-soft flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" /> Anos / Séries
                      </FormLabel>
                      <div className="flex-1 flex flex-wrap gap-2 p-5 bg-paper-2 border border-line rounded-3 w-full items-start min-h-[90px]">
                        {showGrades ? (
                          availableGrades.map((g) => {
                            const isSelected = (field.value || []).includes(g.key)
                            return (
                              <Badge
                                key={g.key}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer px-4 py-2 transition-all text-[12px] font-medium rounded-full ${
                                  isSelected 
                                    ? "bg-terracotta text-white hover:bg-terracotta-hover border-terracotta shadow-sm" 
                                    : "bg-white text-ink-mute border-line hover:border-terracotta/30"
                                }`}
                                onClick={() => toggleGrade(g.key)}
                              >
                                {g.label}
                              </Badge>
                            )
                          })
                        ) : (
                          <div className="flex items-center gap-2 text-ink-mute/40 text-[11px] italic py-2">
                             Selecione Nível e Disciplina para visualizar...
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Google Drive Link - Integrado aqui embaixo para fechar a coluna */}
                <FormField
                  control={form.control}
                  name="googleDriveUrl"
                  render={({ field }) => (
                    <FormItem className="mt-auto pt-2 w-full">
                      <FormLabel className="text-[13px] font-medium text-ink-soft flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5" /> Pasta do Google Drive (Sync)
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full bg-paper-2 border-line focus-visible:ring-terracotta h-12 text-sm px-4 rounded-3 pr-10"
                            {...field}
                            value={field.value || ''}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                             <TooltipProvider>
                               <Tooltip delayDuration={300}>
                                 <TooltipTrigger asChild>
                                   <div className="cursor-help">
                                     {driveUrl ? (
                                       isDriveUrlValid ? (
                                         <CheckCircle2 className="h-4 w-4 text-sage animate-in zoom-in duration-300" />
                                       ) : (
                                         <AlertCircle className="h-4 w-4 text-berry animate-in shake duration-300" />
                                       )
                                     ) : (
                                       <Upload className="h-4 w-4 text-ink-mute/30" />
                                     )}
                                   </div>
                                 </TooltipTrigger>
                                 <TooltipContent className="bg-ink text-paper border-none text-[11px]">
                                   {driveUrl ? (
                                      isDriveUrlValid 
                                        ? "Pasta validada. Tudo pronto para sincronizar!" 
                                        : "Link inválido. Deve ser uma pasta do Google Drive."
                                   ) : (
                                      "Cole o link da pasta do Drive aqui."
                                   )}
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sessão: Base Nacional Comum Curricular (BNCC) */}
          <div className={cn(
            "space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden transition-all duration-300",
            selectedGrades.length === 0 && "opacity-60 grayscale-[0.5] pointer-events-none"
          )}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[oklch(0.60_0.20_300)]/40" />
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.60_0.20_300)]/10 flex items-center justify-center">
                <Hash className="h-4 w-4 text-[oklch(0.60_0.20_300)]" />
              </div>
              <h2 className="font-display text-xl text-ink">Base Nacional Comum Curricular (BNCC)</h2>
            </div>

            <FormField
              control={form.control}
              name="bnccCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-ink-soft">Habilidades Vinculadas</FormLabel>
                  <FormControl>
                    <BnccSelector
                      value={field.value || []}
                      onChange={field.onChange}
                      educationLevel={selectedLevel}
                      grade={selectedGrades[0]} // Filtra preferencialmente pelo primeiro ano selecionado
                      subject={selectedSubject}
                      disabled={selectedGrades.length === 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sessão 2: Conteúdo Principal */}
          <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-mustard/40" />
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="w-8 h-8 rounded-full bg-mustard-2 flex items-center justify-center">
                <Type className="h-4 w-4 text-[oklch(0.50_0.13_82)]" />
              </div>
              <h2 className="font-display text-xl text-ink">Apresentação Editorial</h2>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-medium text-ink-soft">Descrição Detalhada do Material</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      placeholder="Descreva o propósito deste material..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sessão 3: Objetivos de Aprendizagem */}
          <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-sage/40" />
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-2 flex items-center justify-center">
                  <Target className="h-4 w-4 text-sage" />
                </div>
                <h2 className="font-display text-xl text-ink">Objetivos de Aprendizagem</h2>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendObjective({ text: '', order: objectives.length + 1 })}
                className="rounded-full border-line text-ink-soft hover:text-sage text-xs h-9"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Objetivo
              </Button>
            </div>

            <div className="space-y-4">
              {objectives.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start group animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="text-[10px] font-mono text-ink-mute mt-4 bg-paper-2 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <FormField
                    control={form.control}
                    name={`pedagogicalContent.objectives.${index}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Identificar as propriedades dos materiais no cotidiano."
                            className="bg-paper-2 border-line-soft focus-visible:ring-sage h-11 rounded-3"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeObjective(index)}
                    className="text-ink-mute hover:text-berry mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {objectives.length === 0 && (
                <div className="text-center py-6 text-ink-mute italic text-sm opacity-60">
                   Nenhum objetivo adicionado. Descreva o que o aluno deve aprender.
                </div>
              )}
            </div>
          </div>

          {/* Sessão 4: Passo a Passo */}
          <div className="space-y-8 bg-paper p-8 rounded-4 border border-line shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-terracotta/40" />
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-terracotta-2 flex items-center justify-center">
                  <Footprints className="h-4 w-4 text-terracotta" />
                </div>
                <h2 className="font-display text-xl text-ink">Passo a Passo do Uso</h2>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendStep({ type: 'ACTIVITY', title: '', content: '', order: steps.length + 1 })}
                className="rounded-full border-line text-ink-soft hover:text-terracotta text-xs h-9"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Etapa
              </Button>
            </div>

            <div className="space-y-6">
              {steps.map((field, index) => (
                <div key={field.id} className="p-6 bg-paper-2 border border-line-soft rounded-4 space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-400 group">
                  <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <FormField
                      control={form.control}
                      name={`pedagogicalContent.steps.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="md:w-1/3">
                          <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-paper border-line h-10 rounded-3">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-paper border-line">
                              {STEP_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`pedagogicalContent.steps.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Título da Etapa</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Preparação Inicial" className="bg-paper border-line h-10 rounded-3" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`pedagogicalContent.steps.${index}.duration`}
                      render={({ field }) => (
                        <FormItem className="md:w-1/4">
                          <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-mute flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Duração
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="Ex: 15 min"
                              className="bg-paper border-line h-10 rounded-3"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`pedagogicalContent.steps.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Instruções Práticas</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            placeholder="Explique o que deve ser feito nesta etapa..."
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center pt-2 border-t border-line-soft">
                    <div className="flex gap-2">
                       <Button type="button" variant="ghost" size="sm" onClick={() => moveStep(index, index - 1)} disabled={index === 0}>
                         <ChevronUp className="h-4 w-4" />
                       </Button>
                       <Button type="button" variant="ghost" size="sm" onClick={() => moveStep(index, index + 1)} disabled={index === steps.length - 1}>
                         <ChevronDown className="h-4 w-4" />
                       </Button>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeStep(index)}
                      className="text-berry/70 hover:text-berry hover:bg-berry-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir Etapa
                    </Button>
                  </div>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="text-center py-6 text-ink-mute italic text-sm opacity-60">
                   Nenhuma etapa adicionada. Guie o professor no uso do material.
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação Finais */}
          <div className="flex items-center justify-end gap-6 border-t border-line pt-10">
             <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-16 h-16 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-full shadow-2xl shadow-terracotta/30 transition-all hover:scale-[1.03] text-lg"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Publicando Material...
                  </>
                ) : isEditing ? 'Salvar Tudo' : 'Publicar Recurso'}
              </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
