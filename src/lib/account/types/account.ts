export interface AccountVersionInfo {
  version: string
  buildAt: string
}

export interface AccountSubscriptionSummary {
  id: string
  isActive: boolean
  purchaseDate: Date
  expiresAt: Date | null
}

export interface AccountProfile {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  role: string
  emailVerified: boolean
  createdAt: Date
  subscription: AccountSubscriptionSummary | null
  latestVersion: AccountVersionInfo | null
}

export interface AccountProfileSummary {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  role: string
}

export interface AccountSession {
  id: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
  expiresAt: Date
  isCurrent: boolean
}
