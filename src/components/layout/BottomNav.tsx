// src/components/layout/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rss, BookOpen, Heart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Atualizações',
      href: '/feed',
      icon: Rss,
    },
    {
      label: 'Recursos',
      href: '/resources',
      icon: BookOpen,
    },
    {
      label: 'Solicitações',
      href: '/requests',
      icon: Heart,
    },
    {
      label: 'Configurações',
      href: '/settings',
      icon: Settings,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-lg pb-2">
      <div className="flex h-16 items-center justify-around px-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95"
            >
              <Icon 
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  isActive
                    ? 'fill-primary text-primary'
                    : 'fill-none text-muted-foreground hover:text-foreground'
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
