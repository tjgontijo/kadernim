'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ResourceRequestWithRelations } from '@/types/request'
import { Heart, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'
import { voteResourceRequest } from '@/app/(dashboard)/requests/actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RequestDetailModalProps {
  request: ResourceRequestWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId?: string
  onEdit?: (request: ResourceRequestWithRelations) => void
  onDelete?: (id: string) => void
}

export function RequestDetailModal({
  request,
  open,
  onOpenChange,
  currentUserId,
  onEdit,
  onDelete,
}: RequestDetailModalProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(request?.hasUserVoted || false)
  const [voteCount, setVoteCount] = useState(request?.voteCount || 0)

  if (!request) return null

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl">{request.title}</DialogTitle>
            <Badge className={getStatusColor(request.status)}>
              {getStatusLabel(request.status)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges de Level e Subject */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{request.educationLevel.name}</Badge>
            <Badge variant="outline">{request.subject.name}</Badge>
          </div>

          {/* Descrição completa */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Descrição</h3>
            <div
              className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: request.description }}
            />
          </div>

          {/* Informações do criador */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Criador</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.user.image || ''} />
                <AvatarFallback>
                  {request.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{request.user.name}</p>
                <p className="text-xs text-gray-500">
                  Criado em{' '}
                  {format(new Date(request.createdAt), 'dd MMM yyyy', {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Votos */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm">Votos</h3>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-red-500">{voteCount}</p>
              <Button
                variant="outline"
                onClick={handleVote}
                disabled={!canVote || isVoting}
                className={`gap-2 ${
                  hasVoted ? 'text-red-500 border-red-500' : ''
                }`}
              >
                <Heart
                  size={18}
                  fill={hasVoted ? 'currentColor' : 'none'}
                />
                {hasVoted ? 'Remover Voto' : 'Votar'}
              </Button>
            </div>
          </div>

          {/* Ações do criador */}
          {isCreator && (
            <div className="border-t pt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onEdit?.(request)
                  onOpenChange(false)
                }}
                className="flex-1"
              >
                <Edit2 size={16} className="mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete?.(request.id)
                  onOpenChange(false)
                }}
                className="flex-1"
              >
                <Trash2 size={16} className="mr-2" />
                Deletar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
