'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, GraduationCap } from 'lucide-react'
import type { MarketingProduct } from '@/lib/marketing/types'

interface ProductCarouselProps {
  products: MarketingProduct[]
  dark?: boolean
  className?: string
}

export function ProductCarousel({ products, dark = true, className = '' }: ProductCarouselProps) {
  // Multiply products to ensure smooth infinite loop
  const displayProducts = [...products, ...products, ...products]

  const bgClass = dark ? 'bg-ink' : 'bg-paper'
  const titleClass = dark ? 'text-paper' : 'text-ink'
  const subClass = dark ? 'text-paper-3' : 'text-ink-soft'
  const overlayClass = dark ? 'from-ink' : 'from-paper'
  const borderClass = dark ? 'border-line/20' : 'border-line'

  return (
    <section className={`py-24 overflow-hidden border-y ${bgClass} ${borderClass} ${className}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${titleClass}`}>
              Materiais Reais, <span className="text-terracotta">Resultados Reais</span>
            </h2>
            <p className={`text-lg max-w-2xl ${subClass}`}>
              Dê uma olhada em alguns dos materiais que já estão disponíveis na nossa plataforma. 
              Tudo pronto para baixar, imprimir e aplicar na sua sala de aula hoje mesmo.
            </p>
          </div>
          <div className="hidden md:block">
             <div className={`flex items-center gap-2 text-sm font-medium ${subClass}`}>
               <GraduationCap className="h-4 w-4" />
               <span>+248 materiais disponíveis</span>
             </div>
          </div>
        </div>
      </div>

      <div className="relative flex overflow-hidden">
        {/* Infinite marquee effect */}
        <motion.div 
          className="flex gap-6 py-4"
          animate={{
            x: [0, -2000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {displayProducts.map((product, idx) => (
            <div 
              key={`${product.id}-${idx}`}
              className="group relative flex-shrink-0 w-72 h-[420px] rounded-2xl overflow-hidden border border-line/10 bg-surface-card/5 transition-all hover:border-terracotta/50 hover:bg-surface-card/10"
            >
              {product.thumbUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={product.thumbUrl}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="288px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent flex flex-col justify-end p-6">
                    <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-terracotta text-white uppercase tracking-wider mb-2">
                          {product.educationLevel}
                        </span>
                     </div>
                     <h3 className="text-white font-display font-bold text-lg leading-tight mb-1 group-hover:text-terracotta-2 transition-colors">
                      {product.title}
                    </h3>
                     <p className="text-paper-3 text-sm flex items-center gap-1.5 font-medium">
                      <BookOpen className="h-3 w-3" />
                      {product.subject}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-ink flex flex-col p-6 text-center">
                   <BookOpen className="h-12 w-12 text-ink-mute mb-4" />
                   <h3 className="text-paper font-display font-bold text-lg mb-1">{product.title}</h3>
                   <p className="text-ink-faint text-sm">{product.subject}</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Shadow Overlays for smooth blend */}
        <div className={`absolute inset-y-0 left-0 w-32 bg-gradient-to-r ${overlayClass} to-transparent pointer-events-none z-10`} />
        <div className={`absolute inset-y-0 right-0 w-32 bg-gradient-to-l ${overlayClass} to-transparent pointer-events-none z-10`} />
      </div>
    </section>
  )
}
