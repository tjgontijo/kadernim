'use client'

import { useSession } from '@/lib/auth/auth-client'
import { UserRoleType } from '@/types/user-role'
import { isSubscriber, isAdmin as checkIsAdmin } from '@/lib/auth/roles'

type UserWithSubscription = {
  subscriptionTier?: string | null;
  role?: UserRoleType | string | null;
}

export function useUserAccess() {
  const { data: session, isPending } = useSession()
  const user = session?.user as UserWithSubscription
  
  const isAdmin = checkIsAdmin(user?.role as UserRoleType)
  const hasSubscriberAccess = isSubscriber(user?.role as UserRoleType)
  const isFreeUser = !hasSubscriberAccess
  
  // Não mostra ads enquanto está carregando a sessão
  // Só mostra ads se não está carregando E o usuário é free
  const showAds = !isPending && isFreeUser
  
  return {
    // Acesso baseado em roles
    hasSubscriberAccess,
    isFreeUser,
    isAdmin,
    showAds,
    
    // Dados do usuário
    role: user?.role || 'user',
    subscriptionTier: user?.subscriptionTier || 'free',
    user,
    isLoading: isPending
  }
}

export const useSubscriberStatus = useUserAccess
