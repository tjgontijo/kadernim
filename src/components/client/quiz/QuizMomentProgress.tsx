'use client';

import { cn } from '@/lib/utils';

interface QuizMomentProgressProps {
    currentMoment: 1 | 2 | 3;
    labels?: [string, string, string];
}

/**
 * Barra de progresso visual com 3 momentos
 * Mostra apenas bolhas, não números de steps
 */
export function QuizMomentProgress({
    currentMoment,
    labels = ['Contexto', 'Conteúdo', 'Revisão']
}: QuizMomentProgressProps) {
    return (
        <div className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto">
            {[1, 2, 3].map((moment) => (
                <div key={moment} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div
                            className={cn(
                                "h-2 w-full rounded-full transition-all duration-300",
                                moment < currentMoment && "bg-primary",
                                moment === currentMoment && "bg-primary",
                                moment > currentMoment && "bg-muted"
                            )}
                        />
                        <span
                            className={cn(
                                "text-[10px] font-semibold uppercase tracking-wide transition-colors",
                                moment === currentMoment ? "text-primary" : "text-muted-foreground/50"
                            )}
                        >
                            {labels[moment - 1]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
