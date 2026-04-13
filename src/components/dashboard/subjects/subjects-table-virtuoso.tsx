'use client'

import React from 'react'
import { BookOpen, Edit3, Trash2 } from 'lucide-react'
import { TableVirtuoso } from 'react-virtuoso'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/auth/permission-guard'

type Subject = {
    id: string
    name: string
    slug: string
    _count?: {
        resources: number
    }
}

interface SubjectsTableVirtuosoProps {
    subjects: Subject[]
    onEdit: (subject: Subject) => void
    onDelete: (id: string) => void
    onEndReached?: () => void
}

export function SubjectsTableVirtuoso({
    subjects,
    onEdit,
    onDelete,
    onEndReached
}: SubjectsTableVirtuosoProps) {
    const [scrollParent, setScrollParent] = React.useState<HTMLElement | undefined>(undefined)

    React.useEffect(() => {
        const el = document.getElementById('crud-scroll-container')
        if (el) setScrollParent(el)
    }, [])

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col">
            <TableVirtuoso
                data={subjects}
                endReached={onEndReached}
                customScrollParent={scrollParent}
                increaseViewportBy={200}
                fixedHeaderContent={() => (
                    <tr className="bg-muted/80 backdrop-blur-sm border-b border-border z-10">
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                            Disciplina
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                            Recursos
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                            Código
                        </th>
                        <th className="w-24 bg-muted/80"></th>
                    </tr>
                )}
                itemContent={(index, subject) => (
                    <>
                        <td className="px-4 py-3" onClick={() => onEdit(subject)}>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <span className="font-bold text-[14px] text-foreground leading-tight group-hover:text-primary transition-colors">
                                    {subject.name}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                                <span className="inline-flex items-center justify-center h-7 min-w-[30px] px-2 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                                    {subject._count?.resources ?? 0}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <code className="text-[10px] font-mono bg-muted/50 px-2 py-1 rounded text-muted-foreground border border-border/50">
                                {subject.slug}
                            </code>
                        </td>

                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                                <PermissionGuard action="update" subject="Subject">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                        onClick={() => onEdit(subject)}
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard action="delete" subject="Subject">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => onDelete(subject.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </td>
                    </>
                )}
                components={{
                    Table: (props) => <table {...props} className="w-full border-collapse" />,
                    TableRow: (props) => (
                        <tr 
                            {...props} 
                            className="group border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" 
                        />
                    ),
                }}
            />
            
            {subjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhuma disciplina encontrada</p>
                </div>
            )}
        </div>
    )
}
