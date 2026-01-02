'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SubjectSchema, type SubjectInput } from '@/lib/schemas/admin/subjects'

interface SubjectFormProps {
    initialData?: SubjectInput | null
    onSubmit: (data: SubjectInput) => void
    isLoading?: boolean
}

export function SubjectForm({ initialData, onSubmit, isLoading }: SubjectFormProps) {
    const form = useForm<SubjectInput>({
        resolver: zodResolver(SubjectSchema),
        defaultValues: initialData || {
            name: '',
            slug: '',
        }
    })

    // Update form if initialData changes (e.g. when loading finishes)
    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
        }
    }, [initialData, form])

    return (
        <Form {...form}>
            <form id="crud-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Nome da Matéria</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Matemática"
                                    className="h-14 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base px-6 transition-all"
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
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Slug (URL)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: matematica"
                                    className="h-14 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base px-6 transition-all"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
