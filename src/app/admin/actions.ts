'use server'

import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'

export async function signOutAction() {
  await authClient.signOut()
  redirect('/login')
}
