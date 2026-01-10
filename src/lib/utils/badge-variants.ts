/**
 * Badge Variants - Padronização de cores para badges
 * Usa variáveis CSS de globals.css para consistência
 */

export const badgeVariants = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
} as const

export function getBadgeVariant(type: keyof typeof badgeVariants) {
  return badgeVariants[type]
}

// Status-specific helpers
export const statusBadgeMap = {
  // Campaign status
  SENT: 'success',
  SENDING: 'info',
  SCHEDULED: 'warning',
  DRAFT: 'neutral',
  FAILED: 'error',

  // Generic status
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  PENDING: 'warning',
  ERROR: 'error',

  // Automation status
  SUCCESS: 'success',
  RUNNING: 'info',
  COMPLETED: 'success',
} as const

export function getStatusBadge(status: string): string {
  const normalizedStatus = status.toUpperCase()
  const type = statusBadgeMap[normalizedStatus as keyof typeof statusBadgeMap] || 'neutral'
  return badgeVariants[type]
}

// Role-specific helpers
export const roleBadgeMap = {
  admin: 'warning',
  subscriber: 'success',
  editor: 'info',
  manager: 'primary',
  user: 'neutral',
} as const

export function getRoleBadge(role: string): string {
  const normalizedRole = role.toLowerCase()
  const type = roleBadgeMap[normalizedRole as keyof typeof roleBadgeMap] || 'neutral'
  return badgeVariants[type]
}

// Template type helpers (para email/push/whatsapp)
export const templateTypeBadgeMap = {
  email: 'info',
  push: 'primary',
  whatsapp: 'success',
  sms: 'warning',
} as const

export function getTemplateTypeBadge(type: string): string {
  const normalizedType = type.toLowerCase()
  const badgeType = templateTypeBadgeMap[normalizedType as keyof typeof templateTypeBadgeMap] || 'neutral'
  return badgeVariants[badgeType]
}
