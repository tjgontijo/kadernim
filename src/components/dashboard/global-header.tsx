'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { UserDropdownMenuGlobal } from './users/user-dropdown-menu-global'
import { useMobile } from '@/hooks/layout/use-mobile'

interface GlobalHeaderProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role?: string | null
  }
}

export function GlobalHeader({ user }: GlobalHeaderProps) {
  const { toggleSidebar } = useSidebar()
  const { isBelow } = useMobile()
  const isMobileOrTablet = isBelow('desktop')
  const { data: version } = useQuery<string | null>({
    queryKey: ['app-version'],
    queryFn: async () => {
      const response = await fetch('/version.json')
      const data = await response.json()
      return data.version ?? null
    },
    staleTime: Infinity,
  })

  const userName = user.name || 'Usuário'
  const userEmail = user.email || ''
  const userImage = user.image

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-paper-2 border-b border-line z-50 flex items-center px-4 md:px-6 shadow-1 paper-grain">
      <div className="flex items-center gap-3 flex-1">
        {/* Menu Hamburger (Mobile/Tablet) */}
        {isMobileOrTablet && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="h-9 w-9 shrink-0 text-ink-soft hover:text-ink"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo and Version */}
        <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/images/system/logo_transparent.webp"
            alt="Kadernim"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="hidden sm:flex flex-col border-l border-line pl-3">
            <span className="text-[11px] font-bold tracking-widest text-terracotta uppercase">Admin</span>
            {version && (
              <span className="text-[10px] leading-none text-ink-mute font-medium">
                v{version}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Right Side - User Avatar */}
      <div className="flex items-center gap-2">
        <UserDropdownMenuGlobal
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
        />
      </div>
    </header>
  )
}
