'use client'

import { useSession } from '@/lib/auth/auth-client'

type UserWithSubscription = {
  subscriptionTier?: string | null;
  role?: string | null;
}

export function usePremiumStatus() {
  const { data: session, isPending } = useSession()
  const user = session?.user as UserWithSubscription
  
  const isAdmin = user?.role === 'admin'
  const isPremium = isAdmin || user?.subscriptionTier === 'premium'
  const isFree = !isPremium
  
  // Não mostra ads enquanto está carregando a sessão
  // Só mostra ads se não está carregando E o usuário é free
  const showAds = !isPending && isFree
  
  return {
    isPremium,
    isFree,
    showAds,
    subscriptionTier: user?.subscriptionTier || 'free',
    isAdmin,
    user,
    isLoading: isPending
  }
}
