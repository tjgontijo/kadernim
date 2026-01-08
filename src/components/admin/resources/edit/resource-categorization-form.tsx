'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Layout, ChevronsUpDown, GraduationCap, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
    UpdateResourceSchema,
    type UpdateResourceInput,
} from '@/lib/schemas/admin/resources'
import { useResourceMeta } from '@/hooks/use-resource-meta'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { ResourceBnccManager } from '@/components/admin/resources/edit/resource-bncc-manager'

interface ResourceCategorizationFormProps {
    resource: {
        id: string
        educationLevel: string
        subject: string
        grades: string[]
        bnccSkills?: Array<{ id: string; code: string; description: string }>
    }
}

export function ResourceCategorizationForm({ resource }: ResourceCategorizationFormProps) {
    const { data: metaData } = useResourceMeta()
    const queryClient = useQueryClient()

    const form = useForm<UpdateResourceInput>({
        resolver: zodResolver(UpdateResourceSchema),
        defaultValues: {
            educationLevel: resource.educationLevel,
            subject: resource.subject,
            grades: resource.grades || [],
        },
    })

    // Watch fields for cascade logic and BNCC
    const selectedEducationLevel = form.watch('educationLevel')
    const selectedGrades = form.watch('grades') || []
    const selectedSubject = form.watch('subject')
    const isEI = selectedEducationLevel === 'educacao-infantil'

    const availableGrades = (metaData?.grades || []).filter(
        (g: any) => g.educationLevelKey === selectedEducationLevel
    )

    const availableSubjects = React.useMemo(() => {
        if (!selectedEducationLevel || !metaData?.grades) return []

        if (selectedGrades.length > 0) {
            const subjectKeys = new Set<string>()
            selectedGrades.forEach(gradeKey => {
                const grade = metaData.grades?.find((g: any) => g.key === gradeKey)
                grade?.subjects?.forEach((s: string) => subjectKeys.add(s))
            })
            return metaData.subjects?.filter((s: any) => subjectKeys.has(s.key)) || []
        } else {
            const gradesOfLevel = metaData.grades.filter((g: any) => g.educationLevelKey === selectedEducationLevel)
            const subjectKeys = new Set<string>()
            gradesOfLevel.forEach((g: any) => {
                g.subjects?.forEach((s: string) => subjectKeys.add(s))
            })
            return metaData.subjects?.filter((s: any) => subjectKeys.has(s.key)) || []
        }
    }, [selectedEducationLevel, selectedGrades, metaData])

    // SILENT Mutation (No toasts)
    const silentSaveMutation = useMutation({
        mutationFn: async (data: Partial<UpdateResourceInput>) => {
            const response = await fetch(`/api/v1/admin/resources/${resource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                throw new Error('Failed to save')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resource.id] })
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
        }
    })

    const handleAutoSave = (updates: Partial<UpdateResourceInput>) => {
        const filtered = { ...updates }
        if (filtered.subject === "") delete filtered.subject
        if (filtered.educationLevel === "") delete filtered.educationLevel

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

        handleAutoSave({ educationLevel: value, grades: [] })
    }

    return (
        <Form {...form}>
            <div className="space-y-6">
                {/* Categorization Fields Card */}
                <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b py-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Layout className="h-4 w-4 text-primary" />
                            Categorização Escolar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col gap-6">
                            {/* 1. Etapa de Ensino */}
                            <FormField
                                control={form.control}
                                name="educationLevel"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                            1. Etapa de Ensino
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={handleEducationLevelChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-muted/10 border-muted-foreground/20 h-12 w-full text-base font-medium">
                                                    <SelectValue placeholder="Selecione a etapa" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-80">
                                                <SelectGroup>
                                                    <SelectLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 py-2">Etapas de Ensino</SelectLabel>
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

                            {/* 2. Grade (Ano/Série ou Faixa Etária) */}
                            <FormField
                                control={form.control}
                                name="grades"
                                render={({ field }) => {
                                    const selectedValues = Array.isArray(field.value) ? field.value : []
                                    const allGradeKeys = availableGrades.map((g: any) => g.key)
                                    const isAllSelected = allGradeKeys.length > 0 && allGradeKeys.every((key: string) => selectedValues.includes(key))

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
                                                                "bg-muted/10 border-muted-foreground/20 h-10 w-full justify-between text-base font-medium hover:bg-muted/20 px-3",
                                                                selectedValues.length === 0 && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <span className="truncate mr-2">
                                                                {selectedValues.length > 0
                                                                    ? selectedValues
                                                                        .map((key: string) => availableGrades.find((g: any) => g.key === key)?.label)
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
                                                                        }, 1000)
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
                                                                                }, 1000)
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

                            {/* 3. Subject */}
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                            3. {isEI ? 'Campo de Experiência' : 'Componente Curricular'}
                                        </FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                handleAutoSave({ subject: val })
                                            }}
                                            disabled={!selectedEducationLevel}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-muted/10 border-muted-foreground/20 h-12 w-full text-base font-medium">
                                                    <SelectValue placeholder={selectedEducationLevel ? 'Selecione' : 'Primeiro selecione a etapa'} />
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

                {/* BNCC Section */}
                <Card className="overflow-hidden border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b py-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            Habilidades BNCC
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        <ResourceBnccManager
                            resourceId={resource.id}
                            initialBnccSkills={resource.bnccSkills || []}
                            educationLevelSlug={selectedEducationLevel}
                            gradeSlugs={selectedGrades}
                            subjectSlug={selectedSubject}
                        />
                    </CardContent>
                </Card>
            </div>
        </Form>
    )
}
