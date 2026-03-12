const NON_DIGITS_REGEX = /\D/g

function getDigits(value: string) {
  return value.replace(NON_DIGITS_REGEX, '')
}

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value)
}

function formatCpfDigits(digits: string) {
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function formatCnpjDigits(digits: string) {
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

function calculateCpfCheckDigit(baseDigits: string) {
  let sum = 0

  for (let index = 0; index < baseDigits.length; index += 1) {
    sum += Number(baseDigits[index]) * (baseDigits.length + 1 - index)
  }

  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

function calculateCnpjCheckDigit(baseDigits: string) {
  const weights = baseDigits.length === 12
    ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0

  for (let index = 0; index < baseDigits.length; index += 1) {
    sum += Number(baseDigits[index]) * weights[index]
  }

  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function normalizeCpfCnpj(value: string) {
  return getDigits(value)
}

export function applyCpfMask(value: string) {
  return formatCpfDigits(getDigits(value).slice(0, 11))
}

export function applyCnpjMask(value: string) {
  return formatCnpjDigits(getDigits(value).slice(0, 14))
}

export function applyCpfCnpjMask(value: string) {
  const digits = getDigits(value)

  if (digits.length <= 11) {
    return formatCpfDigits(digits.slice(0, 11))
  }

  return formatCnpjDigits(digits.slice(0, 14))
}

export function isValidCpf(value: string) {
  const digits = getDigits(value)

  if (digits.length !== 11 || hasRepeatedDigits(digits)) {
    return false
  }

  const firstCheckDigit = calculateCpfCheckDigit(digits.slice(0, 9))
  const secondCheckDigit = calculateCpfCheckDigit(digits.slice(0, 10))

  return firstCheckDigit === Number(digits[9]) && secondCheckDigit === Number(digits[10])
}

export function isValidCnpj(value: string) {
  const digits = getDigits(value)

  if (digits.length !== 14 || hasRepeatedDigits(digits)) {
    return false
  }

  const firstCheckDigit = calculateCnpjCheckDigit(digits.slice(0, 12))
  const secondCheckDigit = calculateCnpjCheckDigit(digits.slice(0, 13))

  return firstCheckDigit === Number(digits[12]) && secondCheckDigit === Number(digits[13])
}

export function isValidCpfCnpj(value: string) {
  const digits = getDigits(value)

  if (digits.length === 11) {
    return isValidCpf(digits)
  }

  if (digits.length === 14) {
    return isValidCnpj(digits)
  }

  return false
}
