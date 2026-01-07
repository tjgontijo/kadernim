'use client'

import { Hero } from '@/components/home/Hero'
import { ProblemAgitation } from '@/components/home/ProblemAgitation'
import { SolutionFeatures } from '@/components/home/SolutionFeatures'
import { Community } from '@/components/home/Community'
import { Pricing } from '@/components/home/Pricing'
import { FAQ } from '@/components/home/FAQ'
import { Footer } from '@/components/home/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <ProblemAgitation />
      <SolutionFeatures />
      <Community />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
