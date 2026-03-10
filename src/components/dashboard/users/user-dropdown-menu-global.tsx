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
import { ArrowLeft, ChevronDown, LogOut } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcherItem } from '@/components/shared/theme-switcher-item'
import { authClient } from '@/lib/auth/auth-client'
import { useRouter } from 'next/navigation'

interface UserDropdownMenuGlobalProps {
  userName: string
  userEmail: string
  userImage?: string | null
}

export function UserDropdownMenuGlobal({ userName, userEmail, userImage }: UserDropdownMenuGlobalProps) {
  const [mounted, setMounted] = React.useState(false)
  const router = useRouter()

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
    return (
      <div className="flex items-center gap-2 h-9 px-2 rounded-lg bg-muted/50 animate-pulse">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="hidden md:flex flex-col gap-1">
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-2 hover:bg-muted/50"
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={userImage || ''} alt={userName} />
            <AvatarFallback className="text-xs font-semibold">{userInitial}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">
            {userName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
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
        <ThemeSwitcherItem />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/resources" className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Voltar ao Portal</span>
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
