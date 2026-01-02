'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ResourceVideo {
  id: string
  title: string
  cloudinaryPublicId: string
  url: string
  thumbnail?: string
  duration?: number
  order: number
  createdAt: string
}

/**
 * Hook to fetch all videos for a resource
 */
export function useResourceVideos(resourceId: string) {
  return useQuery({
    queryKey: ['resource-videos', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar vídeos')
      }

      return response.json() as Promise<{ videos: ResourceVideo[] }>
    },
  })
}

/**
 * Hook to upload a video to a resource
 */
export function useUploadResourceVideo(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)

      const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload do vídeo')
      }

      return response.json() as Promise<ResourceVideo>
    },
    onSuccess: () => {
      toast.success('Vídeo adicionado com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-videos', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar vídeo'
      toast.error(message)
    },
  })
}

/**
 * Hook to delete a video from a resource
 */
export function useDeleteResourceVideo(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/videos/${videoId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar vídeo')
      }
    },
    onSuccess: () => {
      toast.success('Vídeo removido com sucesso!')
      queryClient.invalidateQueries({
        queryKey: ['resource-videos', resourceId],
      })
      queryClient.invalidateQueries({
        queryKey: ['resource-detail', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao deletar vídeo'
      toast.error(message)
    },
  })
}

/**
 * Hook to update video metadata (title, order)
 */
export function useUpdateResourceVideo(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      videoId,
      title,
      order,
    }: {
      videoId: string
      title?: string
      order?: number
    }) => {
      const response = await fetch(
        `/api/v1/admin/resources/${resourceId}/videos/${videoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, order }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar vídeo')
      }

      return response.json() as Promise<ResourceVideo>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resource-videos', resourceId],
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar vídeo'
      toast.error(message)
    },
  })
}
