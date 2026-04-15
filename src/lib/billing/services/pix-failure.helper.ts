import { SubscriptionFailureReason } from '@db'

export function mapPixAutomaticFailureReason(
  eventName: string,
  errorMessage?: string
): SubscriptionFailureReason {
  if (errorMessage) {
    const lowerError = errorMessage.toLowerCase()
    if (lowerError.includes('saldo') || lowerError.includes('insufficient')) {
      return SubscriptionFailureReason.FAILED_DEBIT
    }
    if (lowerError.includes('denied') || lowerError.includes('rejei')) {
      return SubscriptionFailureReason.DENIED
    }
    if (lowerError.includes('cancel') || lowerError.includes('cancelad')) {
      return SubscriptionFailureReason.CANCELED_BY_USER
    }
    if (lowerError.includes('expi') || lowerError.includes('vencid')) {
      return SubscriptionFailureReason.EXPIRED
    }
  }

  switch (eventName) {
    case 'PIX_AUTOMATIC_AUTHORIZATION_DENIED':
      return SubscriptionFailureReason.DENIED
    case 'PIX_AUTOMATIC_AUTHORIZATION_EXPIRED':
    case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_EXPIRED':
      return SubscriptionFailureReason.EXPIRED
    case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELED':
    case 'PIX_AUTOMATIC_AUTHORIZATION_CANCELLED':
    case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED':
      return SubscriptionFailureReason.CANCELED_BY_USER
    case 'PIX_AUTOMATIC_RECURRING_AUTHORIZATION_REFUSED':
      return SubscriptionFailureReason.FAILED_DEBIT
    default:
      return SubscriptionFailureReason.OTHER
  }
}

export function getPixFailureMessage(reason: SubscriptionFailureReason): string {
  switch (reason) {
    case SubscriptionFailureReason.EXPIRED:
      return 'O código PIX expirou antes do pagamento ser realizado.'
    case SubscriptionFailureReason.DENIED:
      return 'Seu banco rejeitou a transação. Verifique com seu banco.'
    case SubscriptionFailureReason.CANCELED_BY_USER:
      return 'Você ou seu banco cancelou a autorização de pagamento.'
    case SubscriptionFailureReason.FAILED_DEBIT:
      return 'Falha ao débitar. Verifique seu saldo ou dados bancários.'
    default:
      return 'Erro ao processar o pagamento. Tente novamente.'
  }
}

export function calculateNextRetryDate(failureCount: number): Date {
  const now = new Date()
  if (failureCount <= 0) failureCount = 1

  switch (failureCount) {
    case 1:
      return new Date(now.getTime() + 1 * 60 * 60 * 1000)
    case 2:
      return new Date(now.getTime() + 6 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }
}

export function shouldAutoCancel(
  failureCount: number,
  lastFailureAt: Date | null | undefined
): boolean {
  if (failureCount < 3) return false
  if (!lastFailureAt) return false

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return lastFailureAt > thirtyDaysAgo
}
