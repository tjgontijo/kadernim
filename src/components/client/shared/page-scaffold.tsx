'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageScaffoldProps {
    children: React.ReactNode;
    className?: string;
}

export function PageScaffold({ children, className }: PageScaffoldProps) {
    return (
        <div className={cn("w-full max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-20", className)}>
            {children}
        </div>
    );
}

// --- LINE 1: HEADER & ACTION ---
interface ScaffoldHeaderProps {
    title: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

function ScaffoldHeader({ title, action, className }: ScaffoldHeaderProps) {
    return (
        <header className={cn("flex items-center justify-between gap-4 px-4 sm:px-0 pt-4 sm:pt-6", className)}>
            <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                    {title}
                </h1>
            </div>
            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </header>
    );
}

// --- LINE 2: HIGHLIGHT (VoteProgress, Stats, Banners) ---
interface ScaffoldHighlightProps {
    children: React.ReactNode;
    className?: string;
}

function ScaffoldHighlight({ children, className }: ScaffoldHighlightProps) {
    return (
        <section className={cn("px-4 sm:px-0", className)}>
            {children}
        </section>
    );
}

// --- LINE 3: CONTROLS (Search & Filters) ---
interface ScaffoldControlsProps {
    children: React.ReactNode;
    className?: string;
}

function ScaffoldControls({ children, className }: ScaffoldControlsProps) {
    return (
        <section className={cn("flex items-center gap-2 px-4 sm:px-0", className)}>
            {children}
        </section>
    );
}

// Composition
PageScaffold.Header = ScaffoldHeader;
PageScaffold.Highlight = ScaffoldHighlight;
PageScaffold.Controls = ScaffoldControls;
