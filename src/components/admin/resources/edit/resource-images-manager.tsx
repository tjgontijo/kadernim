'use client'

import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Loader2,
    Upload,
    Star,
    Maximize2
} from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DeleteConfirmDialog } from '@/components/admin/shared/delete-confirm-dialog'
import imageCompression from 'browser-image-compression'

interface ResourceImage {
    id: string
    cloudinaryPublicId: string
    url: string
    alt: string | null
    order: number
}

interface ResourceImagesManagerProps {
    resourceId: string
    initialImages: ResourceImage[]
    currentThumbUrl: string | null
}

export function ResourceImagesManager({
    resourceId,
    initialImages,
    currentThumbUrl
}: ResourceImagesManagerProps) {
    const queryClient = useQueryClient()
    const [images, setImages] = useState<ResourceImage[]>(initialImages)
    const [isUploading, setIsUploading] = useState(false)
    const [activeId, setActiveId] = useState<string | null>(null)

    // Sort images by order field initially
    useEffect(() => {
        setImages(initialImages.sort((a, b) => a.order - b.order))
    }, [initialImages])

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`/api/v1/admin/resources/${resourceId}/images`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Falha no upload da imagem')
            }

            return response.json()
        },
        onSuccess: (newImage) => {
            setImages((prev) => [...prev, newImage])
            toast.success('Imagem enviada com sucesso')
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem')
        },
        onSettled: () => setIsUploading(false)
    })

    const deleteMutation = useMutation({
        mutationFn: async (imageId: string) => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}/images/${imageId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Falha ao excluir imagem')
            }
        },
        onSuccess: (_, imageId) => {
            setImages((prev) => prev.filter((img) => img.id !== imageId))
            toast.success('Imagem excluída')
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        },
    })

    const setThumbMutation = useMutation({
        mutationFn: async (url: string) => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ thumbUrl: url }),
            })

            if (!response.ok) {
                throw new Error('Falha ao definir capa')
            }
        },
        onSuccess: () => {
            toast.success('Capa do recurso atualizada')
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        },
    })

    const reorderMutation = useMutation({
        mutationFn: async (updates: { id: string, order: number }[]) => {
            const response = await fetch(`/api/v1/admin/resources/${resourceId}/images/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            })

            if (!response.ok) {
                throw new Error('Falha ao reordenar imagens')
            }
        },
        onError: () => {
            toast.error('Erro ao salvar nova ordem')
            // Revert changes on error would be ideal, but for now just invalidating will reset to server state
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
        }
    })

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8
            }

            console.log(`[COMPRESSION] Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
            const compressedFile = await imageCompression(file, options)
            const img = new Image()
            img.src = URL.createObjectURL(compressedFile)
            await img.decode()
            console.log(`[IMAGE INFO] Dimensões: ${img.width}x${img.height}`)
            console.log(`[COMPRESSION] Final: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)

            const finalFile = new File([compressedFile], file.name, {
                type: file.type,
                lastModified: Date.now(),
            })

            uploadMutation.mutate(finalFile)
        } catch (error) {
            console.error('[COMPRESSION ERROR]', error)
            toast.error('Erro ao processar imagem. Tentando subir original...')
            uploadMutation.mutate(file)
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Prepare updates for API
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }))

                // Optimistic update done, now save to server
                reorderMutation.mutate(updates)

                return newItems
            })
        }

        setActiveId(null)
    }

    return (
        <div className="space-y-8">
            {/* Upload Zone */}
            <div className="relative">
                <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                />
                <label
                    htmlFor="image-upload"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all relative overflow-hidden",
                        "bg-background hover:bg-muted/50 border-muted-foreground/20 hover:border-primary/50 group",
                        isUploading && "opacity-80 cursor-not-allowed border-primary/30"
                    )}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <>
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <div className="absolute inset-x-0 -bottom-1 flex justify-center">
                                        <div className="h-1.5 w-8 bg-primary/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary animate-progress-fast" />
                                        </div>
                                    </div>
                                </div>
                                <p className="mb-1 text-sm font-black text-primary animate-pulse italic">
                                    Processando Imagem...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <p className="mb-1 text-sm font-bold">Clique para enviar uma imagem</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG ou WEBP (Max 10MB)</p>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {/* Images Grid Sorting */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={images.map(img => img.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((image) => (
                            <SortableImageItem
                                key={image.id}
                                image={image}
                                isThumb={image.url === currentThumbUrl}
                                setThumb={setThumbMutation.mutate}
                                deleteImage={deleteMutation.mutate}
                                isProcessing={deleteMutation.isPending || setThumbMutation.isPending}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeId ? (
                        <div className="opacity-80 scale-105 cursor-grabbing">
                            {/* Render a static version of the card being dragged */}
                            {(() => {
                                const img = images.find(i => i.id === activeId);
                                if (!img) return null;
                                return (
                                    <Card className="overflow-hidden border bg-background shadow-xl">
                                        <div className="aspect-square relative overflow-hidden bg-muted/50 flex items-center justify-center">
                                            <img
                                                src={img.url}
                                                alt={img.alt || 'drag'}
                                                className="relative z-10 max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                    </Card>
                                )
                            })()}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {images.length === 0 && !isUploading && (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-muted/20 border border-dashed rounded-2xl">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma imagem cadastrada</p>
                </div>
            )}
        </div>
    )
}

// Subcomponent for Sortable Item

function SortableImageItem({
    image,
    isThumb,
    setThumb,
    deleteImage,
    isProcessing
}: {
    image: ResourceImage,
    isThumb: boolean,
    setThumb: (url: string) => void,
    deleteImage: (id: string) => void,
    isProcessing: boolean
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group touch-none">
            <Card className={cn(
                "overflow-hidden border bg-background shadow-sm hover:shadow-xl transition-all h-full",
                isThumb && "ring-2 ring-primary border-primary/50"
            )}>
                {/* Drag Handle Area (whole image) */}
                <div
                    {...attributes}
                    {...listeners}
                    className="aspect-square relative overflow-hidden bg-muted/50 flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-20 scale-110"
                        style={{ backgroundImage: `url(${image.url})` }}
                    />
                    <img
                        src={image.url}
                        alt={image.alt || 'Resource image'}
                        className="relative z-10 max-w-full max-h-full object-contain pointer-events-none"
                    />

                    {/* Actions Overlay - prevent drag on buttons */}
                    <div
                        className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9 rounded-full"
                            onClick={() => window.open(image.url, '_blank')}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <DeleteConfirmDialog
                            onConfirm={() => deleteImage(image.id)}
                            isLoading={isProcessing}
                            title="Excluir Imagem?"
                            description="Esta imagem será removida permanentemente."
                            trigger={
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-9 w-9 rounded-full"
                                    disabled={isProcessing}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            }
                        />
                    </div>

                    {isThumb && (
                        <div className="absolute top-2 left-2 pointer-events-none">
                            <Badge className="bg-primary text-primary-foreground font-bold shadow-lg">Capa</Badge>
                        </div>
                    )}
                </div>

                <CardContent className="p-3">
                    <Button
                        variant={isThumb ? "secondary" : "outline"}
                        size="sm"
                        className="w-full h-9 font-bold text-[10px] uppercase tracking-wider"
                        onClick={() => setThumb(image.url)}
                        disabled={isThumb || isProcessing}
                    >
                        {isThumb ? (
                            <>
                                <Star className="h-3 w-3 mr-1.5 fill-current" />
                                Capa Atual
                            </>
                        ) : (
                            'Definir como Capa'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

