const capitalizeFirstName = (fullName: string): string => {
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  const [firstName] = trimmed.split(/\s+/)
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
}

export function buildPixCheckoutWhatsappMessage({
  name,
  amount,
  pixPayload,
  expirationDate,
  paymentUrl,
}: {
  name: string
  amount: string
  pixPayload: string
  expirationDate: string
  paymentUrl: string
}): string {
  const firstName = capitalizeFirstName(name) || name

  return (
    `Olá ${firstName}! 👋\n\n` +
    `Seu código PIX está pronto para pagar sua assinatura Kadernim Pro! 🎉\n\n` +
    `💰 *Valor:* ${amount}\n` +
    `⏰ *Válido até:* ${expirationDate}\n\n` +
    `🔐 *Código PIX (Copia e Cola):*\n` +
    `${pixPayload}\n\n` +
    `🏦 *Como pagar:*\n` +
    `1️⃣ Abra o app do seu banco\n` +
    `2️⃣ Escolha PIX → Copia e Cola\n` +
    `3️⃣ Cole o código acima\n` +
    `4️⃣ Confirme o pagamento ✅\n\n` +
    `📱 Ou acesse o checkout:\n` +
    `${paymentUrl}\n\n` +
    `❓ Dúvidas? Responda este chat!`
  )
}
