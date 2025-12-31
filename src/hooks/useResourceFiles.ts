'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ResourceFile {
  id: string
  name: string
  url: string
  createdAt: string
}

/**
 * Hook to upload a file to a resource
 */
export function useUploadResourceFile(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; url: string }) => {
      const formData = new FormData()
      formData.append('name', input.name)
      formData.append('url', input.url)

      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/files`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload do arquivo')
      }

      return response.json() as Promise<ResourceFile>
    },
    onSuccess: () => {
      toast.success('Arquivo adicionado com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao adicionar arquivo'
      )
    },
  })
}

/**
 * Hook to delete a file from a resource
 */
export function useDeleteResourceFile(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/files/${fileId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar arquivo')
      }
    },
    onSuccess: () => {
      toast.success('Arquivo removido com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao deletar arquivo'
      )
    },
  })
}
