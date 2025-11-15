'use client'

import { SystemHeader } from '@/components/dashboard/header/SystemHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FooterSingle } from '@/components/dashboard/footer/footer-single'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <SystemHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 overflow-hidden px-4 py-4 sm:px-4 lg:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <FooterSingle />
    </div>
  )
}
