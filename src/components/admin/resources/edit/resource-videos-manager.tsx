'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Plus,
    Trash2,
    Video,
    Loader2,
    Upload,
    Play,
    Clock,
    Film
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/index'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'

interface ResourceVideo {
    id: string
    title: string
    cloudinaryPublicId: string
    url: string
    thumbnail: string | null
    duration: number | null
}

interface ResourceVideosManagerProps {
    resourceId: string
    initialVideos: ResourceVideo[]
}

export function ResourceVideosManager({
    resourceId,
    initialVideos
}: ResourceVideosManagerProps) {
    const queryClient = useQueryClient()
    const [videos, setVideos] = useState<ResourceVideo[]>(initialVideos)
    const [isUploading, setIsUploading] = useState(false)
    const [videoTitle, setVideoTitle] = useState('')

    const uploadMutation = useMutation({
        mutationFn: async ({ file, title }: { file: File, title: string }) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title)

            const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Falha no upload do vídeo')
            }

            return response.json()
        },
        onSuccess: (newVideo) => {
            setVideos((prev) => [...prev, newVideo])
            toast.success('Vídeo enviado com sucesso')
            setVideoTitle('')
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Erro ao enviar vídeo')
        },
        onSettled: () => setIsUploading(false)
    })

    const deleteMutation = useMutation({
        mutationFn: async (videoId: string) => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos/${videoId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Falha ao excluir vídeo')
            }
        },
        onSuccess: (_, videoId) => {
            setVideos((prev) => prev.filter((v) => v.id !== videoId))
            toast.success('Vídeo removido')
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        },
    })

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!videoTitle.trim()) {
            toast.error('Informe um título para o vídeo antes de enviar')
            return
        }

        setIsUploading(true)
        uploadMutation.mutate({ file, title: videoTitle })
    }

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return '00:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <Card className="overflow-hidden border shadow-sm">
                <CardHeader className="bg-muted/30 border-b py-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Film className="h-4 w-4 text-primary" />
                        Adicionar Novo Vídeo
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Título do Vídeo</label>
                            <Input
                                placeholder="Ex: Aula Prática de Laboratório..."
                                value={videoTitle}
                                onChange={(e) => setVideoTitle(e.target.value)}
                                className="h-12 bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary"
                                disabled={isUploading}
                            />
                        </div>
                        <div className="flex items-end">
                            <input
                                type="file"
                                id="video-upload"
                                className="hidden"
                                accept="video/*"
                                onChange={handleFileUpload}
                                disabled={isUploading || !videoTitle.trim()}
                            />
                            <label
                                htmlFor="video-upload"
                                className={cn(
                                    "flex items-center justify-center px-6 h-12 rounded-xl cursor-pointer transition-all font-bold text-sm",
                                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                                    (isUploading || !videoTitle.trim()) && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Fazer Upload do Vídeo
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Videos List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                    <Card key={video.id} className="overflow-hidden group border bg-background shadow-sm hover:shadow-xl transition-all">
                        <div className="flex flex-col sm:flex-row h-full">
                            {/* Thumbnail Side */}
                            <div className="sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-black shrink-0">
                                {video.thumbnail ? (
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Video className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-2xl">
                                        <Play className="h-6 w-6 text-white fill-current" />
                                    </div>
                                </div>
                                {video.duration && (
                                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded flex items-center gap-1 backdrop-blur-sm">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(video.duration)}
                                    </div>
                                )}
                            </div>

                            {/* Content Side */}
                            <div className="flex-1 p-5 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] bg-muted/30 border-none px-2 py-0">
                                            Cloudinary
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground text-xs font-bold h-8"
                                        onClick={() => window.open(video.url, '_blank')}
                                    >
                                        Visualizar
                                    </Button>
                                    <DeleteConfirmDialog
                                        onConfirm={() => deleteMutation.mutate(video.id)}
                                        isLoading={deleteMutation.isPending}
                                        title="Remover Vídeo?"
                                        description="Este vídeo e sua thumbnail serão removidos permanentemente."
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {videos.length === 0 && !isUploading && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/20 border border-dashed rounded-2xl">
                        <Video className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium">Nenhum vídeo adicionado</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Vídeos ajudam os alunos a entender melhor o recurso.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
