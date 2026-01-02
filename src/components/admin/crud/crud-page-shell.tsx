'use client'

import React from 'react'
import { Plus, SlidersHorizontal, Search, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { useResponsiveView } from '@/hooks/use-responsive-view'
import { cn } from '@/lib/utils'
import { ViewSwitcher } from './view-switcher'
import { CrudDataView } from './crud-data-view'
import { ViewType } from './types'

interface CrudPageShellProps {
    title: string
    subtitle: string
    icon: React.ElementType
    onAdd?: () => void
    addLabel?: string

    // Search & View
    view: ViewType
    setView: (view: ViewType) => void
    enabledViews?: ViewType[]
    searchInput: string
    onSearchChange: (value: string) => void
    searchPlaceholder?: string

    // Pagination
    page: number
    limit: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    totalItems: number
    totalPages: number
    hasMore: boolean

    // Filters & Actions
    filters?: React.ReactNode
    actions?: React.ReactNode
    children: React.ReactNode

    isLoading?: boolean
}

export function CrudPageShell({
    title,
    subtitle,
    icon: Icon,
    onAdd,
    addLabel = 'Novo',
    view,
    setView,
    enabledViews,
    searchInput,
    onSearchChange,
    searchPlaceholder = 'Buscar...',
    page,
    limit,
    onPageChange,
    onLimitChange,
    totalItems,
    totalPages,
    hasMore,
    filters,
    actions,
    children,
    isLoading
}: CrudPageShellProps) {
    const { isMobile } = useBreakpoint()
    // Usa o hook responsivo que força cards em telas < 1200px
    const actualView = useResponsiveView(view)

    return (
        <section className="flex flex-col h-full overflow-hidden bg-background">
            {!isMobile && (
                <>
                    {/* Synchronized Header */}
                    <div className="flex flex-col border-b border-border bg-background">
                        <div className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                {Icon && (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
                                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {actions}
                            </div>
                        </div>
                        {/* View Switcher integrated in header container */}
                        <div className="px-6 pb-2">
                            <ViewSwitcher view={actualView} setView={setView} enabledViews={enabledViews} className="-ml-3" />
                        </div>
                    </div>

                    {/* Synchronized Toolbar */}
                    <div className="flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between px-6 border-b border-border/50 bg-muted/5">
                        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
                            <div className="relative w-full max-w-[320px]">
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={searchPlaceholder}
                                    className="h-8 rounded-full border-transparent bg-muted/50 pl-9 text-xs focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring transition-all"
                                    value={searchInput}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="h-4 w-[1px] bg-border mx-2" />
                            {filters}
                        </div>
                    </div>
                </>
            )}

            {isMobile && (
                <div className="flex flex-col gap-3 p-4 border-b bg-background">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black">{title}</h1>
                        {onAdd && (
                            <Button onClick={onAdd} size="icon" className="h-10 w-10 rounded-full">
                                <Plus className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-4"
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className={cn(
                "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border"
            )}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Carregando...</p>
                        </div>
                    </div>
                ) : (
                    // Injeta actualView nos children se for CrudDataView
                    React.Children.map(children, child => {
                        if (React.isValidElement(child) && child.type === CrudDataView) {
                            return React.cloneElement(child, { view: actualView } as any)
                        }
                        return child
                    })
                )}
            </div>

            <div className="border-t border-border bg-background py-3 shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                            Mostrando <span className="font-medium">{totalItems}</span> itens
                        </div>

                        {!isMobile && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Itens:</span>
                                <Select
                                    value={limit.toString()}
                                    onValueChange={(v) => onLimitChange(Number(v))}
                                >
                                    <SelectTrigger size="sm" className="h-8 w-[70px]">
                                        <SelectValue placeholder={limit.toString()} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 15, 20, 50, 100].map((v) => (
                                            <SelectItem key={v} value={v.toString()}>
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            Anterior
                        </Button>

                        {!isMobile && (
                            <div className="flex items-center gap-1 mx-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? "default" : "ghost"}
                                            size="sm"
                                            className="h-8 w-8 text-xs p-0"
                                            onClick={() => onPageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}
                                {totalPages > 5 && (
                                    <span className="text-xs text-muted-foreground px-1">...</span>
                                )}
                            </div>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => onPageChange(page + 1)}
                            disabled={!hasMore || isLoading}
                        >
                            Próximo
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {onAdd && (
                <Button
                    onClick={onAdd}
                    size="icon"
                    className="fixed bottom-20 right-8 h-14 w-14 rounded-full shadow-2xl hover:shadow-primary/50 hover:scale-110 transition-all z-50"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            )}
        </section>
    )
}
