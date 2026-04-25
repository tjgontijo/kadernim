'use client'

import { useEffect, useState, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, ChevronLeft, ChevronRight, FileText, PlayCircle, Video } from 'lucide-react'
import { LazyImage } from '@/components/shared/lazy-image'

interface ResourceImage {
  id: string
  url?: string | null
  alt?: string | null
}

interface ResourceFile {
  id: string
  name: string
  images: ResourceImage[]
}

interface ResourceVideo {
  id: string
  title: string
  url?: string | null
  thumbnail?: string | null
  duration?: number | null
}

interface ResourceGalleryProps {
  files?: ResourceFile[]
  videos?: ResourceVideo[]
  title?: string
}

function formatFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function SimulatedCover({ fileName, index, isVideo = false }: { fileName: string; index: number; isVideo?: boolean }) {
  const PATTERNS = [
    {
      bg: 'bg-paper-2',
      style: {}
    },
    {
      bg: 'bg-paper-2',
      style: {
        backgroundImage: 'radial-gradient(var(--line) 1px, transparent 0)',
        backgroundSize: '8px 8px'
      }
    },
    {
      bg: 'bg-paper-2',
      style: {
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 19px, var(--line-soft) 19px, var(--line-soft) 20px)'
      }
    },
    {
      bg: 'bg-paper-2',
      style: {
        backgroundImage: 'linear-gradient(var(--line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--line-soft) 1px, transparent 1px)',
        backgroundSize: '12px 12px'
      }
    }
  ]

  const pattern = PATTERNS[index % PATTERNS.length]

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-[8px] bg-paper-2`}>
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={pattern.style} />

      {/* Decorative Tape */}
      <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 rotate-2 w-[35px] h-[12px] bg-[#dfd6cd] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />

      {/* Internal Label Wrapper */}
      <div className="relative z-10 bg-paper border border-line-soft w-full h-auto py-[12px] flex flex-col items-center justify-center px-[6px] shadow-sm transform -rotate-1">
        {isVideo ? (
          <PlayCircle className="w-[14px] h-[14px] text-terracotta mb-[4px] opacity-90" strokeWidth={2.5} />
        ) : (
          <FileText className="w-[12px] h-[12px] text-terracotta mb-[6px] opacity-90" strokeWidth={2} />
        )}

        <p className="w-full text-center font-display text-[10px] font-medium leading-[1.15] text-ink line-clamp-4">
          {formatFileName(fileName)}
        </p>

        {isVideo && (
          <span className="mt-[4px] px-[4px] py-[1px] bg-terracotta/10 text-terracotta text-[8px] font-bold uppercase tracking-tighter rounded-[2px] border border-terracotta/20">
            Vídeo Aula
          </span>
        )}
      </div>
    </div>
  )
}

export function ResourceGallery({ files = [], videos = [], title = 'Material' }: ResourceGalleryProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Merge items for navigation
  const allItems = [
    ...files.map(f => ({ ...f, galleryType: 'file' as const })),
    ...videos.map(v => ({ ...v, galleryType: 'video' as const, name: v.title }))
  ]

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    if (!scrollContainerRef.current) return
    const content = scrollContainerRef.current
    const viewport = content.closest('[data-radix-scroll-area-viewport]') || content.parentElement

    if (!viewport) return

    const checkScroll = () => {
      setCanScroll(content.scrollHeight > viewport.clientHeight + 2)
    }

    const observer = new ResizeObserver(() => checkScroll())
    observer.observe(content)
    observer.observe(viewport)

    checkScroll()

    return () => observer.disconnect()
  }, [allItems])

  const selectedItem = selectedItemId ? allItems.find((i) => i.id === selectedItemId) : null

  useEffect(() => {
    if (!allItems.length) return

    if (!selectedItemId) {
      setSelectedItemId(allItems[0]?.id)
    }
  }, [allItems, selectedItemId])

  const selectedImages: ResourceImage[] =
    selectedItem?.galleryType === 'file'
      ? ((selectedItem as ResourceFile).images ?? [])
      : []
  const selectedImage = selectedImages[activeImageIndex] ?? selectedImages[0] ?? null

  useEffect(() => {
    if (selectedImages.length === 0) {
      if (activeImageIndex !== 0) setActiveImageIndex(0)
      return
    }

    if (activeImageIndex < 0 || activeImageIndex >= selectedImages.length) {
      setActiveImageIndex(0)
    }
  }, [activeImageIndex, selectedImages.length])

  const handlePrevious = () => {
    if (selectedImages.length <= 1) return
    setActiveImageIndex((prev) =>
      prev === 0 ? selectedImages.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    if (selectedImages.length <= 1) return
    setActiveImageIndex((prev) =>
      prev === selectedImages.length - 1 ? 0 : prev + 1
    )
  }

  if (allItems.length > 0 && selectedItem) {
    const isVideo = selectedItem.galleryType === 'video'

    return (
      <div className="mx-auto w-full max-w-[760px] bg-card border border-line rounded-5 p-[16px] relative shadow-2 transition-shadow hover:shadow-3">
        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />

        {/* Main Container: Sidebar + Gallery */}
        <div className="flex gap-[16px] items-start">
          {/* Sidebar with File Covers - Scrollable */}
          {allItems.length > 0 && (
            <div className="relative flex-shrink-0 w-[100px] -ml-[4px] self-stretch h-0 min-h-full overflow-hidden">
              <ScrollArea className="absolute inset-0">
                <div ref={scrollContainerRef} className="flex flex-col gap-[16px] pb-[40px] pt-[4px] px-[6px]">
                  {allItems.map((item, idx) => {
                    const isSelected = selectedItemId === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedItemId(item.id)
                          setActiveImageIndex(0)
                        }}
                        className="group flex flex-col items-center gap-[8px] text-left w-full transition-all focus:outline-none"
                      >
                        <div
                          className={`relative w-full aspect-[7/10] rounded-2 overflow-hidden transition-all ${isSelected
                            ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-card shadow-2 border-transparent'
                            : 'border border-line shadow-1 group-hover:border-ink-lighter group-hover:shadow-2'
                            }`}
                        >
                          <SimulatedCover
                            fileName={item.name}
                            index={idx}
                            isVideo={item.galleryType === 'video'}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>

              {/* Scroll Indicator Overlay */}
              {canScroll && (
                <div className="absolute bottom-0 left-[6px] right-[6px] h-[48px] bg-gradient-to-t from-card to-transparent pointer-events-none flex items-end justify-center pb-[8px]">
                  <ChevronDown className="w-[16px] h-[16px] text-terracotta animate-bounce opacity-80" />
                </div>
              )}
            </div>
          )}

          {/* Gallery with Carousel */}
          <div className="flex-1 min-w-0 flex flex-col gap-[12px] items-center justify-start">
            {/* Image with Carousel Controls */}
            <div className="w-full flex items-center justify-center gap-[8px] sm:gap-[12px]">
              {/* Previous Button */}
              {!isVideo && selectedImages.length > 1 && (
                <button
                  onClick={handlePrevious}
                  className="rounded-full p-[8px] hover:bg-line transition-colors flex-shrink-0"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-[24px] h-[24px] text-ink" />
                </button>
              )}

              {/* Image OR Video Thumbnail - A4 Aspect Ratio */}
              <div className="aspect-[7/10] bg-paper-2 rounded-4 border border-line-soft overflow-hidden relative w-full max-w-[480px] shadow-3">
                {isVideo ? (
                  <div className="relative w-full h-full group cursor-pointer">
                    <LazyImage
                      src={(selectedItem as any).thumbnail || ''}
                      alt={(selectedItem as any).title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                    <div className="absolute inset-0 bg-ink/10 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
                      <div className="w-[64px] h-[64px] bg-paper/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-[32px] h-[32px] text-terracotta" />
                      </div>
                    </div>
                    {/* Video Duration Badge */}
                    {(selectedItem as any).duration && (selectedItem as any).duration > 0 && (
                      <div className="absolute bottom-[12px] right-[12px] bg-ink/80 text-paper text-[10px] px-[6px] py-[2px] rounded-1 font-bold">
                        {Math.floor((selectedItem as any).duration / 60)}:{(selectedItem as any).duration % 60 < 10 ? '0' : ''}{(selectedItem as any).duration % 60}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedImage?.url ? (
                    <LazyImage
                      src={selectedImage.url}
                      alt={selectedImage.alt || `${selectedItem.name} - página ${activeImageIndex + 1}`}
                      fill
                      className="object-contain scale-105"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-paper-2 text-ink-mute text-[13px] font-medium px-[12px] text-center">
                      Pré-visualização indisponível para este arquivo
                    </div>
                  )
                )}
              </div>

              {/* Next Button */}
              {!isVideo && selectedImages.length > 1 && (
                <button
                  onClick={handleNext}
                  className="rounded-full p-[8px] hover:bg-line transition-colors flex-shrink-0"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-[24px] h-[24px] text-ink" />
                </button>
              )}
            </div>

            {/* Page Counter */}
            {!isVideo && selectedImages.length > 1 && (
              <div className="text-center text-[13px] font-medium text-ink-mute">
                Página {activeImageIndex + 1} de {selectedImages.length}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2 transition-shadow hover:shadow-3">
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
      <div className="flex aspect-[7/10] items-center justify-center rounded-4 bg-paper-2 border border-line-soft">
        <div className="text-center space-y-[8px]">
          <span className="text-[32px]">🖼️</span>
          <p className="text-[13px] font-medium text-ink-mute">Sem materiais disponíveis</p>
        </div>
      </div>
    </div>
  )
}
