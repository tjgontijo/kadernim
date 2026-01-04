'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuizActionProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: LucideIcon;
    className?: string;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'lg' | 'xl';
}

export function QuizAction({
    label,
    onClick,
    disabled,
    icon: Icon,
    className,
    variant = 'primary',
    size = 'xl'
}: QuizActionProps) {
    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-full rounded-2xl font-black transition-all",
                size === 'xl' ? "h-16 text-xl" : "h-14 text-lg",
                variant === 'primary' && "shadow-xl shadow-primary/20",
                className
            )}
            variant={variant === 'primary' ? 'default' : variant}
        >
            {label}
            {Icon && <Icon className="ml-2 h-6 w-6" />}
        </Button>
    );
}
