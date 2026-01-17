'use client';

import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { Button } from '@/components/ui/button';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
    isLoading?: boolean;
}

export function SearchInput({
    className,
    value,
    onClear,
    isLoading,
    ...props
}: SearchInputProps) {
    const hasValue = value && String(value).length > 0;

    return (
        <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-primary">
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Search className="h-4 w-4" />
                )}
            </div>

            <input
                {...props}
                value={value}
                className={cn(
                    "w-full h-11 sm:h-12 pl-10 pr-10",
                    "bg-muted/60 border-2 border-border/30",
                    "rounded-2xl text-sm font-semibold transition-all",
                    "placeholder:text-muted-foreground/60 placeholder:font-medium",
                    "focus:bg-background focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none",
                    className
                )}
            />

            {hasValue && onClear && !isLoading && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClear}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl hover:bg-muted transition-colors"
                >
                    <X className="h-4 w-4 text-muted-foreground/60" />
                </Button>
            )}
        </div>
    );
}
