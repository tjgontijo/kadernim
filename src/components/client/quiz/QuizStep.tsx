'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface QuizStepProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export function QuizStep({ title, description, children }: QuizStepProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 py-10 max-w-3xl mx-auto w-full"
        >
            <div className="space-y-6 text-center px-6">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-foreground">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground font-semibold text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="w-full flex justify-center">
                <div className="w-full max-w-2xl px-4">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
