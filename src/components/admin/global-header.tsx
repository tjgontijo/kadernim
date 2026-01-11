'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { UserDropdownMenuGlobal } from './users/user-dropdown-menu-global'
import { useBreakpoint } from '@/hooks/use-breakpoint'

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
  const { isBelow } = useBreakpoint()
  const isMobileOrTablet = isBelow('desktop')
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => console.log('Version file not found'))
  }, [])

  const userName = user.name || 'Usuário'
  const userEmail = user.email || ''
  const userImage = user.image

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 flex items-center px-4 md:px-6">
      <div className="flex items-center gap-3 flex-1">
        {/* Menu Hamburger (Mobile/Tablet) */}
        {isMobileOrTablet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 shrink-0"
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
          <div className="hidden sm:flex flex-col border-l border-border pl-3">
            <span className="text-xs font-bold tracking-tight text-primary uppercase">Admin</span>
            {version && (
              <span className="text-[10px] leading-none text-muted-foreground font-medium">
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
