'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen } from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SubjectSchema, type SubjectInput } from '@/lib/taxonomy/schemas'
import { DEFAULT_SUBJECT_COLOR, DEFAULT_SUBJECT_TEXT_COLOR } from '@/lib/taxonomy/constants'
import { Checkbox } from '@/components/ui/checkbox'
import type { EducationLevel } from '@/lib/taxonomy/types'

interface SubjectFormProps {
    initialData?: SubjectInput | null
    levels: EducationLevel[]
    onSubmit: (data: SubjectInput) => void
    isLoading?: boolean
    formId?: string
}

const defaultValues: SubjectInput = {
    name: '',
    color: DEFAULT_SUBJECT_COLOR,
    textColor: DEFAULT_SUBJECT_TEXT_COLOR,
    educationLevelSlugs: [],
}

function cssColorToHex(input: string, fallback: string) {
    if (typeof window === 'undefined') return fallback

    const probe = document.createElement('span')
    probe.style.color = ''
    probe.style.color = input
    if (!probe.style.color) return fallback

    document.body.appendChild(probe)
    const computed = getComputedStyle(probe).color
    document.body.removeChild(probe)

    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
    if (!match) return fallback

    const r = Number(match[1]).toString(16).padStart(2, '0')
    const g = Number(match[2]).toString(16).padStart(2, '0')
    const b = Number(match[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`.toUpperCase()
}

function hexToOklch(hex: string) {
    const normalized = hex.replace('#', '')
    if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return `oklch(0.95 0.05 250)`

    const r = parseInt(normalized.slice(0, 2), 16) / 255
    const g = parseInt(normalized.slice(2, 4), 16) / 255
    const b = parseInt(normalized.slice(4, 6), 16) / 255

    const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    const lr = toLinear(r)
    const lg = toLinear(g)
    const lb = toLinear(b)

    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

    const l_ = Math.cbrt(l)
    const m_ = Math.cbrt(m)
    const s_ = Math.cbrt(s)

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
    const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
    const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

    const C = Math.sqrt(A * A + B * B)
    let h = (Math.atan2(B, A) * 180) / Math.PI
    if (h < 0) h += 360

    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${h.toFixed(1)})`
}

export function SubjectForm({ initialData, levels, onSubmit, isLoading, formId = 'subject-form' }: SubjectFormProps) {
    const form = useForm<SubjectInput>({
        resolver: zodResolver(SubjectSchema),
        defaultValues: initialData || defaultValues,
    })

    const initialLevelKey = (initialData?.educationLevelSlugs ?? []).join('|')

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
            return
        }

        form.reset(defaultValues)
    }, [
        form,
        initialData?.name,
        initialData?.color,
        initialData?.textColor,
        initialLevelKey,
    ])

    const previewBg = form.watch('color') || DEFAULT_SUBJECT_COLOR
    const previewFg = form.watch('textColor') || DEFAULT_SUBJECT_TEXT_COLOR
    const bgPickerValue = cssColorToHex(previewBg, '#E8D2C4')
    const fgPickerValue = cssColorToHex(previewFg, '#5B2E1A')

    return (
        <Form {...form}>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Nome da Disciplina</FormLabel>
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
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Cor de Fundo</FormLabel>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={bgPickerValue}
                                    onChange={(event) => field.onChange(hexToOklch(event.target.value))}
                                    disabled={isLoading}
                                    className="h-12 w-16 p-1 rounded-none border border-line bg-surface-card"
                                />
                                <Input
                                    value={field.value}
                                    disabled
                                    className="h-12 bg-muted/30 border-border rounded-xl font-mono text-xs px-3"
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Cor do Texto/Ícone</FormLabel>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={fgPickerValue}
                                    onChange={(event) => field.onChange(hexToOklch(event.target.value))}
                                    disabled={isLoading}
                                    className="h-12 w-16 p-1 rounded-none border border-line bg-surface-card"
                                />
                                <Input
                                    value={field.value}
                                    disabled
                                    className="h-12 bg-muted/30 border-border rounded-xl font-mono text-xs px-3"
                                />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="educationLevelSlugs"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">Etapas da Disciplina</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-border bg-background p-3">
                                {levels.map((level) => {
                                    const currentValues = field.value ?? []
                                    const checked = currentValues.includes(level.slug)
                                    return (
                                        <label
                                            key={level.slug}
                                            className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(nextValue) => {
                                                    const current = field.value ?? []
                                                    const next = nextValue === true
                                                        ? Array.from(new Set([...current, level.slug]))
                                                        : current.filter((value) => value !== level.slug)
                                                    field.onChange(next)
                                                }}
                                                disabled={isLoading}
                                            />
                                            <span className="text-sm font-medium">{level.name}</span>
                                        </label>
                                    )
                                })}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="rounded-2xl border border-border/70 bg-paper-2/40 p-3">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2">Pré-visualização</p>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-9 w-9 rounded-lg flex items-center justify-center border"
                                style={{ backgroundColor: previewBg, borderColor: previewFg }}
                            >
                                <BookOpen className="h-4 w-4" style={{ color: previewFg }} />
                            </div>
                            <span className="font-semibold text-sm">Disciplina Exemplo</span>
                        </div>
                        <span
                            className="inline-flex items-center justify-center h-7 min-w-[30px] px-2 rounded-full font-bold text-[11px]"
                            style={{ backgroundColor: previewBg, color: previewFg }}
                        >
                            12
                        </span>
                    </div>
                </div>

            </form>
        </Form>
    )
}
