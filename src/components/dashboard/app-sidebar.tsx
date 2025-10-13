'use client'

import { 
  Settings, 
  User, 
  LogOut, 
  ChevronUp, 
  BookOpen, 
  ChevronDown, 
  FolderOpen,
  Rss,
  MessageSquarePlus,
  ShieldCheck,
  Users,
  GraduationCap,
  FileText,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from '@/lib/auth/auth-client'
import { useState } from 'react'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

// Menu items com controle de permissão
const items = [
  {
    title: 'Meus Recursos',
    url: '/resources',
    icon: FolderOpen,
    requiresAdmin: false, // Todos os usuários podem acessar
  },
  {
    title: 'Feed',
    url: '/feed',
    icon: Rss,
    requiresAdmin: false, // Todos os usuários podem acessar
  },
  {
    title: 'Solicitação de Recursos',
    url: '/requests',
    icon: MessageSquarePlus,
    requiresAdmin: false, // Todos os usuários podem acessar
  },
  {
    title: 'Administração',
    url: '/admin',
    icon: ShieldCheck,
    requiresAdmin: true, // Apenas administradores podem acessar
    children: [
      {
        title: 'Geral',
        url: '/admin/settings',
        icon: Settings,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
      {
        title: 'Disciplinas',
        url: '/admin/subjects',
        icon: BookOpen,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
      {
        title: 'Níveis de Ensino',
        url: '/admin/education-levels',
        icon: GraduationCap,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
      {
        title: 'Usuários',
        url: '/admin/users',
        icon: Users,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
      {
        title: 'Codigos BNCC',
        url: '/admin/bncc-codes',
        icon: FileText,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
      {
        title: 'Mapeamento de Produtos',
        url: '/admin/product-mapping',
        icon: Package,
        requiresAdmin: true, // Apenas administradores podem acessar
      },
    ],
  },
]

type UserWithSubscription = {
  subscriptionTier?: string | null;
  role?: string | null;
  name?: string;
  email?: string;
  image?: string | null;
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user as UserWithSubscription
  const isAdmin = user?.role === 'admin'
  const { setOpenMobile } = useSidebar()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Administração': true, // Aberto por padrão
  })
  
  // Filtrar itens de menu com base na role do usuário
  const filteredItems = items.filter(item => {
    // Se o item requer role admin e o usuário não é admin, ocultar
    if (item.requiresAdmin && !isAdmin) {
      return false
    }
    return true
  })

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            try {
              localStorage.clear()
              sessionStorage.clear()
            } catch {}
            router.push('/')
          }
        }
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Fallback: limpar e redirecionar
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch {}
      router.push('/')
    }
  }

  const handleLinkClick = () => {    
    setOpenMobile(false)
  }

  const getUserInitials = () => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .map((n: string) => n[0])
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
            <span className="text-xs text-muted-foreground">
              {user?.subscriptionTier === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                // Verificar se o item está ativo (exatamente igual ao pathname atual)
                const isActive = pathname === item.url
                const hasChildren = item.children && item.children.length > 0
                
                // Filtrar os filhos do item com base na role do usuário
                const filteredChildren = item.children
                  ? item.children.filter(child => !child.requiresAdmin || isAdmin)
                  : []
                
                // Se não há filhos após a filtragem, não mostrar o menu dropdown
               // const effectiveHasChildren = filteredChildren.length > 0
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {hasChildren ? (
                      <Collapsible
                        open={openMenus[item.title]}
                        onOpenChange={(open) => setOpenMenus({ ...openMenus, [item.title]: open })}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton isActive={isActive} className="group-data-[collapsible=icon]:justify-center cursor-pointer">
                            <item.icon className="h-4 w-4" />
                            <span className="group-data-[collapsible=icon]:hidden flex-1">{item.title}</span>
                            <ChevronDown className={`h-4 w-4 group-data-[collapsible=icon]:hidden transition-transform duration-200 ${
                              openMenus[item.title] ? 'rotate-180' : ''
                            }`} />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarGroup>
                            <SidebarGroupContent className="pl-6">
                              {filteredChildren.map((child) => {
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
                        </CollapsibleContent>
                      </Collapsible>
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
