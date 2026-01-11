'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, Settings, User, ShieldCheck } from 'lucide-react'
import { ThemeSwitcherItem } from '@/components/shared/theme-switcher-item'
import { useTheme } from 'next-themes'
import { authClient } from '@/lib/auth/auth-client'
import { UserRole } from '@/types/user-role'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { useSessionQuery } from '@/hooks/useSessionQuery'

export function SystemHeader() {
  const { data: session } = useSessionQuery()
  const router = useRouter()
  const pathname = usePathname()
  const { setTheme } = useTheme()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  const userInitials = session?.data?.user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/resources" className="flex items-center gap-2">
          <Image
            src="/images/icons/icon.png"
            alt="Kadernim"
            width={40}
            height={40}
            className="h-16 w-16"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/lesson-plans"
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary",
              pathname.startsWith('/lesson-plans') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Planos
          </Link>
          <Link
            href="/resources"
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary",
              pathname.startsWith('/resources') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Recursos
          </Link>
          <Link
            href="/community"
            className={cn(
              "text-sm font-bold transition-colors hover:text-primary",
              pathname.startsWith('/community') ? "text-primary" : "text-muted-foreground"
            )}
          >
            Pedidos
          </Link>
        </nav>

        {/* Avatar + Menu com shadcn */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full transition-transform hover:scale-110 focus:outline-none cursor-pointer"
              suppressHydrationWarning
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session?.data?.user?.image || undefined}
                  alt={session?.data?.user?.name || 'Prof.'}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {userInitials || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session?.data?.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.data?.user?.email}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/account" className="flex cursor-pointer items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <ThemeSwitcherItem />

            <DropdownMenuSeparator />

            {session?.data?.user?.role === UserRole.admin && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex cursor-pointer items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Administração</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
