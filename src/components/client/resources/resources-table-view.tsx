'use client'

import * as React from 'react'
import { Edit, Trash2, Eye, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type Resource = {
  id: string
  title: string
  description?: string | null
  subject?: string | null
  educationLevel?: string | null
  isFree?: boolean
  thumbUrl?: string | null
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
    <TooltipProvider>
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
                    Disciplina
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
                <th className="w-24"></th>
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
                  onClick={() => onEdit?.(resource.id)}
                >
                  {/* Resource Title */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-border/50 rounded-md overflow-hidden">
                        {resource.thumbUrl && (
                          <AvatarImage
                            src={resource.thumbUrl}
                            alt={resource.title}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="text-[9px] bg-primary/5 text-primary font-semibold rounded-md">
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
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => window.open(`/resources/${resource.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Visualizar como cliente</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                            onClick={() => onEdit?.(resource.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Editar</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                            onClick={() => onDelete?.(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Deletar</TooltipContent>
                      </Tooltip>
                    </div>
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
    </TooltipProvider>
  )
}
