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
            className="space-y-8 py-6 max-w-2xl mx-auto w-full"
        >
            <div className="space-y-4 text-center px-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-foreground">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground font-medium text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            <div className="w-full flex justify-center">
                <div className="w-full max-w-xl px-4">
                    {children}
                </div>
            </div>
        </motion.div>
    );
}
