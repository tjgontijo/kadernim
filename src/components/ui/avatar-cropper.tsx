'use client'

import React, { useState, useCallback } from 'react'
import Cropper, { Point, Area } from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getCroppedImg } from '@/lib/utils/image-crop'
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react'

interface AvatarCropperProps {
    image: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onCropComplete: (file: File) => void
}

export function AvatarCropper({
    image,
    open,
    onOpenChange,
    onCropComplete,
}: AvatarCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropChange = (crop: Point) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteInternal = useCallback(
        (allowedArea: Area, pixelArea: Area) => {
            setCroppedAreaPixels(pixelArea)
        },
        []
    )

    const handleSave = async () => {
        if (!image || !croppedAreaPixels) return

        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(image, croppedAreaPixels)
            if (croppedBlob) {
                const file = new File([croppedBlob], 'avatar.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                })
                onCropComplete(file)
                onOpenChange(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    if (!image) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background gap-0">
                <DialogHeader className="p-6 border-b bg-muted/30">
                    <DialogTitle className="text-xl font-bold">Ajustar Foto</DialogTitle>
                </DialogHeader>

                <div className="relative h-[400px] w-full bg-[#1a1a1a]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" />
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="flex-1"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <DialogFooter className="flex gap-3 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="font-bold rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="font-bold rounded-xl shadow-lg shadow-primary/20 min-w-[120px]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Aplicar Foto'
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
