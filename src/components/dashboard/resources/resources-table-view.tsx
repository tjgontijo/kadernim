'use client'

import * as React from 'react'
import { Edit, Trash2, MoreHorizontal, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type Resource = {
  id: string
  title: string
  description?: string | null
  subject?: string | null
  educationLevel?: string | null
  isFree?: boolean
  createdAt: Date
  updatedAt: Date
}

type ResourcesTableViewProps = {
  resources: Resource[]
  visibleColumns: string[]
  onView?: (resourceId: string) => void
  onEdit?: (resourceId: string) => void
  onDelete?: (resourceId: string) => void
}

export function ResourcesTableView({
  resources,
  visibleColumns,
  onView,
  onEdit,
  onDelete,
}: ResourcesTableViewProps) {
  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId)

  const getInitials = (title: string) => {
    if (!title) return '??'
    return title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Recurso
              </th>
              {isColumnVisible('subject') && (
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Assunto
                </th>
              )}
              {isColumnVisible('educationLevel') && (
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Nível
                </th>
              )}
              {isColumnVisible('isFree') && (
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Tipo
                </th>
              )}
              {isColumnVisible('createdAt') && (
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Criado em
                </th>
              )}
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr
                key={resource.id}
                className={cn(
                  'group border-b border-border/50 last:border-0 transition-colors cursor-pointer',
                  'hover:bg-muted/40'
                )}
                onClick={() => onView?.(resource.id)}
              >
                {/* Resource Title */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7 border border-border/50">
                      <AvatarFallback className="text-[9px] bg-primary/5 text-primary font-semibold">
                        {getInitials(resource.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-[13px] text-foreground truncate leading-tight">
                        {resource.title || 'Sem título'}
                      </span>
                      {resource.description && (
                        <span className="text-[10px] text-muted-foreground/70 truncate">
                          {resource.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Subject */}
                {isColumnVisible('subject') && (
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] text-muted-foreground">
                      {resource.subject || '—'}
                    </span>
                  </td>
                )}

                {/* Education Level */}
                {isColumnVisible('educationLevel') && (
                  <td className="px-4 py-2.5">
                    <span className="text-[12px] text-muted-foreground">
                      {resource.educationLevel || '—'}
                    </span>
                  </td>
                )}

                {/* Is Free */}
                {isColumnVisible('isFree') && (
                  <td className="px-4 py-2.5 text-center">
                    {resource.isFree ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Gratuito
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Pago
                      </Badge>
                    )}
                  </td>
                )}

                {/* Created At */}
                {isColumnVisible('createdAt') && (
                  <td className="px-4 py-2.5 text-right">
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDate(resource.createdAt)}
                    </span>
                  </td>
                )}

                {/* Actions */}
                <td className="px-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit?.(resource.id)}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete?.(resource.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum recurso encontrado</p>
        </div>
      )}
    </div>
  )
}
