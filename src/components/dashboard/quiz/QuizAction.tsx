'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/index';
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
                "w-full rounded-xl font-bold transition-all",
                size === 'xl' ? "h-12 text-base" : "h-11 text-sm",
                variant === 'primary' && "shadow-lg shadow-primary/10",
                className
            )}
            variant={variant === 'primary' ? 'default' : variant}
        >
            {label}
            {ActualIcon && (
                <ActualIcon className={cn(
                    "ml-2 h-4 w-4",
                    loading && "animate-spin"
                )} />
            )}
        </Button>
    );
}
