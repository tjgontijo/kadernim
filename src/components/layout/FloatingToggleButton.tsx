'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'

export function FloatingToggleButton() {
  const { open, setOpen } = useSidebar()
  
  return (
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </div>
  )
}
