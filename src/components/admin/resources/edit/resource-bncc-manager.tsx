"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, BookOpen, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BnccSkill {
    id: string
    code: string
    description: string
    unitTheme?: string | null
}

interface ResourceBnccManagerProps {
    resourceId: string
    initialBnccSkills?: BnccSkill[]
    educationLevelSlug?: string
    gradeSlugs?: string[]
    subjectSlug?: string
}

export function ResourceBnccManager({
    resourceId,
    initialBnccSkills = [],
    educationLevelSlug,
    gradeSlugs = [],
    subjectSlug,
}: ResourceBnccManagerProps) {
    const queryClient = useQueryClient()
    const [linkedSkillIds, setLinkedSkillIds] = useState<Set<string>>(
        new Set(initialBnccSkills.map(s => s.id))
    )

    // Update linked skills when initialBnccSkills changes
    useEffect(() => {
        setLinkedSkillIds(new Set(initialBnccSkills.map(s => s.id)))
    }, [initialBnccSkills])

    // Fetch all BNCC skills for the resource's categorization
    const { data: allSkills = [], isLoading } = useQuery({
        queryKey: ["bncc-skills-list", educationLevelSlug, gradeSlugs, subjectSlug],
        queryFn: async () => {
            if (!educationLevelSlug || !subjectSlug) return []

            const params = new URLSearchParams()
            params.set('limit', '500')
            if (educationLevelSlug) params.set('educationLevelSlug', educationLevelSlug)

            if (gradeSlugs && gradeSlugs.length > 0) {
                gradeSlugs.forEach(slug => params.append('gradeSlug', slug))
            }

            if (subjectSlug) params.set('subjectSlug', subjectSlug)

            const response = await fetch(`/api/v1/bncc/skills?${params.toString()}`)
            if (!response.ok) {
                throw new Error("Failed to fetch BNCC skills")
            }
            const data = await response.json()
            return (data.skills || data.data || []) as BnccSkill[]
        },
        enabled: !!educationLevelSlug && !!subjectSlug,
    })

    // Group skills by unitTheme
    const groupedSkills = useMemo(() => {
        const groups: Record<string, BnccSkill[]> = {}
        allSkills.forEach(skill => {
            const theme = skill.unitTheme || "Outros"
            if (!groups[theme]) groups[theme] = []
            groups[theme].push(skill)
        })
        return groups
    }, [allSkills])

    // Link skill mutation
    const linkMutation = useMutation({
        mutationFn: async (skillId: string) => {
            const response = await fetch(
                `/api/v1/admin/resources/${resourceId}/bncc-skills`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bnccSkillId: skillId }),
                }
            )
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to link skill")
            }
            return response.json()
        },
        onSuccess: (_, skillId) => {
            setLinkedSkillIds(prev => new Set([...prev, skillId]))
            queryClient.invalidateQueries({ queryKey: ["resource-detail", resourceId] })
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "Erro ao vincular")
        }
    })

    // Unlink skill mutation
    const unlinkMutation = useMutation({
        mutationFn: async (skillId: string) => {
            const response = await fetch(
                `/api/v1/admin/resources/${resourceId}/bncc-skills/${skillId}`,
                { method: "DELETE" }
            )
            if (!response.ok) {
                throw new Error("Failed to unlink skill")
            }
        },
        onSuccess: (_, skillId) => {
            setLinkedSkillIds(prev => {
                const next = new Set(prev)
                next.delete(skillId)
                return next
            })
            queryClient.invalidateQueries({ queryKey: ["resource-detail", resourceId] })
        },
        onError: () => {
            toast.error("Erro ao remover habilidade")
        }
    })

    const handleToggle = (skillId: string, isChecked: boolean) => {
        if (isChecked) {
            linkMutation.mutate(skillId)
        } else {
            unlinkMutation.mutate(skillId)
        }
    }

    const isPending = linkMutation.isPending || unlinkMutation.isPending

    // Show message if no categorization selected
    if (!educationLevelSlug || !subjectSlug) {
        return (
            <div className="bg-muted/30 border border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">
                    Selecione a etapa e a disciplina do recurso
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    As habilidades BNCC correspondentes serão listadas aqui.
                </p>
            </div>
        )
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Carregando catálogo BNCC...</p>
                </div>
            </div>
        )
    }

    // No skills found
    if (allSkills.length === 0) {
        return (
            <div className="bg-muted/30 border border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">
                    Nenhuma habilidade BNCC encontrada
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Não há habilidades cadastradas para esta combinação de etapa, série e disciplina.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="min-h-0 space-y-8">
                {Object.entries(groupedSkills).map(([theme, skills]) => (
                    <div key={theme} className="space-y-3">
                        <div className="flex items-center gap-3 sticky top-0 bg-background z-10 py-1">
                            <div className="h-6 w-1 bg-primary rounded-full" />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {theme}
                                <span className="ml-2 lowercase font-normal text-[10px]">({skills.length})</span>
                            </h4>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                            {skills.map((skill) => {
                                const isLinked = linkedSkillIds.has(skill.id)
                                return (
                                    <label
                                        key={skill.id}
                                        className={cn(
                                            "group relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200",
                                            isLinked
                                                ? "bg-primary/[0.03] border-primary/30 shadow-sm ring-1 ring-primary/10"
                                                : "bg-card hover:bg-accent/50 border-border hover:border-primary/20",
                                            isPending && "opacity-50 pointer-events-none"
                                        )}
                                    >
                                        <div className="mt-1 shrink-0">
                                            <Checkbox
                                                checked={isLinked}
                                                onCheckedChange={(checked) => handleToggle(skill.id, !!checked)}
                                                disabled={isPending}
                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                    {skill.code}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-foreground/80 line-clamp-4 group-hover:line-clamp-none transition-all">
                                                {skill.description}
                                            </p>
                                        </div>
                                        {isLinked && (
                                            <div className="absolute -top-1.5 -right-1.5">
                                                <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-lg border-2 border-background">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
