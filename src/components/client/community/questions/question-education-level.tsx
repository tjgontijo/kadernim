'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Option {
    slug: string;
    name: string;
}

interface QuestionEducationLevelProps {
    value?: string;
    onSelect: (slug: string, name: string) => void;
}

export function QuestionEducationLevel({ value, onSelect }: QuestionEducationLevelProps) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/v1/education-levels')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOptions(data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8 py-4">
            <div className="space-y-3 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Qual é a etapa de ensino?</h2>
                <p className="text-muted-foreground font-medium">Selecione para qual nível de alunos devemos produzir este material.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-3xl" />
                    ))
                ) : (
                    options.map((option) => (
                        <Button
                            key={option.slug}
                            variant="outline"
                            onClick={() => onSelect(option.slug, option.name)}
                            className={cn(
                                "group h-20 px-6 justify-between rounded-3xl border-2 transition-all duration-300",
                                value === option.slug
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            <span className={cn(
                                "text-lg font-black transition-colors",
                                value === option.slug ? "text-primary" : "text-foreground"
                            )}>
                                {option.name}
                            </span>

                            <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                value === option.slug ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                                {value === option.slug ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <ChevronRight className="h-5 w-5" />
                                )}
                            </div>
                        </Button>
                    ))
                )}
            </div>
        </div>
    );
}
