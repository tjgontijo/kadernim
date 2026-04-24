'use client'

import * as React from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, BookOpen } from 'lucide-react'
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

type ResourcesGridVirtuosoProps = {
  resources: Resource[]
  onView?: (resourceId: string) => void
  onEdit?: (resourceId: string) => void
  onDelete?: (resourceId: string) => void
  onEndReached?: () => void
}

const ListContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...style }}
      className={cn("grid gap-4 p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 animate-in fade-in duration-500", className)}
      {...props}
    />
  )
)
ListContainer.displayName = 'VirtualizedGridList'

const ItemContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ ...style }} {...props} className="h-full pb-4" />
  )
)
ItemContainer.displayName = 'VirtualizedGridItem'

export function ResourcesGridVirtuoso({
  resources,
  onView,
  onEdit,
  onDelete,
  onEndReached,
}: ResourcesGridVirtuosoProps) {
  const [scrollParent, setScrollParent] = React.useState<HTMLElement | undefined>(undefined)

  React.useEffect(() => {
    const el = document.getElementById('crud-scroll-container')
    if (el) setScrollParent(el)
  }, [])

  return (
    <div className="h-full min-h-[500px]">
      <VirtuosoGrid
        data={resources}
        endReached={onEndReached}
        customScrollParent={scrollParent}
        increaseViewportBy={400}
        overscan={10}
        components={{
          List: ListContainer,
          Item: ItemContainer,
        }}
        itemContent={(index, resource) => (
          <Card className="group relative h-full flex flex-col transition-all hover:shadow-xl border-line bg-card rounded-5 p-[16px]">
            {/* Tape Effect */}
            <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 -rotate-2 w-[80px] h-[20px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-30 opacity-90" />

            {/* Thumbnail Container with Border */}
            <div 
              className="relative aspect-square w-full overflow-hidden bg-paper-2 rounded-1 border border-line-soft cursor-pointer shrink-0"
              onClick={() => onEdit?.(resource.id)}
            >
              {resource.thumbUrl ? (
                <img
                  src={resource.thumbUrl}
                  alt={resource.title}
                  className="h-full w-full object-cover transition-transform duration-500"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/5">
                  <BookOpen className="h-8 w-8 text-primary/20" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`/resources/${resource.id}`, '_blank')
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-xl hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(resource.id)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-xl hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(resource.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="flex flex-1 flex-col p-3 pt-4">
              <div className="mb-2">
                 <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                    {resource.subject || 'Geral'}
                 </span>
              </div>
              <h3 className="line-clamp-1 font-bold text-[14px] text-foreground mb-1 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => onEdit?.(resource.id)}>
                {resource.title}
              </h3>
              {resource.description && (
                <p className="line-clamp-2 text-[11px] text-muted-foreground/80 mb-3">
                  {resource.description}
                </p>
              )}
              
              <div className="mt-auto pt-3 border-t border-border/50 flex flex-wrap gap-1">
                 {resource.grades.slice(0, 3).map(g => (
                   <span key={g} className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded leading-none italic">
                     {g}
                   </span>
                 ))}
                 {resource.grades.length > 3 && (
                   <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 leading-none">+{resource.grades.length - 3}</span>
                 )}
              </div>
            </CardContent>
          </Card>
        )}
      />
      
      {resources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhum recurso encontrado</p>
          </div>
      )}
    </div>
  )
}
