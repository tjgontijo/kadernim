'use client'

import { ReactNode } from 'react'
import { ResourceRequestWithRelations, ResourceRequestStatus } from '@/types/request'
import { RequestCard } from './request-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RequestTabsProps {
  requests: ResourceRequestWithRelations[]
  currentUserId?: string
  onEdit?: (request: ResourceRequestWithRelations) => void
  onDelete?: (id: string) => void
  onViewDetails?: (request: ResourceRequestWithRelations) => void
  filtersTrigger?: ReactNode
}

const STATUSES: { value: ResourceRequestStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Enviada' },
  { value: 'IN_PRODUCTION', label: 'Em Produção' },
  { value: 'PUBLISHED', label: 'Publicada' },
]

export function RequestTabs({
  requests,
  currentUserId,
  onEdit,
  onDelete,
  onViewDetails,
  filtersTrigger,
}: RequestTabsProps) {
  return (
    <div className="md:hidden space-y-4">
      <Tabs defaultValue="SUBMITTED" className="w-full">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex gap-8 bg-transparent p-0 whitespace-nowrap">
              {STATUSES.map((status) => {
                const count = requests.filter((r) => r.status === status.value).length
                return (
                  <TabsTrigger
                    key={status.value}
                    value={status.value}
                    className="relative px-0 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent transition-colors"
                  >
                    <span>{status.label}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full scale-x-0 data-[state=active]:scale-x-100 transition-transform origin-left" />
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {filtersTrigger && (
            <div className="shrink-0">
              {filtersTrigger}
            </div>
          )}
        </div>

        {STATUSES.map((status) => {
          const items = requests.filter((r) => r.status === status.value)
          return (
            <TabsContent key={status.value} value={status.value} className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
                  <p className="text-sm">Nenhuma solicitação</p>
                  <p className="text-xs text-gray-500">Use o botão flutuante para criar a primeira.</p>
                </div>
              ) : (
                items.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                  />
                ))
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
