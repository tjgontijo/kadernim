'use client'

import { ResourceRequestWithRelations } from '@/types/request'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'
import { voteResourceRequest } from '@/app/(dashboard)/requests/actions'
import { toast } from 'sonner'
import React from 'react'

interface RequestCardProps {
  request: ResourceRequestWithRelations
  currentUserId?: string
  onEdit?: (request: ResourceRequestWithRelations) => void
  onDelete?: (id: string) => void
  onViewDetails?: (request: ResourceRequestWithRelations) => void
}

function RequestCardComponent({
  request,
  currentUserId,
  onEdit,
  onDelete,
  onViewDetails,
}: RequestCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(request.hasUserVoted || false)
  const [voteCount, setVoteCount] = useState(request.voteCount)

  const isCreator = currentUserId === request.userId
  const canVote = !isCreator && currentUserId

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canVote || isVoting) return

    setIsVoting(true)
    try {
      const result = await voteResourceRequest(request.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setHasVoted(!hasVoted)
        setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1)
        toast.success(hasVoted ? 'Voto removido' : 'Voto adicionado')
      }
    } catch {
      toast.error('Erro ao votar')
    } finally {
      setIsVoting(false)
    }
  }

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PRODUCTION':
        return 'bg-yellow-100 text-yellow-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'Enviada'
      case 'IN_PRODUCTION':
        return 'Em Produção'
      case 'PUBLISHED':
        return 'Publicada'
      default:
        return status
    }
  }

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onViewDetails?.(request)}
    >
      <div className="space-y-3">
        {/* Header com título e status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm md:text-base truncate">
              {request.title}
            </h3>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>

        {/* Badges de Level e Subject */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {request.educationLevel.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {request.subject.name}
          </Badge>
        </div>

        {/* Descrição truncada */}
        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
          {truncateDescription(request.description, 100)}
        </p>

        {/* Footer com criador, votos e ações */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.user.image || ''} />
              <AvatarFallback className="text-xs">
                {request.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 truncate">
              {request.user.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de voto */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={!canVote || isVoting}
              className={`gap-1 ${
                hasVoted ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <Heart
                size={16}
                fill={hasVoted ? 'currentColor' : 'none'}
              />
              <span className="text-xs">{voteCount}</span>
            </Button>

            {/* Ações do criador */}
            {isCreator && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(request)
                  }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(request.id)
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export const RequestCard = React.memo(RequestCardComponent);
