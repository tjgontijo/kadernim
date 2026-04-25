'use client'

import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
      style: {
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0, transparent 10px, var(--line) 10px, var(--line) 11px)'
      }
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
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)

  // Merge items for navigation
  const allItems = [
    ...files.map(f => ({ ...f, galleryType: 'file' as const })),
    ...videos.map(v => ({ ...v, galleryType: 'video' as const, name: v.title }))
  ]

  const sidebarViewportRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previewFrameRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [sidebarHeight, setSidebarHeight] = useState(0)

  useEffect(() => {
    if (!scrollContainerRef.current || !sidebarViewportRef.current) return
    const content = scrollContainerRef.current
    const viewport = sidebarViewportRef.current

    const syncScrollHint = () => {
      const isScrollable = content.scrollHeight > viewport.clientHeight + 2
      const isNearBottom = viewport.scrollTop + viewport.clientHeight >= content.scrollHeight - 8
      setShowScrollHint(isScrollable && !isNearBottom)
    }

    const observer = new ResizeObserver(() => syncScrollHint())
    observer.observe(content)
    observer.observe(viewport)
    viewport.addEventListener('scroll', syncScrollHint, { passive: true })

    syncScrollHint()

    return () => {
      observer.disconnect()
      viewport.removeEventListener('scroll', syncScrollHint)
    }
  }, [allItems, sidebarHeight])

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
  const selectedVideoIndex = selectedItem?.galleryType === 'video'
    ? videos.findIndex((video) => video.id === selectedItem.id)
    : -1

  useEffect(() => {
    if (selectedImages.length === 0) {
      if (activeImageIndex !== 0) setActiveImageIndex(0)
      return
    }

    if (activeImageIndex < 0 || activeImageIndex >= selectedImages.length) {
      setActiveImageIndex(0)
    }
  }, [activeImageIndex, selectedImages.length])

  useEffect(() => {
    if (!previewFrameRef.current) return

    const previewFrame = previewFrameRef.current
    const syncSidebarHeight = () => {
      setSidebarHeight(Math.ceil(previewFrame.getBoundingClientRect().height))
    }

    const observer = new ResizeObserver(() => syncSidebarHeight())
    observer.observe(previewFrame)
    syncSidebarHeight()

    return () => observer.disconnect()
  }, [selectedItemId, activeImageIndex, selectedImages.length])

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
    const showPageNavigation = !isVideo && selectedImages.length > 1

    return (
      <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2 transition-shadow hover:shadow-3">
        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />

        {/* Main Container: Sidebar + Gallery */}
        <div className="flex gap-[16px] items-stretch">
          {/* Sidebar with File Covers - Scrollable */}
          {allItems.length > 0 && (
            <div
              className="relative flex-shrink-0 w-[124px] -ml-[6px] overflow-hidden"
              style={{ height: sidebarHeight > 0 ? `${sidebarHeight}px` : '0px' }}
            >
              <div
                ref={sidebarViewportRef}
                className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide native-scroll"
                onWheelCapture={(event) => event.stopPropagation()}
              >
                <div ref={scrollContainerRef} className="flex flex-col gap-[16px] pb-[56px] pt-[4px] px-[6px]">
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
                          className={`relative w-full [aspect-ratio:3/4] rounded-2 overflow-hidden transition-all ${isSelected
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
              </div>

              {showScrollHint && (
                <div className="absolute bottom-0 left-[6px] right-[6px] z-20 h-[56px] bg-gradient-to-t from-card via-card/85 to-transparent pointer-events-none flex items-end justify-center pb-[10px]">
                  <ChevronDown className="w-[16px] h-[16px] text-terracotta animate-bounce opacity-80" />
                </div>
              )}
            </div>
          )}

          {/* Gallery with Carousel */}
          <div className="flex-1 flex flex-col gap-[12px]">
            {/* Image with Carousel Controls */}
            <div className="flex items-center justify-center gap-[12px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center flex-shrink-0">
                {showPageNavigation && (
                  <button
                    onClick={handlePrevious}
                    className="rounded-full p-[8px] hover:bg-line transition-colors"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="w-[24px] h-[24px] text-ink" />
                  </button>
                )}
              </div>

              {/* Image OR Video Thumbnail - A4 Aspect Ratio */}
              <div
                ref={previewFrameRef}
                className="w-full max-w-[760px] [aspect-ratio:7/10] bg-paper-2 rounded-4 border border-line-soft overflow-hidden relative shadow-3"
              >
                {isVideo ? (
                  <button
                    type="button"
                    onClick={() => {
                      if ((selectedItem as ResourceVideo).url) {
                        setIsVideoDialogOpen(true)
                      }
                    }}
                    className="relative w-full h-full group cursor-pointer text-left"
                    aria-label={`Abrir vídeo ${(selectedItem as ResourceVideo).title}`}
                  >
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
                  </button>
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

              <div className="flex h-[40px] w-[40px] items-center justify-center flex-shrink-0">
                {showPageNavigation && (
                  <button
                    onClick={handleNext}
                    className="rounded-full p-[8px] hover:bg-line transition-colors"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="w-[24px] h-[24px] text-ink" />
                  </button>
                )}
              </div>
            </div>

            {!isVideo && (
              <div className="text-center text-[13px] font-medium text-ink-mute">
                Página {activeImageIndex + 1} de {selectedImages.length}
              </div>
            )}

            {isVideo && selectedVideoIndex >= 0 && (
              <div className="text-center text-[13px] font-medium text-ink-mute">
                Vídeo {selectedVideoIndex + 1} de {videos.length}
              </div>
            )}
          </div>
        </div>

        {isVideo && (
          <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
            <DialogContent className="w-[min(96vw,1600px)] md:min-w-[900px] max-w-none gap-0 border-line bg-card p-0 overflow-hidden">
              <DialogHeader className="px-6 py-4 border-b border-line bg-card">
                <DialogTitle className="font-display text-[22px] text-ink">
                  {(selectedItem as ResourceVideo).title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center bg-card p-5 sm:p-8">
                {(selectedItem as ResourceVideo).url ? (
                  <video
                    key={(selectedItem as ResourceVideo).url ?? selectedItem.id}
                    controls
                    autoPlay
                    playsInline
                    className="mx-auto block h-auto w-auto max-w-full max-h-[82vh] md:min-h-[420px] rounded-3 border border-line-soft bg-card shadow-2"
                    src={(selectedItem as ResourceVideo).url ?? undefined}
                  />
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center text-paper/80">
                    Vídeo indisponível
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2 transition-shadow hover:shadow-3">
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
      <div className="flex [aspect-ratio:7/10] items-center justify-center rounded-4 bg-paper-2 border border-line-soft">
        <div className="text-center space-y-[8px]">
          <span className="text-[32px]">🖼️</span>
          <p className="text-[13px] font-medium text-ink-mute">Sem materiais disponíveis</p>
        </div>
      </div>
    </div>
  )
}
