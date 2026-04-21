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
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSidebar } from '@/components/ui/sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth/auth-client'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils/index'

interface UserDropdownMenuGlobalProps {
  userName: string
  userEmail: string
  userImage?: string | null
  customTrigger?: React.ReactNode
}

export function UserDropdownMenuGlobal({ userName, userEmail, userImage, customTrigger }: UserDropdownMenuGlobalProps) {
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const userInitial = userName?.charAt(0).toUpperCase() || 'U'

  if (!mounted) {
    if (customTrigger) return <div className="h-9 w-9 rounded-full bg-muted/50 animate-pulse" />
    return (
      <div className="flex items-center gap-2 h-9 px-2 rounded-lg bg-muted/50 animate-pulse">
        <div className="h-7 w-7 rounded-full bg-muted" />
        {!isCollapsed && (
          <div className="hidden md:flex flex-col gap-1">
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {customTrigger ? (
          <div>{customTrigger}</div>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              "h-10 w-full justify-start gap-2 px-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={userImage || ''} alt={userName} />
              <AvatarFallback className="text-xs font-semibold">{userInitial}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                  <span className="text-sm font-semibold truncate w-full text-left">
                    {userName}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-left">
                    {userEmail}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
              </>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{userName}</p>
          <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex cursor-pointer items-center gap-2">
            <User className="h-4 w-4" />
            <span>Minha conta</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
