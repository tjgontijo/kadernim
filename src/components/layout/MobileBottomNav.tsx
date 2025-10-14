'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Rss, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth/auth-client'
import { useSidebar } from '@/components/ui/sidebar'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const { toggleSidebar } = useSidebar()

  const navItems = [
    {
      label: 'Início',
      href: '/resources',
      icon: Home,
      requiresAdmin: false,
    },
    {
      label: 'Feed',
      href: '/feed',
      icon: Rss,
      requiresAdmin: false,
    },
    {
      label: 'Perfil',
      href: '/profile',
      icon: User,
      requiresAdmin: false,
    },
  ]
  
  // Filtrar itens de menu com base na role do usuário
  const filteredNavItems = navItems.filter(item => {
    // Se o item requer role admin e o usuário não é admin, ocultar
    if (item.requiresAdmin && !isAdmin) {
      return false
    }
    return true
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/98 backdrop-blur-md supports-[backdrop-filter]:bg-background/95 md:hidden shadow-lg pb-2">
      <div className="flex h-16 items-center justify-around px-2 safe-area-pb">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-200 mt-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
        
        {/* Botão de Menu */}
        <button
          onClick={toggleSidebar}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground mt-1">
            Menu
          </span>
        </button>
      </div>
    </nav>
  )
}
