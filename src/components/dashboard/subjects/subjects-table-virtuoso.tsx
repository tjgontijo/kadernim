'use client'

import React from 'react'
import { BookOpen, Edit3, Trash2 } from 'lucide-react'
import { TableVirtuoso } from 'react-virtuoso'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { type Subject } from '@/lib/taxonomy/types'
import { getSubjectTheme } from './subject-colors'

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
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
            <TableVirtuoso
                data={subjects}
                endReached={onEndReached}
                useWindowScroll
                increaseViewportBy={200}
                fixedHeaderContent={() => (
                    <tr className="bg-muted/80 backdrop-blur-sm border-b border-border/40 z-10">
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Disciplina
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Etapa
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Recursos
                        </th>
                        <th className="w-24"></th>
                    </tr>
                )}
                itemContent={(index, subject) => (
                    (() => {
                        const theme = getSubjectTheme(subject)

                        return (
                            <>
                        <td className="px-4 py-3" onClick={() => onEdit(subject)}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: theme.bg,
                                        border: `1px solid ${theme.border}`
                                    }}
                                >
                                    <BookOpen className="h-4 w-4" style={{ color: theme.fg }} />
                                </div>
                                <span className="font-bold text-[14px] text-foreground leading-tight transition-colors">
                                    {subject.name}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 py-3 min-w-[260px]">
                            <div className="flex flex-wrap gap-1.5">
                                {(subject.educationLevels?.length ?? 0) > 0 ? (
                                    subject.educationLevels!.map((level) => (
                                        <span
                                            key={level.slug}
                                            className="inline-flex items-center rounded-full border border-line bg-paper-2 px-2.5 py-1 text-[10px] font-semibold text-ink"
                                        >
                                            {level.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">Sem etapa vinculada</span>
                                )}
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                                <span
                                    className="inline-flex items-center justify-center h-7 min-w-[30px] px-2 rounded-full font-bold text-[11px]"
                                    style={{
                                        backgroundColor: theme.countBg,
                                        color: theme.countFg
                                    }}
                                >
                                    {subject._count?.resources ?? 0}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
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
                        )
                    })()
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
