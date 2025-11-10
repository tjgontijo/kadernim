'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, User } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSessionQuery } from '@/hooks/useSessionQuery'

export function SystemHeader() {
  const { data: session } = useSessionQuery()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login/otp')
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/resources" className="flex items-center gap-2">
          <Image
            src="/images/system/logo_transparent.png"
            alt="Kadernim"
            width={40}
            height={40}
            className="h-16 w-16"
          />
        </Link>

        {/* Avatar + Menu com shadcn */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full transition-transform hover:scale-110 focus:outline-none cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={session?.data?.user?.image || undefined}
                  alt={session?.data?.user?.name || 'Prof.'}
                />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
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
              <Link href="/profile" className="flex cursor-pointer items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
