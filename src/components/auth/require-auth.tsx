// src/components/auth/require-auth.tsx
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export async function RequireAuth({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session) {
    redirect('/')
  }
  
  return <>{children}</>
}
