import { useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth/auth-client'

interface SessionUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role?: string | null
}

interface SessionPayload {
  data?: {
    user?: SessionUser | null
  }
}

interface AuthClientSessionResponse {
  data?: {
    user?: SessionUser | null
  } | null
  user?: SessionUser | null
}

export function useSessionQuery() {
  return useQuery<SessionPayload>({
    queryKey: ['session'],
    queryFn: async () => {
      // Usa o client oficial para garantir shape estável
      const res = (await authClient.getSession()) as AuthClientSessionResponse
      const user = res?.data?.user ?? res?.user ?? null
      return { data: { user } } as SessionPayload
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  })
}
