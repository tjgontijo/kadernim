'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useBreakpoint } from '@/hooks/use-breakpoint';

interface PageHeaderProps {
    icon?: LucideIcon;
    tag?: string;
    title: React.ReactNode;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode; // Stats or extra info
    className?: string;
}

export function PageHeader({
    icon: Icon,
    tag,
    title,
    description,
    action,
    children,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("max-w-7xl mx-auto w-full px-4 sm:px-0 py-4 sm:py-6", className)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {Icon && (
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm transition-transform hover:rotate-6">
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <div className="flex flex-col-reverse sm:flex-col">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight truncate">
                                {title}
                            </h1>
                            {tag && (
                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] sm:mb-0.5 opacity-70">
                                    {tag}
                                </div>
                            )}
                        </div>
                        {description && (
                            <p className="text-muted-foreground text-xs font-medium mt-0.5 opacity-80 truncate hidden sm:block">
                                {description}
                            </p>
                        )}
                    </div>
                    {/* Action on mobile - visible only on sm:hidden */}
                    <div className="sm:hidden ml-auto shrink-0">
                        {action}
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {children && <div className="flex items-center w-full sm:w-auto">{children}</div>}
                    {/* Action on desktop */}
                    <div className="hidden sm:block">
                        {action}
                    </div>
                </div>
            </div>
        </div>
    );
}
