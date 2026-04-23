'use client'

import React from 'react'
import { Hash, Edit3, Trash2 } from 'lucide-react'
import { VirtuosoGrid } from 'react-virtuoso'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { cn } from '@/lib/utils/index'
import { type Subject } from '@/lib/taxonomy/types'
import { getSubjectColor, hexToRgba } from './subject-colors'

interface SubjectsGridVirtuosoProps {
    subjects: Subject[]
    onEdit: (subject: Subject) => void
    onDelete: (id: string) => void
    onEndReached?: () => void
}

const ListContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...style }}
      className={cn("grid gap-4 p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500", className)}
      {...props}
    />
  )
)
ListContainer.displayName = 'VirtualizedSubjectGridList'

const ItemContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ ...style }} {...props} className="h-full pb-2" />
  )
)
ItemContainer.displayName = 'VirtualizedSubjectGridItem'

export function SubjectsGridVirtuoso({
    subjects,
    onEdit,
    onDelete,
    onEndReached
}: SubjectsGridVirtuosoProps) {
    const [scrollParent, setScrollParent] = React.useState<HTMLElement | undefined>(undefined)

    React.useEffect(() => {
        const el = document.getElementById('crud-scroll-container')
        if (el) setScrollParent(el)
    }, [])

    return (
        <div className="h-full min-h-[500px]">
            <VirtuosoGrid
                data={subjects}
                endReached={onEndReached}
                customScrollParent={scrollParent}
                increaseViewportBy={400}
                components={{
                    List: ListContainer,
                    Item: ItemContainer,
                }}
                itemContent={(index, subject) => (
                    <div
                        className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 cursor-pointer h-full flex flex-col"
                        onClick={() => onEdit(subject)}
                    >
                        <div className="flex p-4 gap-4 flex-1">
                            <div className="relative w-14 h-14 shrink-0">
                                <div
                                    className="aspect-square w-full rounded-xl flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: hexToRgba(getSubjectColor(subject.color), 0.1),
                                        border: `1px solid ${hexToRgba(getSubjectColor(subject.color), 0.28)}`
                                    }}
                                >
                                    <Hash
                                        className="h-6 w-6 transition-colors"
                                        style={{ color: hexToRgba(getSubjectColor(subject.color), 0.88) }}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 pr-8">
                                <h3 className="font-bold text-[15px] text-foreground truncate leading-tight mb-1.5 transition-colors">
                                    {subject.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <code className="text-[10px] font-mono text-muted-foreground/60 bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                                        {subject.slug}
                                    </code>
                                    <span className="text-muted-foreground/30">•</span>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: getSubjectColor(subject.color) }}
                                    >
                                        {subject._count?.resources ?? 0} {(subject._count?.resources ?? 0) === 1 ? 'material' : 'materiais'}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PermissionGuard action="update" subject="Subject">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm"
                                        onClick={() => onEdit(subject)}
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard action="delete" subject="Subject">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                        onClick={() => onDelete(subject.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </div>

                        <div className="border-t border-border/40 px-4 py-2.5 bg-muted/5 flex items-center justify-between">
                            <Badge
                                variant="outline"
                                className="text-[10px] border-none font-medium px-2 h-5"
                                style={{
                                    backgroundColor: hexToRgba(getSubjectColor(subject.color), 0.12),
                                    color: getSubjectColor(subject.color)
                                }}
                            >
                                Disciplina
                            </Badge>
                            <span className="text-[10px] text-muted-foreground/30 font-mono italic">#{subject.id.slice(-4)}</span>
                        </div>
                    </div>
                )}
            />
            
            {subjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Hash className="h-10 w-10 text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhuma disciplina encontrada</p>
                </div>
            )}
        </div>
    )
}
