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
        <div className="space-y-8 py-4 max-w-lg mx-auto w-full">
            <div className="space-y-3 text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                    {title}
                </h2>
                {description && (
                    <p className="text-muted-foreground font-medium text-base sm:text-lg">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-4 px-2">
                {children}
            </div>
        </div>
    );
}
