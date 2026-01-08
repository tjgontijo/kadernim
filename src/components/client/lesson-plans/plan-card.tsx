'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { type LessonPlanResponse } from '@/lib/schemas/lesson-plan';
import { BookOpen, Calendar, GraduationCap, Layout, Users } from 'lucide-react';

interface PlanCardProps {
    plan: LessonPlanResponse;
}

/**
 * Formata o slug de nível educacional
 */
function formatEducationLevel(slug: string): string {
    const mapping: Record<string, string> = {
        'educacao-infantil': 'Educação Infantil',
        'ensino-fundamental-1': 'Ensino Fundamental',
        'ensino-fundamental-2': 'Ensino Fundamental',
        'ensino-medio': 'Ensino Médio',
    };
    return mapping[slug] || slug.replace(/-/g, ' ');
}

/**
 * Formata o ano escolar (ex: "3-ano" -> "3º ano")
 */
function formatGrade(gradeSlug: string | undefined): string {
    if (!gradeSlug) return '';
    let grade = gradeSlug.replace(/^ef[12]-/, '');
    grade = grade.replace(/(\d+)[-\s]?ano/i, '$1º ano');
    return grade.charAt(0).toUpperCase() + grade.slice(1);
}

/**
 * Formata componente curricular
 */
function formatSubject(subjectSlug: string | undefined): string {
    if (!subjectSlug) return '';
    const mapping: Record<string, string> = {
        'matematica': 'Matemática',
        'lingua-portuguesa': 'Língua Portuguesa',
        'ciencias': 'Ciências',
        'historia': 'História',
        'geografia': 'Geografia',
        'arte': 'Arte',
        'educacao-fisica': 'Educação Física',
        'lingua-inglesa': 'Língua Inglesa',
        'ensino-religioso': 'Ensino Religioso',
    };
    return mapping[subjectSlug] || subjectSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function PlanCard({ plan }: PlanCardProps) {
    const levelDisplay = formatEducationLevel(plan.educationLevelSlug);
    const gradeDisplay = formatGrade(plan.gradeSlug);
    const subjectDisplay = formatSubject(plan.subjectSlug);

    return (
        <Link href={`/lesson-plans/${plan.id}`} className="block group">
            <div className="bg-card border border-border/50 rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-primary/20 group-active:scale-[0.98]">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                        {plan.title}
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                            <GraduationCap className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <span>{levelDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                            <Users className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <span>{gradeDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-primary/80 uppercase tracking-tight">
                            <BookOpen className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                            <span>{subjectDisplay}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5 leading-none">
                        {plan.bnccSkillCodes.slice(0, 2).map(code => (
                            <Badge key={code} variant="secondary" className="text-[10px] px-2 py-0 h-4 font-bold bg-primary/5 text-primary/60 border-none">
                                {code}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40 whitespace-nowrap uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(plan.createdAt), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                </div>
            </div>
        </Link>
    );
}
