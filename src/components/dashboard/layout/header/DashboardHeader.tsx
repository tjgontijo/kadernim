'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserDropdownMenuGlobal } from '@/components/dashboard/users/user-dropdown-menu-global'
import { Separator } from '@/components/ui/separator'

interface DashboardHeaderProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role?: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const userName = user.name || 'Usuário'
  const userEmail = user.email || ''
  const userImage = user.image

  return (
    <header className="bg-sidebar sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between px-4 md:px-6 border-b border-sidebar-border/50">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/* Logo Horizontal */}
        <Link href="/resources" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/images/system/logo_transparent.webp"
            alt="Kadernim"
            width={120}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Espaço reservado para ações futuras se necessário */}
      </div>
    </header>
  )
}
