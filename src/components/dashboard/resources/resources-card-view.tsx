'use client'

import * as React from 'react'
import { Edit, Trash2, BookOpen, Tag, GraduationCap, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

type ResourcesCardViewProps = {
  resources: Resource[]
  onView?: (resourceId: string) => void
  onEdit?: (resourceId: string) => void
  onDelete?: (resourceId: string) => void
}

export function ResourcesCardView({ resources, onView, onEdit, onDelete }: ResourcesCardViewProps) {
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
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
          onClick={() => onView?.(resource.id)}
        >
          {/* Actions */}
          <div
            className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-primary"
              onClick={() => onEdit?.(resource.id)}
              title="Editar"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-destructive"
              onClick={() => onDelete?.(resource.id)}
              title="Deletar"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Resource Info */}
          <div className="flex items-center gap-3 mb-3 pr-16">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold leading-none">
                {getInitials(resource.title)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                {resource.title || 'Sem título'}
              </h3>
              {resource.description && (
                <p className="text-[10px] text-muted-foreground truncate">
                  {resource.description}
                </p>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-col gap-1.5 mb-4 text-[11px] text-muted-foreground">
            {resource.subject && (
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3 shrink-0 opacity-60" />
                <span className="truncate">{resource.subject}</span>
              </div>
            )}
            {resource.educationLevel && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3 w-3 shrink-0 opacity-60" />
                <span className="truncate">{resource.educationLevel}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 shrink-0 opacity-60" />
              <span>{formatDate(resource.createdAt)}</span>
            </div>
          </div>

          {/* Tags Footer */}
          <div className="mt-auto pt-3 border-t border-border/50 flex flex-wrap gap-2">
            {resource.isFree && (
              <Badge variant="secondary" className="text-[10px]">
                Gratuito
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {resource.subject || 'Geral'}
            </Badge>
          </div>
        </div>
      ))}

      {resources.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhum recurso encontrado</p>
        </div>
      )}
    </div>
  )
}
