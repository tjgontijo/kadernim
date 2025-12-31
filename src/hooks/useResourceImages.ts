'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ResourceImage {
  id: string
  cloudinaryPublicId: string
  alt?: string
  order: number
  createdAt: string
}

/**
 * Hook to fetch all images for a resource
 */
export function useResourceImages(resourceId: string) {
  return useQuery({
    queryKey: ['resource-images', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}/images`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar imagens')
      }

      return response.json() as Promise<{ images: ResourceImage[] }>
    },
  })
}

/**
 * Hook to upload an image to a resource
 */
export function useUploadResourceImage(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, alt }: { file: File; alt?: string }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (alt) {
        formData.append('alt', alt)
      }

      const response = await fetch(`/api/v1/admin/resources/${resourceId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload da imagem')
      }

      return response.json() as Promise<ResourceImage & { url: string }>
    },
    onSuccess: () => {
      toast.success('Imagem adicionada com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-images', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar imagem'
      toast.error(message)
    },
  })
}

/**
 * Hook to delete an image from a resource
 */
export function useDeleteResourceImage(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (imageId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/images/${imageId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar imagem')
      }
    },
    onSuccess: () => {
      toast.success('Imagem removida com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-images', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao deletar imagem'
      toast.error(message)
    },
  })
}

/**
 * Hook to update image metadata (alt text, order)
 */
export function useUpdateResourceImage(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      imageId,
      alt,
      order,
    }: {
      imageId: string
      alt?: string
      order?: number
    }) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/images/${imageId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alt, order }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar imagem')
      }

      return response.json() as Promise<ResourceImage>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resource-images', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar imagem'
      toast.error(message)
    },
  })
}
