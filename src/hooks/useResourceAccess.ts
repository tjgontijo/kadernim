'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
}

interface AccessRecord {
  id: string
  userId: string
  resourceId: string
  user: User
  source: string | null
  grantedAt: string
  expiresAt: string | null
}

/**
 * Hook to fetch all access records for a resource
 */
export function useResourceAccess(resourceId: string) {
  return useQuery({
    queryKey: ['resource-access', resourceId],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar acessos')
      }

      return response.json() as Promise<{ accessList: AccessRecord[] }>
    },
  })
}

/**
 * Hook to grant access to a resource
 */
export function useGrantAccess(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { userId: string; expiresAt?: string }) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao conceder acesso')
      }

      return response.json() as Promise<AccessRecord>
    },
    onSuccess: () => {
      toast.success('Acesso concedido com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-access', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao conceder acesso'
      toast.error(message)
    },
  })
}

/**
 * Hook to revoke access to a resource
 */
export function useRevokeAccess(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accessId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/access/${accessId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao revogar acesso')
      }
    },
    onSuccess: () => {
      toast.success('Acesso revogado com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-access', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao revogar acesso'
      toast.error(message)
    },
  })
}
