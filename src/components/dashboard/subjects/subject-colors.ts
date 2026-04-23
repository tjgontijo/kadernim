import { DEFAULT_SUBJECT_COLOR } from '@/lib/taxonomy/constants'

function normalizeHexColor(color?: string | null) {
  if (!color) return null
  const normalized = color.trim().toUpperCase()
  if (!/^#([0-9A-F]{6}|[0-9A-F]{3})$/.test(normalized)) return null

  if (normalized.length === 4) {
    return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
  }

  return normalized
}

function tint(color: string, amount: number) {
  return `color-mix(in oklab, ${color} ${amount}%, transparent)`
}

export function getSubjectTheme(subject: { slug?: string | null; color?: string | null; textColor?: string | null }) {
  const colorFromDb = subject.color?.trim()
  const textColorFromDb = subject.textColor?.trim()
  const normalizedHex = normalizeHexColor(subject.color)
  const normalizedTextHex = normalizeHexColor(subject.textColor)
  const accent = textColorFromDb || normalizedTextHex || 'var(--ink)'

  // Prioridade máxima: cor armazenada no banco (seed usa oklch).
  if (colorFromDb) {
    return {
      fg: accent,
      bg: colorFromDb,
      border: `color-mix(in oklab, ${accent} 35%, ${colorFromDb} 65%)`,
      countBg: `color-mix(in oklab, ${accent} 18%, white 82%)`,
      countFg: accent,
    }
  }

  if (normalizedHex) {
    return {
      fg: accent,
      bg: hexToRgba(normalizedHex, 0.22),
      border: hexToRgba(normalizedHex, 0.55),
      countBg: hexToRgba(normalizedHex, 0.22),
      countFg: accent,
    }
  }

  return {
    fg: 'var(--terracotta)',
    bg: 'var(--terracotta-2)',
    border: 'var(--line-soft)',
    countBg: 'var(--terracotta-2)',
    countFg: 'var(--terracotta)',
  }
}

export function getSubjectColor(color?: string | null) {
  return normalizeHexColor(color) || DEFAULT_SUBJECT_COLOR
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = getSubjectColor(hex)

  let r = 0
  let g = 0
  let b = 0

  if (normalized.length === 4) {
    r = parseInt(normalized[1] + normalized[1], 16)
    g = parseInt(normalized[2] + normalized[2], 16)
    b = parseInt(normalized[3] + normalized[3], 16)
  } else {
    r = parseInt(normalized.slice(1, 3), 16)
    g = parseInt(normalized.slice(3, 5), 16)
    b = parseInt(normalized.slice(5, 7), 16)
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
