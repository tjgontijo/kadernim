'use client'

import { useSession } from '@/lib/auth/auth-client'

type UserWithSubscription = {
  subscriptionTier?: string | null;
  role?: string | null;
}

export function usePremiumStatus() {
  const { data: session } = useSession()
  const user = session?.user as UserWithSubscription
  
  const isPremium = user?.subscriptionTier === 'premium'
  const isFree = !isPremium
  
  return {
    isPremium,
    isFree,
    showAds: isFree, // Mostra ads apenas para usuários free
    subscriptionTier: user?.subscriptionTier || 'free',
    user
  }
}
