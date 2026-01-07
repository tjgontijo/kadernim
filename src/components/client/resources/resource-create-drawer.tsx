'use client'

import React, { useState, useMemo } from 'react'
import { Plus, X, Loader2, ChevronDown, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { CreateResourceSchema, type CreateResourceInput } from '@/lib/schemas/admin/resources'
import { useResourceMeta } from '@/hooks/use-resource-meta'

interface ResourceCreateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (resource: any) => void
}

export function ResourceCreateDrawer({ open, onOpenChange, onSuccess }: ResourceCreateDrawerProps) {
    const { data: metaData } = useResourceMeta()
    const queryClient = useQueryClient()
    const [subjectsOpen, setSubjectsOpen] = useState(false)

    const form = useForm<CreateResourceInput>({
        resolver: zodResolver(CreateResourceSchema),
        defaultValues: {
            title: '',
            description: '',
            educationLevel: '',
            subject: '',
            isFree: false,
            grades: [],
            externalId: Math.floor(Math.random() * 1000000),
        },
    })

    // Watch para cascata
    const selectedEducationLevel = form.watch('educationLevel')
    const selectedGrades = form.watch('grades') || []

    // Filtrar anos pelo nível de educação selecionado
    const availableGrades = useMemo(() => {
        if (!selectedEducationLevel || !metaData?.grades) return []
        return metaData.grades.filter(g => g.educationLevelKey === selectedEducationLevel)
    }, [selectedEducationLevel, metaData?.grades])

    // Filtrar disciplinas pelos anos selecionados (interseção - disciplinas que existem em TODOS os anos selecionados)
    const availableSubjects = useMemo(() => {
        if (!selectedGrades.length || !metaData?.grades || !metaData?.subjects) return []

        // Pegar as disciplinas de cada grade selecionado
        const subjectSets = selectedGrades.map(gradeKey => {
            const grade = metaData.grades.find(g => g.key === gradeKey)
            return new Set(grade?.subjects || [])
        })

        // Se só tem um ano, retorna as disciplinas dele
        if (subjectSets.length === 1) {
            const subjectKeys = Array.from(subjectSets[0])
            return metaData.subjects.filter(s => subjectKeys.includes(s.key))
        }

        // Interseção de todas as disciplinas (disciplinas presentes em todos os anos)
        const intersection = subjectSets.reduce((acc, set) => {
            return new Set([...acc].filter(x => set.has(x)))
        })

        return metaData.subjects.filter(s => intersection.has(s.key))
    }, [selectedGrades, metaData?.grades, metaData?.subjects])

    // Reset campos dependentes quando mudar educationLevel
    const handleEducationLevelChange = (value: string) => {
        form.setValue('educationLevel', value)
        form.setValue('grades', [])
        form.setValue('subject', '')
    }

    // Reset subject quando mudar grades
    const handleGradesChange = (grades: string[]) => {
        form.setValue('grades', grades)
        // Se o subject atual não está mais disponível, limpar
        const currentSubject = form.getValues('subject')
        const stillAvailable = availableSubjects.some(s => s.key === currentSubject)
        if (!stillAvailable) {
            form.setValue('subject', '')
        }
    }

    const saveMutation = useMutation({
        mutationFn: async (data: CreateResourceInput) => {
            const response = await fetch('/api/v1/admin/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || 'Erro ao criar recurso')
            }

            return response.json()
        },
        onSuccess: (data) => {
            toast.success('Recurso criado', {
                description: 'O novo material foi adicionado ao catálogo.',
            })
            queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
            form.reset()
            onSuccess?.(data)
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar recurso')
        },
    })

    const onSubmit = (data: CreateResourceInput) => {
        saveMutation.mutate(data)
    }

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
            <DrawerContent className="h-[100dvh] max-h-none rounded-none border-none bg-background">
                <div className="mx-auto w-full max-w-2xl flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="border-b pb-4 shrink-0 px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Plus className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <DrawerTitle className="text-xl font-black tracking-tight">
                                        Novo Recurso
                                    </DrawerTitle>
                                    <DrawerDescription>
                                        Preencha as informações para criar um novo material.
                                    </DrawerDescription>
                                </div>
                            </div>

                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/80" onClick={handleClose}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                {/* Título */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                Título do Recurso *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Introdução ao Estudo dos Gases"
                                                    className="h-12 text-base bg-muted/10 border-muted-foreground/20"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Etapa (EducationLevel) */}
                                <FormField
                                    control={form.control}
                                    name="educationLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                1. Etapa de Ensino *
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={handleEducationLevelChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 w-full text-base bg-muted/10 border-muted-foreground/20">
                                                        <SelectValue placeholder="Selecione a etapa de ensino" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
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

                                {/* Anos/Séries (Grades) - Multi-select */}
                                <FormField
                                    control={form.control}
                                    name="grades"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                2. Anos / Séries {selectedEducationLevel ? '*' : ''}
                                            </FormLabel>
                                            <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            disabled={!selectedEducationLevel}
                                                            className={cn(
                                                                "h-12 w-full justify-between text-base bg-muted/10 border-muted-foreground/20 font-normal",
                                                                !field.value?.length && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value?.length
                                                                ? `${field.value.length} ano(s) selecionado(s)`
                                                                : selectedEducationLevel
                                                                    ? "Selecione os anos"
                                                                    : "Primeiro selecione a etapa"
                                                            }
                                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder="Buscar ano..." />
                                                        <CommandList>
                                                            <CommandEmpty>Nenhum ano encontrado.</CommandEmpty>
                                                            <CommandGroup>
                                                                {availableGrades.map((grade) => {
                                                                    const isSelected = field.value?.includes(grade.key)
                                                                    return (
                                                                        <CommandItem
                                                                            key={grade.key}
                                                                            value={grade.key}
                                                                            onSelect={() => {
                                                                                const newValue = isSelected
                                                                                    ? field.value?.filter((v) => v !== grade.key) || []
                                                                                    : [...(field.value || []), grade.key]
                                                                                handleGradesChange(newValue)
                                                                            }}
                                                                        >
                                                                            <div className={cn(
                                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                                isSelected
                                                                                    ? "bg-primary text-primary-foreground"
                                                                                    : "opacity-50 [&_svg]:invisible"
                                                                            )}>
                                                                                <Check className="h-3 w-3" />
                                                                            </div>
                                                                            {grade.label}
                                                                        </CommandItem>
                                                                    )
                                                                })}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            {field.value?.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {field.value.map((gradeKey) => {
                                                        const grade = availableGrades.find(g => g.key === gradeKey)
                                                        return (
                                                            <Badge
                                                                key={gradeKey}
                                                                variant="secondary"
                                                                className="text-xs font-medium px-2.5 py-0.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                onClick={() => {
                                                                    const newValue = field.value?.filter((v) => v !== gradeKey) || []
                                                                    handleGradesChange(newValue)
                                                                }}
                                                            >
                                                                {grade?.label || gradeKey}
                                                                <X className="ml-1 h-3 w-3" />
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                            <FormDescription className="text-xs">
                                                Selecione um ou mais anos para filtrar as disciplinas disponíveis.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Disciplina (Subject) */}
                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                3. Disciplina {selectedGrades.length > 0 ? '*' : ''}
                                            </FormLabel>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                disabled={!selectedGrades.length}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-12 w-full text-base bg-muted/10 border-muted-foreground/20">
                                                        <SelectValue placeholder={
                                                            selectedGrades.length
                                                                ? "Selecione a disciplina"
                                                                : "Primeiro selecione os anos"
                                                        } />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {availableSubjects.length > 0 ? (
                                                        availableSubjects.map((subject) => (
                                                            <SelectItem key={subject.key} value={subject.key} className="py-3">
                                                                {subject.label}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Nenhuma disciplina disponível para os anos selecionados.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Conteúdo Gratuito */}
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

                                {/* Submit Button */}
                                <div className="pt-6 border-t">
                                    <Button
                                        type="submit"
                                        disabled={saveMutation.isPending}
                                        className="w-full h-14 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {saveMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Criando...
                                            </>
                                        ) : 'Criar Recurso'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
