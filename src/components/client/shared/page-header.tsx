'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    tag?: string;
    title: React.ReactNode;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode; // Stats or extra info
    className?: string;
}

export function PageHeader({
    tag,
    title,
    description,
    action,
    children,
    className
}: PageHeaderProps) {

    return (
        <div className={cn("max-w-7xl mx-auto w-full px-4 sm:px-0 pt-4 pb-2 sm:pt-6 sm:pb-3", className)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex flex-col-reverse sm:flex-col">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                                {title}
                            </h1>
                            {tag && (
                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[9px] sm:text-[10px] sm:mb-0.5 opacity-70">
                                    {tag}
                                </div>
                            )}
                        </div>
                        {description && (
                            <p className="text-muted-foreground text-xs font-medium mt-0.5 opacity-80 hidden sm:block">
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
