'use client'

import { Hero } from '@/components/home/Hero'
import { ProblemAgitation } from '@/components/home/ProblemAgitation'
import { SolutionFeatures } from '@/components/home/SolutionFeatures'
import { Pricing } from '@/components/home/Pricing'
import { FAQ } from '@/components/home/FAQ'
import { Footer } from '@/components/home/Footer'

export function VariantA() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <ProblemAgitation />
      <SolutionFeatures />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
