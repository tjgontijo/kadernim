'use client'

import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import { Autoplay, Zoom } from 'swiper/modules'
import { LazyImage } from '@/components/shared/lazy-image'

import 'swiper/css'
import 'swiper/css/zoom'

interface ResourceImage {
    id: string
    url?: string | null
    alt?: string | null
    order: number
}

interface ResourceImageCarouselProps {
    images: ResourceImage[]
    title: string
    autoplay?: boolean
    loop?: boolean
    zoom?: boolean
}

export function ResourceImageCarousel({
    images,
    title,
    autoplay = true,
    loop = true,
    zoom = false,
}: ResourceImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
    const [mounted, setMounted] = useState(false)

    // Filter images that actually have a URL
    const validImages = images.filter((img) => !!img.url)

    useEffect(() => {
        setMounted(true)
    }, [])

    const modules = []
    if (autoplay) modules.push(Autoplay)
    if (zoom) modules.push(Zoom)

    const autoplayConfig = autoplay
        ? { delay: 4000, disableOnInteraction: true }
        : false

    if (!mounted) {
        return (
            <div className="relative aspect-[7/10] w-full bg-muted animate-pulse rounded-2xl" />
        )
    }

    if (validImages.length === 0) {
        return (
            <div className="flex aspect-[7/10] w-full items-center justify-center rounded-2xl bg-muted border border-dashed border-border/50">
                <div className="text-center space-y-2">
                    <span className="text-3xl">🖼️</span>
                    <p className="text-sm font-medium text-muted-foreground/60">Sem imagem disponível</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-sm">
                <Swiper
                    modules={modules}
                    slidesPerView={1}
                    loop={loop && validImages.length > 1}
                    autoplay={autoplayConfig}
                    zoom={zoom ? { maxRatio: 3 } : false}
                    onSwiper={setSwiperInstance}
                    onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                    className="aspect-[7/10]"
                >
                    {validImages.map((img, index) => (
                        <SwiperSlide key={img.id}>
                            <div className="relative aspect-[7/10] w-full">
                                <LazyImage
                                    src={img.url!}
                                    alt={img.alt || `${title} - Imagem ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                                    priority={index === 0}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    className="object-contain"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Paginação externa - dots */}
            {validImages.length > 1 && (
                <div className="flex justify-center gap-2.5">
                    {validImages.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => swiperInstance?.slideToLoop(index)}
                            aria-label={`Ir para imagem ${index + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 ${activeIndex === index
                                ? 'w-6 bg-primary shadow-sm shadow-primary/20'
                                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
