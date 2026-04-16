'use client'

import { Hero } from '@/components/home/Hero'
import { ProblemAgitation } from '@/components/home/ProblemAgitation'
import { SolutionFeatures } from '@/components/home/SolutionFeatures'
import { Pricing } from '@/components/home/Pricing'
import { FAQ } from '@/components/home/FAQ'
import { Footer } from '@/components/home/Footer'
import { ProductCarousel } from '../sections/product-carousel'
import type { MarketingProduct } from '@/lib/marketing/types'

export function VariantA({ products }: { products: MarketingProduct[] }) {
  return (
    <main className="min-h-screen bg-background text-white">
      <Hero />
      <ProductCarousel products={products} />
      <ProblemAgitation />
      <SolutionFeatures />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
