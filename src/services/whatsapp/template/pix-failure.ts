const capitalizeFirstName = (fullName: string): string => {
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  const [firstName] = trimmed.split(/\s+/)
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

export function buildPixFailureWhatsappMessage({
  name,
  failureReason,
  retryUrl,
}: {
  name: string
  failureReason: string
  retryUrl: string
}): string {
  const firstName = capitalizeFirstName(name) || name

  const reasons: Record<string, string> = {
    FAILED_DEBIT: 'Saldo insuficiente',
    EXPIRED: 'Código expirou',
    DENIED: 'Autorização negada',
    CANCELED_BY_USER: 'Cancelada no app do seu banco',
    OTHER: 'Erro na transação',
  }

  const reason = reasons[failureReason] || 'Erro desconhecido'

  return (
    `Olá ${firstName}! ⚠️\n\n` +
    `Não conseguimos cobrar sua assinatura Kadernim Pro.\n\n` +
    `📌 *Motivo:* ${reason}\n\n` +
    `💡 *O que fazer:*\n` +
    `1️⃣ Verifique o saldo da sua conta\n` +
    `2️⃣ Clique no link abaixo para tentar novamente\n` +
    `3️⃣ Seu acesso continua ativado enquanto isso!\n\n` +
    `${retryUrl}\n\n` +
    `Tentaremos automaticamente em 3 dias. 🔄`
  )
}
