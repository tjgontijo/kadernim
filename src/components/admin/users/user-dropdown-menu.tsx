'use client'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { signOutAction } from '@/app/admin/actions'

interface UserDropdownMenuProps {
  userName: string
  userEmail: string
  userImage?: string | null
}

export function UserDropdownMenu({ userName, userEmail, userImage }: UserDropdownMenuProps) {
  const [mounted, setMounted] = React.useState(false)
  const { isMobile } = useSidebar()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const userInitial = userName?.charAt(0).toUpperCase() || 'U'

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 min-h-[48px] w-full rounded-lg bg-sidebar-accent/50">
        <div className="h-8 w-8 rounded-lg bg-sidebar-foreground/10 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5 group-data-[collapsible=icon]:hidden">
          <div className="h-3.5 w-24 bg-sidebar-foreground/10 animate-pulse rounded" />
          <div className="h-3 w-32 bg-sidebar-foreground/10 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={userImage || ''} alt={userName} />
            <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">{userName}</span>
            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOutAction} className="w-full">
          <DropdownMenuItem asChild>
            <button className="w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
