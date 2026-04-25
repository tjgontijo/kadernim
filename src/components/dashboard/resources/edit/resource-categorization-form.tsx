'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Layout, ChevronsUpDown, BookOpen, FileText, Layers, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { updateAdminResource } from '@/lib/resources/api-client'
import {
  UpdateResourceSchema,
  type UpdateResourceInput,
} from '@/lib/resources/schemas'
import { useResourceMeta } from '@/hooks/resources/use-resources'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils/index'

const RESOURCE_TYPE_OPTIONS = [
  { value: 'PRINTABLE_ACTIVITY', label: 'Atividade imprimível' },
  { value: 'LESSON_PLAN', label: 'Plano de aula' },
  { value: 'GAME', label: 'Jogo' },
  { value: 'ASSESSMENT', label: 'Avaliação' },
  { value: 'OTHER', label: 'Recurso didático' },
] as const

const FIELD_BASE_CLASS =
  'h-12 w-full rounded-3 border-line bg-card text-ink shadow-sm focus-visible:ring-terracotta-2 focus-visible:border-terracotta'
const SELECT_TRIGGER_CLASS = `${FIELD_BASE_CLASS} text-base font-medium`
const INPUT_CLASS = `${FIELD_BASE_CLASS} px-4 text-base`
const POPOVER_TRIGGER_CLASS =
  '!h-12 w-full justify-between !rounded-3 border border-line bg-card px-4 text-base font-medium text-ink shadow-sm hover:bg-card active:translate-y-0'
const INNER_CARD_HEADER_CLASS = 'border-b border-dashed border-line bg-transparent px-5 py-4'

interface ResourceCategorizationFormProps {
  resource: {
    id: string
    educationLevel: string
    educationLevelSlug?: string
    subject: string
    subjectSlug?: string
    grades: string[]
    resourceType?: string | null
    pagesCount?: number | null
    estimatedDurationMinutes?: number | null
    bnccSkills?: Array<{ id: string; code: string; description: string }>
  }
  context?: 'bncc' | 'sidebar'
}

export function ResourceCategorizationForm({
  resource,
  context = 'bncc',
}: ResourceCategorizationFormProps) {
  const { data: metaData } = useResourceMeta()
  const queryClient = useQueryClient()

  const form = useForm<UpdateResourceInput>({
    resolver: zodResolver(UpdateResourceSchema),
    defaultValues: {
      educationLevel: resource.educationLevelSlug ?? resource.educationLevel,
      subject: resource.subjectSlug ?? resource.subject,
      grades: resource.grades || [],
      resourceType: resource.resourceType ?? 'OTHER',
      pagesCount: resource.pagesCount ?? null,
      estimatedDurationMinutes: resource.estimatedDurationMinutes ?? null,
    },
  })

  const selectedEducationLevel = form.watch('educationLevel')
  const selectedGrades = form.watch('grades') || []
  const isEI = selectedEducationLevel === 'educacao-infantil'

  const availableGrades = (metaData?.grades || []).filter(
    (g: any) => g.educationLevelKey === selectedEducationLevel
  )

  const availableSubjects = React.useMemo(() => {
    if (!selectedEducationLevel || !metaData?.grades) return []

    if (selectedGrades.length > 0) {
      const subjectKeys = new Set<string>()
      selectedGrades.forEach((gradeKey) => {
        const grade = metaData.grades?.find((g: any) => g.key === gradeKey)
        grade?.subjects?.forEach((s: string) => subjectKeys.add(s))
      })
      return metaData.subjects?.filter((s: any) => subjectKeys.has(s.key)) || []
    }

    const gradesOfLevel = metaData.grades.filter(
      (g: any) => g.educationLevelKey === selectedEducationLevel
    )
    const subjectKeys = new Set<string>()
    gradesOfLevel.forEach((g: any) => {
      g.subjects?.forEach((s: string) => subjectKeys.add(s))
    })
    return metaData.subjects?.filter((s: any) => subjectKeys.has(s.key)) || []
  }, [selectedEducationLevel, selectedGrades, metaData])

  const silentSaveMutation = useMutation({
    mutationFn: (data: Partial<UpdateResourceInput>) => updateAdminResource(resource.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resource-detail', resource.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource-detail', resource.id] })
    },
  })

  const handleAutoSave = (updates: Partial<UpdateResourceInput>) => {
    const filtered = { ...updates }
    if (filtered.subject === '') delete filtered.subject
    if (filtered.educationLevel === '') delete filtered.educationLevel

    if (Object.keys(filtered).length > 0) {
      silentSaveMutation.mutate(filtered)
    }
  }

  const gradeSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (gradeSaveTimeoutRef.current) clearTimeout(gradeSaveTimeoutRef.current)
    }
  }, [])

  const handleEducationLevelChange = (value: string) => {
    form.setValue('educationLevel', value)
    form.setValue('grades', [])
    form.setValue('subject', '')
    handleAutoSave({ educationLevel: value, grades: [], subject: '' })
  }

  const handleNumberFieldBlur = (
    key: 'pagesCount' | 'estimatedDurationMinutes',
    value: unknown
  ) => {
    if (value === '' || value === null || value === undefined) {
      form.setValue(key, null)
      handleAutoSave({ [key]: null })
      return
    }

    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed < 0) {
      return
    }

    form.setValue(key, parsed)
    handleAutoSave({ [key]: parsed })
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <Card className="overflow-hidden border shadow-sm">
          <CardHeader className={INNER_CARD_HEADER_CLASS}>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary" />
              {context === 'bncc' ? 'Configuração BNCC' : 'Informações da Seção Lateral'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Defina etapa, ano e disciplina do recurso. Esses dados alimentam a exibição da seção lateral e o contexto pedagógico.
            </p>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      1. Etapa de Ensino
                    </FormLabel>
                    <Select value={field.value ?? undefined} onValueChange={handleEducationLevelChange}>
                      <FormControl>
                        <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                          <SelectValue placeholder="Selecione a etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-80">
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-2">
                            Etapas de Ensino
                          </SelectLabel>
                          {(metaData?.educationLevels || []).map((level: any) => (
                            <SelectItem key={level.key} value={level.key} className="py-3">
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grades"
                render={({ field }) => {
                  const selectedValues = Array.isArray(field.value) ? field.value : []
                  const allGradeKeys = availableGrades.map((g: any) => g.key)
                  const isAllSelected =
                    allGradeKeys.length > 0 &&
                    allGradeKeys.every((key: string) => selectedValues.includes(key))

                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        2. {isEI ? 'Faixa Etária' : 'Ano / Série'}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!selectedEducationLevel}
                              className={cn(
                                POPOVER_TRIGGER_CLASS,
                                selectedValues.length === 0 && 'text-muted-foreground'
                              )}
                            >
                              <span className="truncate mr-2">
                                {selectedValues.length > 0
                                  ? selectedValues
                                      .map((key: string) =>
                                        availableGrades.find((g: any) => g.key === key)?.label
                                      )
                                      .filter(Boolean)
                                      .join(', ')
                                  : selectedEducationLevel
                                  ? 'Selecione'
                                  : 'Primeiro selecione a etapa'}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandList>
                              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    const newValues = isAllSelected ? [] : allGradeKeys
                                    field.onChange(newValues)
                                    form.setValue('subject', '')
                                    if (gradeSaveTimeoutRef.current) clearTimeout(gradeSaveTimeoutRef.current)
                                    gradeSaveTimeoutRef.current = setTimeout(() => {
                                      handleAutoSave({ grades: newValues, subject: '' })
                                    }, 500)
                                  }}
                                  className="font-semibold border-b"
                                >
                                  <Checkbox checked={isAllSelected} className="mr-2" />
                                  Selecionar Todos
                                </CommandItem>

                                {availableGrades.map((grade: any) => {
                                  const isSelected = selectedValues.includes(grade.key)
                                  return (
                                    <CommandItem
                                      key={grade.key}
                                      onSelect={() => {
                                        const newValues = isSelected
                                          ? selectedValues.filter((v: string) => v !== grade.key)
                                          : [...selectedValues, grade.key]
                                        field.onChange(newValues)
                                        form.setValue('subject', '')
                                        if (gradeSaveTimeoutRef.current) clearTimeout(gradeSaveTimeoutRef.current)
                                        gradeSaveTimeoutRef.current = setTimeout(() => {
                                          handleAutoSave({ grades: newValues, subject: '' })
                                        }, 500)
                                      }}
                                    >
                                      <Checkbox checked={isSelected} className="mr-2" />
                                      {grade.label}
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      3. {isEI ? 'Campo de Experiência' : 'Disciplina'}
                    </FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(val) => {
                        field.onChange(val)
                        handleAutoSave({ subject: val })
                      }}
                      disabled={!selectedEducationLevel}
                    >
                      <FormControl>
                        <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                          <SelectValue
                            placeholder={
                              selectedEducationLevel
                                ? 'Selecione'
                                : 'Primeiro selecione a etapa'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-80">
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-2">
                            {isEI ? 'Campos de Experiência' : 'Componentes Curriculares'}
                          </SelectLabel>
                          {availableSubjects.map((subject: any) => (
                            <SelectItem key={subject.key} value={subject.key} className="py-3">
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {context === 'sidebar' && (
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className={INNER_CARD_HEADER_CLASS}>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Dados do Cartão
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Esses campos aparecem no bloco lateral: tipo, número de páginas e duração.
              </p>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="resourceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        Tipo
                      </FormLabel>
                      <Select
                        value={field.value ?? 'OTHER'}
                        onValueChange={(value) => {
                          field.onChange(value)
                          handleAutoSave({ resourceType: value })
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className={SELECT_TRIGGER_CLASS}>
                            <SelectValue placeholder="Tipo do recurso" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RESOURCE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="pagesCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" /> Páginas
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const next = e.target.value
                            field.onChange(next === '' ? null : Number(next))
                          }}
                          onBlur={(e) => handleNumberFieldBlur('pagesCount', e.target.value)}
                          placeholder="Ex: 40"
                          className={INPUT_CLASS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDurationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Duração (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const next = e.target.value
                            field.onChange(next === '' ? null : Number(next))
                          }}
                          onBlur={(e) =>
                            handleNumberFieldBlur('estimatedDurationMinutes', e.target.value)
                          }
                          placeholder="Ex: 30"
                          className={INPUT_CLASS}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {context === 'bncc' && (
          <Card className="overflow-hidden border shadow-sm">
            <CardHeader className={INNER_CARD_HEADER_CLASS}>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Prévia das Habilidades BNCC
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {resource.bnccSkills && resource.bnccSkills.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {resource.bnccSkills.slice(0, 6).map((skill) => (
                    <div key={skill.id} className="rounded-3 border border-line bg-paper-2 p-3">
                      <div className="font-mono text-[11px] font-semibold text-ink tracking-[0.05em]">
                        {skill.code}
                      </div>
                      <div className="text-[13px] text-ink-soft mt-1 line-clamp-2">{skill.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-mute">Nenhuma habilidade BNCC vinculada a este recurso.</p>
              )}
            </CardContent>
          </Card>
        )}

        {silentSaveMutation.isPending && (
          <p className="text-xs text-ink-mute">Salvando alterações...</p>
        )}
      </div>
    </Form>
  )
}
