'use client'

import { forwardRef } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import { ResourceCard } from './ResourceCard'

interface Resource {
  id: string
  title: string
  description?: string | null
  thumbUrl?: string | null
  educationLevel: string
  subject: string
  isFree: boolean
  hasAccess: boolean
}

const ListContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...style, width: '100%' }}
      className={className ? `w-full ${className}` : 'w-full'}
      {...props}
    />
  )
)
ListContainer.displayName = 'ResourceGridList'

const ItemContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ ...style, width: '100%' }} {...props} />
  )
)
ItemContainer.displayName = 'ResourceGridItem'

interface ResourceGridProps {
  items: Resource[]
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isLoading?: boolean
  isFetchingNextPage?: boolean
}

export function ResourceGrid({
  items,
  fetchNextPage,
  hasNextPage = false,
  isLoading = false,
  isFetchingNextPage = false,
}: ResourceGridProps) {
  return (
    <div className="w-full">
      {items.length === 0 && !isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500">Nenhum material encontrado</p>
          </div>
        </div>
      ) : (
        <VirtuosoGrid
          useWindowScroll
          data={items}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage?.()
            }
          }}
          itemContent={(index, resource) => (
            <ResourceCard
              key={resource.id}
              id={resource.id}
              title={resource.title}
              description={resource.description}
              thumbUrl={resource.thumbUrl}
              educationLevel={resource.educationLevel}
              subject={resource.subject}
              hasAccess={resource.hasAccess}
              isFree={resource.isFree}
            />
          )}
          components={{
            Item: ItemContainer,
            List: ListContainer,
          }}
          listClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          overscan={12}
          increaseViewportBy={{ top: 200, bottom: 400 }}
        />
      )}
    </div>
  )
}
