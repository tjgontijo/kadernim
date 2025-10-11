'use client'

import { Home, Settings, User, LogOut, ChevronUp, Rss, BookOpen, ChevronDown, School } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth/auth-client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Menu items
const items = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Feed',
    url: '/dashboard/feed',
    icon: Rss,
  },
  {
    title: 'Perfil',
    url: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Configurações',
    url: '/dashboard/settings',
    icon: Settings,
    children: [
      {
        title: 'Disciplinas',
        url: '/dashboard/settings/subjects',
        icon: BookOpen,
      },
      {
        title: 'Níveis de Ensino',
        url: '/dashboard/settings/education-levels',
        icon: School,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const { setOpenMobile } = useSidebar()

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {          
          localStorage.clear()
          sessionStorage.clear()
          window.location.replace('/')
        },
      },
    })
  }

  const handleLinkClick = () => {    
    setOpenMobile(false)
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex min-w-8 h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">K</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Kadernim</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url || (item.children?.some(child => pathname === child.url) ?? false)
                const hasChildren = item.children && item.children.length > 0
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {hasChildren ? (
                      <>
                        <SidebarMenuButton isActive={isActive} className="group-data-[collapsible=icon]:justify-center cursor-pointer">
                          <item.icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                          <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden transition-transform duration-200" />
                        </SidebarMenuButton>
                        <SidebarGroup>
                          <SidebarGroupContent className="pl-6">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.url
                              return (
                                <SidebarMenuItem asChild key={child.title}>
                                  <SidebarMenuButton asChild isActive={isChildActive} className="group-data-[collapsible=icon]:justify-center cursor-pointer">
                                    <Link href={child.url} onClick={handleLinkClick}>
                                      <child.icon className="h-4 w-4" />
                                      <span className="group-data-[collapsible=icon]:hidden">{child.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              )
                            })}
                          </SidebarGroupContent>
                        </SidebarGroup>
                      </>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive} className="group-data-[collapsible=icon]:justify-center cursor-pointer">
                        <Link href={item.url} onClick={handleLinkClick}>
                          <item.icon className="h-4 w-4" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto py-2 group-data-[collapsible=icon]:justify-center cursor-pointer">
                  <Avatar className="h-8 w-8 min-w-8 flex-shrink-0">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col items-start text-left text-sm ml-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="font-medium truncate w-full">{user?.name || 'Usuário'}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user?.email || ''}
                    </span>
                  </div>
                  <ChevronUp className="ml-2 h-4 w-4 flex-shrink-0 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer" onClick={handleLinkClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer" onClick={handleLinkClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
