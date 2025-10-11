'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Recursos',
      href: '/dashboard/resources',
      icon: BookOpen,
      isMain: true, // Botão central destacado
    },
    {
      label: 'Perfil',
      href: '/dashboard/profile',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all',
                item.isMain && 'relative -mt-8'
              )}
            >
              {item.isMain ? (
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground scale-110'
                      : 'bg-primary text-primary-foreground hover:scale-105'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
