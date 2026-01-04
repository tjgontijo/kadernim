'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

interface QuizActionProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: LucideIcon;
    className?: string;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'lg' | 'xl';
}

export function QuizAction({
    label,
    onClick,
    disabled,
    loading,
    icon: Icon,
    className,
    variant = 'primary',
    size = 'xl'
}: QuizActionProps) {
    const ActualIcon = loading ? Loader2 : Icon;

    return (
        <Button
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                "w-full rounded-2xl font-black transition-all",
                size === 'xl' ? "h-16 text-xl" : "h-14 text-lg",
                variant === 'primary' && "shadow-xl shadow-primary/20",
                className
            )}
            variant={variant === 'primary' ? 'default' : variant}
        >
            {label}
            {ActualIcon && (
                <ActualIcon className={cn(
                    "ml-2 h-6 w-6",
                    loading && "animate-spin"
                )} />
            )}
        </Button>
    );
}
