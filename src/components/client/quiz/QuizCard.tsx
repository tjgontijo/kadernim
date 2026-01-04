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
            whileHover={{ y: compact ? -2 : -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative w-full text-left rounded-[24px] border-2 transition-all duration-300 flex items-center",
                "group",
                compact ? "p-4 gap-3" : "p-6 gap-5",
                selected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/30",
                className
            )}
        >
            {Icon && (
                <div className={cn(
                    "rounded-2xl flex items-center justify-center transition-colors shrink-0",
                    compact ? "h-10 w-10" : "h-14 w-14",
                    selected ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground group-hover:text-primary"
                )}>
                    <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h3 className={cn(
                    "font-black leading-tight",
                    compact ? "text-base" : "text-lg mb-1",
                    selected ? "text-primary" : "text-foreground"
                )}>
                    {title}
                </h3>
                {description && !compact && (
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {selected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                        "absolute rounded-full bg-primary flex items-center justify-center",
                        compact ? "top-2 right-2 h-5 w-5" : "top-4 right-4 h-6 w-6"
                    )}
                >
                    <div className={cn(
                        "rounded-full bg-primary-foreground",
                        compact ? "h-1.5 w-1.5" : "h-2 w-2"
                    )} />
                </motion.div>
            )}
        </motion.button>
    );
}
