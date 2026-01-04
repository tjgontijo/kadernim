'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuizCardProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    selected?: boolean;
    onClick: () => void;
    className?: string;
}

export function QuizCard({
    icon: Icon,
    title,
    description,
    selected,
    onClick,
    className
}: QuizCardProps) {
    return (
        <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative w-full text-left p-6 rounded-[24px] border-2 transition-all duration-300 flex items-center gap-5",
                "group",
                selected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/30",
                className
            )}
        >
            {Icon && (
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                    selected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground group-hover:text-primary"
                )}>
                    <Icon className="h-7 w-7" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className={cn(
                    "text-lg font-black leading-tight mb-1",
                    selected ? "text-primary" : "text-foreground"
                )}>
                    {title}
                </h3>
                {description && (
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                >
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                </motion.div>
            )}
        </motion.button>
    );
}
