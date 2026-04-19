'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

interface RelatedResource {
  id: string
  title: string
  thumbUrl: string | null
  subject: string
  educationLevel: string
}

interface ResourceRelatedStripProps {
  resourceId: string
  subject: string
}

export function ResourceRelatedStrip({ resourceId, subject }: ResourceRelatedStripProps) {
  const [items, setItems] = useState<RelatedResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      try {
        const res = await fetch(`/api/v1/resources/${resourceId}/related`)
        const json = await res.json()
        if (json.data) setItems(json.data)
      } catch (err) {
        console.error('Failed to load related', err)
      } finally {
        setLoading(false)
      }
    }
    loadRelated()
  }, [resourceId])

  if (!loading && items.length === 0) return null

  return (
    <section className="mt-[56px] pt-[40px] border-t border-dashed border-line">
      <div className="flex items-baseline justify-between mb-[20px]">
        <h3 className="font-display font-semibold text-[24px] tracking-[-0.01em] text-ink">
          Combina com esta aula
        </h3>
        <span className="font-hand text-[18px] text-terracotta">~ escolhidas a dedo</span>
      </div>

      {loading ? (
        <div className="flex py-[40px] items-center justify-center">
          <RefreshCw className="w-[24px] h-[24px] animate-spin text-terracotta opacity-40" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {items.map((item) => (
            <Link key={item.id} href={`/resources/${item.id}`}>
              <div className="bg-card border border-line rounded-4 overflow-hidden shadow-1 flex flex-col h-full hover:-translate-y-1 hover:shadow-3 transition-all cursor-pointer group">
                <div className="aspect-[4/3] bg-paper-2 relative flex items-center justify-center overflow-hidden">
                   {item.thumbUrl ? (
                     <img 
                       src={item.thumbUrl} 
                       alt={item.title} 
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                     />
                   ) : (
                     <>
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent_0,transparent_10px,oklch(0.88_0.02_75_/_0.3)_10px,oklch(0.88_0.02_75_/_0.3)_11px)]"></div>
                        <span className="font-mono text-[10px] text-ink-mute uppercase tracking-[0.12em] z-10 font-bold">Material Didático</span>
                     </>
                   )}
                </div>
                <div className="p-[16px] flex flex-col gap-[10px] flex-1">
                   <span className="inline-flex items-center gap-[6px] px-[10px] py-[3px] text-[10px] font-semibold rounded-full leading-[1.5] whitespace-nowrap bg-[oklch(0.94_0.045_260)] text-[oklch(0.38_0.10_260)] w-max">
                     {item.subject}
                   </span>
                   <div className="font-display font-semibold text-[16px] text-ink leading-[1.25] group-hover:text-terracotta transition-colors line-clamp-2">
                     {item.title}
                   </div>
                   <div className="mt-auto text-[12px] text-ink-mute">
                     {item.educationLevel}
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
