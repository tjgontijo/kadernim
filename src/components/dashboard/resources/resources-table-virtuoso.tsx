'use client'

import * as React from 'react'
import { Edit, Trash2, Eye, BookOpen } from 'lucide-react'
import { TableVirtuoso } from 'react-virtuoso'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/index'

type Resource = {
  id: string
  title: string
  description?: string | null
  subject?: string | null
  educationLevel?: string | null
  thumbUrl?: string | null
  grades: string[]
  createdAt: Date
  updatedAt: Date
}

type ResourcesTableVirtuosoProps = {
  resources: Resource[]
  visibleColumns: string[]
  onView?: (resourceId: string) => void
  onEdit?: (resourceId: string) => void
  onDelete?: (resourceId: string) => void
  onEndReached?: () => void
}

export function ResourcesTableVirtuoso({
  resources,
  visibleColumns,
  onView,
  onEdit,
  onDelete,
  onEndReached,
}: ResourcesTableVirtuosoProps) {
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

  const [scrollParent, setScrollParent] = React.useState<HTMLElement | undefined>(undefined)

  React.useEffect(() => {
    const el = document.getElementById('crud-scroll-container')
    if (el) setScrollParent(el)
  }, [])

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col min-h-[500px]">
        <TableVirtuoso
          data={resources}
          endReached={onEndReached}
          customScrollParent={scrollParent}
          increaseViewportBy={200}
          fixedHeaderContent={() => (
            <tr className="border-b border-border bg-muted/80 backdrop-blur-sm z-10">
              <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                Recurso
              </th>
              {isColumnVisible('subject') && (
                <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                  Disciplina
                </th>
              )}
              {isColumnVisible('educationLevel') && (
                <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                  Etapa
                </th>
              )}
              {isColumnVisible('createdAt') && (
                <th className="px-4 py-3 text-right text-[11px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/80">
                  Criado em
                </th>
              )}
              <th className="w-24 bg-muted/80"></th>
            </tr>
          )}
          itemContent={(index, resource) => (
            <>
              {/* Resource Title */}
              <td className="px-4 py-3" onClick={() => onEdit?.(resource.id)}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-border/50 rounded-lg overflow-hidden shrink-0">
                    {resource.thumbUrl && (
                      <AvatarImage
                        src={resource.thumbUrl}
                        alt={resource.title}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold rounded-lg uppercase">
                      {getInitials(resource.title)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[13px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                      {resource.title || 'Sem título'}
                    </span>
                    {resource.description && (
                      <span className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">
                        {resource.description}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Subject */}
              {isColumnVisible('subject') && (
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    {resource.subject || '—'}
                  </span>
                </td>
              )}

              {/* Education Level */}
              {isColumnVisible('educationLevel') && (
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {resource.educationLevel || '—'}
                  </span>
                </td>
              )}


              {/* Created At */}
              {isColumnVisible('createdAt') && (
                <td className="px-4 py-3 text-right">
                  <span className="text-[10px] font-mono text-muted-foreground/60">
                    {formatDate(resource.createdAt)}
                  </span>
                </td>
              )}

              {/* Actions */}
              <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => window.open(`/resources/${resource.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Ver Cliente</TooltipContent>
                  </Tooltip>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:text-blue-500"
                    onClick={() => onEdit?.(resource.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete?.(resource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </>
          )}
          components={{
            Table: (props) => <table {...props} className="w-full border-collapse" />,
            TableHead: (props) => <thead {...props} className="text-left" />,
            TableRow: (props) => <tr {...props} className="border-b border-border/40 hover:bg-muted/30 transition-colors group cursor-pointer" />,
          }}
        />

        {resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhum recurso encontrado</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
