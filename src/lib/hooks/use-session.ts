// src/lib/hooks/use-session.ts
// Este hook é um wrapper do useSession do Better Auth
// Use diretamente: import { useSession } from '@/lib/auth/auth-client'

'use client'

import { useSession as useBetterAuthSession } from '@/lib/auth/auth-client'

export function useSession() {
  return useBetterAuthSession()
}