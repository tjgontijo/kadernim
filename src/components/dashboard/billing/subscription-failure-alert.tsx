'use client'

import { useState } from 'react'
import { AlertTriangle, RefreshCw, XCircle, PhoneCall } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const failureReasonLabels: Record<string, { title: string; description: string }> = {
  FAILED_DEBIT: {
    title: 'Saldo Insuficiente',
    description: 'Não havia saldo suficiente na sua conta para a cobrança automática.',
  },
  EXPIRED: {
    title: 'Autorização Expirou',
    description: 'A autorização do PIX automático expirou antes da cobrança.',
  },
  DENIED: {
    title: 'Autorização Negada',
    description: 'Seu banco recusou a transação. Verifique com sua instituição financeira.',
  },
  CANCELED_BY_USER: {
    title: 'Cancelada no Banco',
    description: 'A autorização foi cancelada pelo app do seu banco.',
  },
  OTHER: {
    title: 'Erro na Cobrança',
    description: 'Ocorreu um erro ao processar o pagamento automático.',
  },
}

interface SubscriptionFailureAlertProps {
  subscriptionId: string
  failureReason?: string
  failureCount: number
  nextRetryAt?: Date
}

export function SubscriptionFailureAlert({
  subscriptionId,
  failureReason,
  failureCount,
  nextRetryAt,
}: SubscriptionFailureAlertProps) {
  const [loading, setLoading] = useState(false)

  const reason = failureReasonLabels[failureReason ?? 'OTHER'] ?? failureReasonLabels.OTHER
  const isCritical = failureCount >= 3

  async function handleRetry() {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/billing/subscription/${subscriptionId}/retry`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.status === 429) {
        const seconds = data.retryAfterSeconds ?? 0
        const minutes = Math.ceil(seconds / 60)
        toast.warning(`Aguarde ${minutes} min antes de tentar novamente.`)
        return
      }

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao tentar cobrar. Tente novamente.')
        return
      }

      toast.success('Solicitação enviada! Aguarde a confirmação do banco.')
      setTimeout(() => window.location.reload(), 2000)
    } catch {
      toast.error('Erro de conexão. Verifique sua internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-xl border p-5 mb-2 ${isCritical ? 'border-destructive/50 bg-destructive/5' : 'border-orange-300/50 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-800/50'}`}>
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 shrink-0 rounded-full p-2 ${isCritical ? 'bg-destructive/10' : 'bg-orange-100 dark:bg-orange-900/40'}`}>
          {isCritical
            ? <XCircle className="h-5 w-5 text-destructive" />
            : <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${isCritical ? 'text-destructive' : 'text-orange-800 dark:text-orange-300'}`}>
            {isCritical ? 'Acesso em risco de suspensão' : '⚠️ Pagamento recusado'}
          </p>
          <p className={`text-sm mt-1 ${isCritical ? 'text-destructive/80' : 'text-orange-700 dark:text-orange-400'}`}>
            <strong>{reason.title}:</strong> {reason.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Tentativas: <strong>{failureCount}</strong></span>
            {nextRetryAt && (
              <span>
                Próxima tentativa automática:{' '}
                <strong>{format(new Date(nextRetryAt), "dd/MM 'às' HH:mm", { locale: ptBR })}</strong>
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              className={isCritical ? 'bg-destructive hover:bg-destructive/90' : 'bg-orange-600 hover:bg-orange-700 text-white'}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Tentando...' : 'Tentar Agora'}
            </Button>

            <Button size="sm" variant="outline" asChild>
              <a href="https://wa.me/556198698704" target="_blank" rel="noopener noreferrer">
                <PhoneCall className="h-3.5 w-3.5 mr-1.5" />
                Falar com Suporte
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
