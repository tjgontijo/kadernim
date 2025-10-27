'use client'

import { ResourceRequestWithRelations, ResourceRequestStatus } from '@/types/request'
import { RequestCard } from './request-card'
import { Badge } from '@/components/ui/badge'

interface RequestKanbanProps {
  requests: ResourceRequestWithRelations[]
  currentUserId?: string
  onEdit?: (request: ResourceRequestWithRelations) => void
  onDelete?: (id: string) => void
  onViewDetails?: (request: ResourceRequestWithRelations) => void
}

const STATUSES: { value: ResourceRequestStatus; label: string; color: string }[] = [
  { value: 'SUBMITTED', label: 'Enviada', color: 'bg-blue-50' },
  { value: 'IN_PRODUCTION', label: 'Em Produção', color: 'bg-yellow-50' },
  { value: 'PUBLISHED', label: 'Publicada', color: 'bg-green-50' },
]

export function RequestKanban({
  requests,
  currentUserId,
  onEdit,
  onDelete,
  onViewDetails,
}: RequestKanbanProps) {
  const groupedRequests = STATUSES.map((status) => ({
    ...status,
    items: requests.filter((r) => r.status === status.value),
  }))

  return (
    <div className="hidden md:grid gap-4 flex-1" style={{ gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))' }}>
      {groupedRequests.map((column) => (
        <div key={column.value} className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden min-h-0">
          {/* Column Header */}
          <div className="flex items-center justify-between sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-4 py-3 shrink-0">
            <h2 className="font-semibold text-base text-gray-900">{column.label}</h2>
            <Badge variant="secondary" className="ml-2">
              {column.items.length}
            </Badge>
          </div>

          {/* Column Content - Scrollable */}
          <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${column.color}`}>
            {column.items.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <p className="text-sm">Nenhuma solicitação</p>
              </div>
            ) : (
              column.items.map((request) => (
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
          </div>
        </div>
      ))}
    </div>
  )
}
