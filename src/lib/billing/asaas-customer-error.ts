function normalizeAsaasErrorMessage(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function shouldRecreateDeletedAsaasCustomer(message: string) {
  if (message.includes('[404]')) {
    return true
  }

  const normalizedMessage = normalizeAsaasErrorMessage(message)

  return normalizedMessage.includes('invalid_object')
    && (
      normalizedMessage.includes('cliente excluido')
      || normalizedMessage.includes('customer deleted')
    )
}
