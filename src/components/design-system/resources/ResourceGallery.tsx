import { useState } from 'react'
import { LazyImage } from '@/components/shared/lazy-image'

interface ResourceImage {
  id: string
  url?: string | null
  alt?: string | null
}

interface ResourceGalleryProps {
  images?: ResourceImage[]
  thumbUrl?: string | null
  title?: string
}

export function ResourceGallery({ images, thumbUrl, title = 'Material' }: ResourceGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (images && images.length > 0) {
    return (
      <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
        <div className="aspect-[4/3] bg-paper-2 rounded-3 border border-line-soft overflow-hidden mb-[12px] relative w-full">
          <LazyImage
            src={images[activeImageIndex].url || ''}
            alt={`${title} - view ${activeImageIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-[10px] overflow-x-auto pb-1 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-[72px] h-[54px] rounded-2 border overflow-hidden shrink-0 bg-paper-2 relative transition-colors ${
                  activeImageIndex === idx ? 'border-terracotta' : 'border-line-soft hover:border-line'
                }`}
              >
                <LazyImage
                  src={img.url || ''}
                  alt={`${title} - thumb ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (thumbUrl) {
    return (
      <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
        <div className="relative aspect-[4/3] rounded-3 overflow-hidden border border-line-soft bg-paper-2">
          <LazyImage
            src={thumbUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-line rounded-5 p-[16px] relative shadow-2">
      <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 -rotate-2 w-[120px] h-[28px] bg-[#dfd6cd] shadow-tape border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
      <div className="flex aspect-[4/3] items-center justify-center rounded-3 bg-paper-2 border border-line-soft">
        <div className="text-center space-y-[8px]">
          <span className="text-[32px]">🖼️</span>
          <p className="text-[13px] font-medium text-ink-mute">Sem preview disponível</p>
        </div>
      </div>
    </div>
  )
}
