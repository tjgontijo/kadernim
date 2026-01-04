'use client';

import { motion } from 'framer-motion';

interface QuizProgressProps {
    current: number;
    total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
    const percentage = (current / total) * 100;

    return (
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Passo {current} de {total}
            </span>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                />
            </div>
        </div>
    );
}
