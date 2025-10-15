// src/components/layout/AppSidebar.tsx

// https://www.better-auth.com/docs/concepts/session-management
'use client'

import { useMemo, useReducer, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from '@/lib/auth/auth-client'
import {
  Settings, User, LogOut, ChevronUp, BookOpen, ChevronDown, FolderOpen, Rss,
  MessageSquarePlus, ShieldCheck, Users, GraduationCap, FileText, Package
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { FloatingToggleButton } from './FloatingToggleButton'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

type MenuItem = {
  title: string
  url: string
  icon: React.ElementType
  requiresAdmin?: boolean
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { title: 'Meus Recursos', url: '/resources', icon: FolderOpen },
  { title: 'Feed', url: '/feed', icon: Rss },
  { title: 'Solicitação de Recursos', url: '/requests', icon: MessageSquarePlus },
  {
    title: 'Administração',
    url: '/admin',
    icon: ShieldCheck,
    requiresAdmin: true,
    children: [
      { title: 'Geral', url: '/admin/settings', icon: Settings, requiresAdmin: true },
      { title: 'Disciplinas', url: '/admin/subjects', icon: BookOpen, requiresAdmin: true },
      { title: 'Níveis de Ensino', url: '/admin/education-levels', icon: GraduationCap, requiresAdmin: true },
      { title: 'Usuários', url: '/admin/users', icon: Users, requiresAdmin: true },
      { title: 'Códigos BNCC', url: '/admin/bncc-codes', icon: FileText, requiresAdmin: true },
      { title: 'Mapeamento de Produtos', url: '/admin/product-mapping', icon: Package, requiresAdmin: true }
    ]
  }
]

type UserWithSubscription = {
  subscriptionTier?: string | null
  role?: string | null
  name: string
  email: string
  image?: string | null
}

type AppSidebarProps = {
  initialUser: UserWithSubscription | null
}

export function AppSidebar({ initialUser }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const { data: session, isPending, error } = useSession()

  const [openMenus, toggleMenu] = useReducer(
    (state: Record<string, boolean>, { title, open }: { title: string; open: boolean }) => ({
      ...state,
      [title]: open
    }),
    { Administração: true }
  )

  const user = (session?.user as UserWithSubscription | undefined) ?? initialUser ?? undefined
  const isAdmin = user?.role === 'admin'

  const filteredItems = useMemo(
    () => menuItems.filter(item => !item.requiresAdmin || isAdmin),
    [isAdmin]
  )

  const handleLogout = useCallback(async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace('/')
          },
          onError: (err) => {
            console.error('Erro no logout:', err)
            router.replace('/')
          },
        },
      })
    } catch (err) {
      console.error(err)
      router.replace('/')
    } finally {
      localStorage.clear()
      sessionStorage.clear()
    }
  }, [router])

  const getUserInitials = useCallback(() => {
    if (!user?.name) return 'US'
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [user?.name])

  const handleLinkClick = useCallback(() => {
    setOpenMobile(false)
  }, [setOpenMobile])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Não foi possível carregar sua sessão.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Recarregar página
          </button>
        </div>
      </div>
    )
  }

  if (isPending && !session?.user) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const currentUser = user
  const userEmail = currentUser.email || ''

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" >
      <SidebarHeader className="relative border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 min-w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            K
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map(item => {
                const hasChildren = item.children && item.children.length > 0
                const filteredChildren = item.children?.filter(c => !c.requiresAdmin || isAdmin) || []

                return (
                  <SidebarMenuItem key={item.title}>
                    {hasChildren ? (
                      <Collapsible
                        open={openMenus[item.title]}
                        onOpenChange={open => toggleMenu({ title: item.title, open })}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={pathname.startsWith(item.url)}>
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1 group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                openMenus[item.title] ? 'rotate-180' : ''
                              } group-data-[collapsible=icon]:hidden`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {filteredChildren.map(child => (
                            <SidebarMenuButton
                              key={child.title}
                              asChild
                              isActive={pathname === child.url}
                              className="pl-10"
                            >
                              <Link href={child.url} onClick={handleLinkClick}>
                                <child.icon className="h-4 w-4" />
                                <span className="group-data-[collapsible=icon]:hidden">
                                  {child.title}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                      >
                        <Link href={item.url} onClick={handleLinkClick}>
                          <item.icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>                              
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <FloatingToggleButton />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto py-2 group-data-[collapsible=icon]:justify-center cursor-pointer">
                  <Avatar className="h-8 w-8 min-w-8 flex-shrink-0">
                    <AvatarImage src={currentUser.image || undefined} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start ml-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="font-medium truncate">{currentUser.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
                  </div>
                  <ChevronUp className="ml-2 h-4 w-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" onClick={handleLinkClick}>
                    <User className="mr-2 h-4 w-4" /> Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}