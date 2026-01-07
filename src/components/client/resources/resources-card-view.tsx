'use client'

import * as React from 'react'
import { Edit, Trash2, Eye, BookOpen, Tag, GraduationCap, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  grades: string[]
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
    <TooltipProvider>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md cursor-pointer"
            onClick={() => onEdit?.(resource.id)}
          >
            {/* Main content - two columns */}
            <div className="flex p-3 gap-3">
              {/* Image column - 1:1 aspect ratio */}
              <div className="relative w-20 shrink-0">
                <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden">
                  {resource.thumbUrl ? (
                    <img
                      src={resource.thumbUrl}
                      alt={resource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/5 text-primary text-lg font-bold">
                      {getInitials(resource.title)}
                    </div>
                  )}
                </div>
              </div>

              {/* Content column */}
              <div className="flex-1 min-w-0 pr-16">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight mb-1">
                  {resource.title || 'Sem título'}
                </h3>
                {resource.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                )}
              </div>

              {/* Actions - hover */}
              <div
                className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-primary"
                      onClick={() => window.open(`/resources/${resource.id}`, '_blank')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Ver como cliente</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-blue-500"
                      onClick={() => onEdit?.(resource.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Editar</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:text-destructive"
                      onClick={() => onDelete?.(resource.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Deletar</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Divider and Tags */}
            <div className="border-t border-border/50 px-3 py-2 flex flex-wrap gap-1.5">
              {resource.subject && (
                <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/5 text-primary">
                  {resource.subject}
                </Badge>
              )}
              {resource.educationLevel && (
                <Badge variant="outline" className="text-[10px]">
                  {resource.educationLevel}
                </Badge>
              )}
              {resource.grades?.map((grade) => (
                <Badge key={grade} variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-none">
                  {grade}
                </Badge>
              ))}
            </div>
          </div>
        ))}

        {resources.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">Nenhum recurso encontrado</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
