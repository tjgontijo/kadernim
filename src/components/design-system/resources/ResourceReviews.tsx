'use client'

import { useState, useEffect } from 'react'
import { Check, MessageSquarePlus, RefreshCw, Star, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'

interface ReviewWithUser {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  status: ReviewStatus
  user: {
    id: string
    name: string
    image: string | null
    roleTitle: string | null
    location: string | null
  }
}

interface ResourceReviewsProps {
  resourceId: string
  averageRating: number
  reviewCount: number
  isAdmin?: boolean
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24))

  if (diffInDays === 0) return 'hoje'
  if (diffInDays === 1) return 'ontem'
  if (diffInDays < 7) return `há ${diffInDays} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getStatusLabel(status: ReviewStatus) {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado'
    case 'REJECTED':
      return 'Recusado'
    case 'FLAGGED':
      return 'Sinalizado'
    default:
      return 'Pendente'
  }
}

function getStatusClassName(status: ReviewStatus) {
  switch (status) {
    case 'APPROVED':
      return 'bg-sage-2 text-sage border-sage/20'
    case 'REJECTED':
      return 'bg-berry-2 text-berry border-berry/20'
    case 'FLAGGED':
      return 'bg-mustard-2 text-ink border-mustard/30'
    default:
      return 'bg-paper-2 text-ink-soft border-line'
  }
}

export function ResourceReviews({
  resourceId,
  averageRating,
  reviewCount,
  isAdmin = false,
}: ResourceReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAllDialog, setShowAllDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [moderatingReviewId, setModeratingReviewId] = useState<string | null>(null)
  const [formRating, setFormRating] = useState(0)
  const [formComment, setFormComment] = useState('')
  const [formFeedback, setFormFeedback] = useState<string | null>(null)

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/v1/resources/${resourceId}/reviews`)
      const json = await res.json()
      if (json.data) setReviews(json.data)
    } catch (err) {
      console.error('Failed to load reviews', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [resourceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formRating === 0) {
      setFormFeedback('Por favor, escolha uma nota.')
      return
    }

    setSubmitting(true)
    setFormFeedback(null)

    try {
      const res = await fetch(`/api/v1/resources/${resourceId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: formRating, comment: formComment }),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Erro ao enviar avaliação')

      setFormFeedback('Avaliação enviada com sucesso! Ela passará por moderação.')
      setFormRating(0)
      setFormComment('')
      setTimeout(() => setShowForm(false), 3000)
    } catch (err) {
      setFormFeedback(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  const handleModeration = async (reviewId: string, action: 'approve' | 'decline') => {
    try {
      setModeratingReviewId(reviewId)
      const res = await fetch(`/api/v1/resources/${resourceId}/reviews`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Erro ao moderar avaliação')
      }

      await loadReviews()
      toast.success(action === 'approve' ? 'Comentário aprovado.' : 'Comentário recusado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro inesperado ao moderar comentário')
    } finally {
      setModeratingReviewId(null)
    }
  }

  const approvedReviews = reviews.filter((rev) => rev.status === 'APPROVED')
  const previewReviews = approvedReviews.slice(0, 4)
  const dialogReviews = isAdmin ? reviews : approvedReviews

  const canOpenAllDialog = isAdmin
    ? dialogReviews.length > 0
    : dialogReviews.length > 4

  const displayAverage =
    loading || approvedReviews.length === 0
      ? averageRating
      : approvedReviews.reduce((acc, rev) => acc + rev.rating, 0) / approvedReviews.length

  const displayReviewCount = loading ? reviewCount : approvedReviews.length

  const renderReviewItem = (
    rev: ReviewWithUser,
    options: { showStatus?: boolean; showActions?: boolean } = {}
  ) => {
    const showStatus = options.showStatus ?? false
    const showActions = options.showActions ?? false
    const isModerating = moderatingReviewId === rev.id

    return (
      <div
        key={rev.id}
        className="flex gap-[16px] items-start border-b border-line pb-[24px] mb-[24px] last:border-0 last:mb-0 last:pb-0"
      >
        <div className="w-[36px] h-[36px] shrink-0 bg-terracotta-2 text-terracotta flex items-center justify-center font-display font-semibold rounded-full text-[14px]">
          {getInitials(rev.user.name)}
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-[8px] mb-[6px] flex-wrap">
            <strong className="font-semibold text-ink text-[14px]">{rev.user.name}</strong>
            <span className="text-ink-mute text-[12px] truncate max-w-[260px]">
              · {rev.user.roleTitle || 'Professora'} {rev.user.location && `· ${rev.user.location}`}
            </span>
            {showStatus && (
              <span
                className={`ml-auto inline-flex items-center rounded-full border px-[8px] py-[2px] text-[11px] font-semibold ${getStatusClassName(rev.status)}`}
              >
                {getStatusLabel(rev.status)}
              </span>
            )}
          </div>

          {rev.comment && (
            <p className="text-[14px] text-ink-soft leading-[1.5] mb-[8px]">{rev.comment}</p>
          )}

          <div className="flex items-center gap-[12px]">
            <div className="flex text-mustard gap-[1px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-[10px] h-[10px] ${i <= rev.rating ? 'fill-current' : 'text-line opacity-50'}`}
                />
              ))}
            </div>
            <div className="text-[12px] text-ink-mute tracking-[0.02em]">{formatDate(rev.createdAt)}</div>
          </div>

          {showActions && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={isModerating || rev.status === 'APPROVED'}
                onClick={() => handleModeration(rev.id, 'approve')}
                className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-2 px-3 py-1 text-[12px] font-semibold text-sage disabled:opacity-50"
              >
                {isModerating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Aceitar
              </button>
              <button
                type="button"
                disabled={isModerating || rev.status === 'REJECTED'}
                onClick={() => handleModeration(rev.id, 'decline')}
                className="inline-flex items-center gap-1.5 rounded-full border border-berry/30 bg-berry-2 px-3 py-1 text-[12px] font-semibold text-berry disabled:opacity-50"
              >
                {isModerating ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
                Declinar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-[24px] bg-card border border-line rounded-4 p-[32px] shadow-1">
      <div className="flex items-center justify-between mb-[20px]">
        <h3 className="font-display font-semibold text-[20px] text-ink flex items-center gap-[8px]">
          <span className="text-terracotta text-[18px] opacity-60">04</span> O que dizem as professoras
        </h3>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setFormFeedback(null)
          }}
          className="flex items-center gap-[8px] text-[13px] font-semibold text-terracotta hover:bg-terracotta-2 px-[12px] py-[6px] rounded-full transition-colors"
        >
          <MessageSquarePlus className="w-[16px] h-[16px]" strokeWidth={2.5} />
          {showForm ? 'Fechar formulário' : 'Avaliar material'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-[32px] p-[20px] bg-paper-2 rounded-3 border border-line animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-semibold text-ink">Qual nota você daria?</label>
              <div className="flex gap-[6px]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormRating(i)}
                    className="p-[4px] hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-[24px] h-[24px] ${
                        i <= formRating ? 'fill-mustard text-mustard' : 'text-line'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-semibold text-ink">Seu comentário (opcional)</label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Compartilhe como você usou este material..."
                className="w-full bg-card border border-line rounded-2 p-[12px] text-[14px] min-h-[100px] focus:outline-none focus:ring-1 focus:ring-terracotta/20"
              />
            </div>

            {formFeedback && (
              <div
                className={`text-[12px] font-semibold ${
                  formFeedback.includes('sucesso') ? 'text-sage' : 'text-destructive'
                }`}
              >
                {formFeedback}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-terracotta text-white px-[20px] py-[10px] rounded-full text-[14px] font-semibold hover:bg-[oklch(0.60_0.12_42)] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-[16px] mb-[32px] pb-[20px] border-b border-dashed border-line">
        <div className="font-display font-bold text-[36px] text-ink leading-none">
          {displayAverage > 0 ? displayAverage.toFixed(1) : '--'}
        </div>
        <div className="flex flex-col gap-[4px]">
          <div className="flex text-mustard gap-[2px]">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-[14px] h-[14px] ${
                  i <= Math.round(displayAverage) ? 'fill-current' : 'text-line'
                }`}
              />
            ))}
          </div>
          <div className="text-[12px] text-ink-mute tracking-[0.02em]">
            baseado em {displayReviewCount} avaliações
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex py-[20px] items-center justify-center">
          <RefreshCw className="w-[20px] h-[20px] animate-spin text-ink-mute" />
        </div>
      ) : previewReviews.length > 0 ? (
        <div className="flex flex-col">{previewReviews.map((rev) => renderReviewItem(rev))}</div>
      ) : (
        <div className="py-[12px] text-center">
          <p className="text-[14px] text-ink-mute italic">Ainda não há avaliações aprovadas para este material.</p>
        </div>
      )}

      {canOpenAllDialog && (
        <button
          type="button"
          onClick={() => setShowAllDialog(true)}
          className="mt-[20px] text-[13px] text-terracotta font-semibold hover:underline"
        >
          Ver mais avaliações
        </button>
      )}

      <Dialog open={showAllDialog} onOpenChange={setShowAllDialog}>
        <DialogContent className="sm:max-w-3xl h-[85vh] max-h-[85vh] !flex !flex-col overflow-hidden p-0 !gap-0">
          <DialogHeader className="px-6 py-5 border-b border-line bg-paper-2">
            <DialogTitle className="font-display text-[24px] font-semibold text-ink">
              Todas as avaliações
            </DialogTitle>
            <p className="text-[13px] font-medium text-ink-mute">
              {dialogReviews.length} comentário(s) {isAdmin ? 'com moderação disponível' : 'aprovado(s)'}
            </p>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 scrollbar-thin">
            {dialogReviews.length > 0 ? (
              <div className="flex flex-col">
                {dialogReviews.map((rev) =>
                  renderReviewItem(rev, {
                    showStatus: isAdmin,
                    showActions: isAdmin,
                  })
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-ink-mute text-sm">
                Nenhuma avaliação disponível no momento.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
