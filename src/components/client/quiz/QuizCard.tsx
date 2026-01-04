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
    compact?: boolean;
}

export function QuizCard({
    icon: Icon,
    title,
    description,
    selected,
    onClick,
    className,
    compact = false,
}: QuizCardProps) {
    return (
        <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={cn(
                "relative w-full text-left rounded-[20px] border-2 transition-all duration-200 flex items-center",
                "group",
                compact ? "py-2.5 px-4 gap-3" : "py-3.5 px-5 gap-4",
                selected
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                    : "border-border/40 bg-background hover:border-primary/40 hover:bg-muted/30",
                className
            )}
        >
            {Icon && (
                <div className={cn(
                    "rounded-xl flex items-center justify-center transition-colors shrink-0",
                    compact ? "h-9 w-9" : "h-11 w-11",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"
                )}>
                    <Icon className={compact ? "h-4.5 w-4.5" : "h-5.5 w-5.5"} />
                </div>
            )}

            <div className="flex-1 min-w-0 pr-6">
                <h3 className={cn(
                    "font-bold leading-tight",
                    compact ? "text-sm" : "text-base",
                    selected ? "text-primary" : "text-foreground"
                )}>
                    {title}
                </h3>
                {description && !compact && (
                    <p className="text-xs font-semibold text-muted-foreground line-clamp-1 mt-0.5 opacity-80">
                        {description}
                    </p>
                )}
            </div>

            <div className={cn(
                "h-6 w-6 rounded-full border-2 transition-all flex items-center justify-center shrink-0",
                selected ? "border-primary bg-primary" : "border-border/60 group-hover:border-primary/40"
            )}>
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-primary-foreground"
                    />
                )}
            </div>
        </motion.button>
    );
}
