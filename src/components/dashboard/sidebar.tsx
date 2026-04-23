'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Hash,
  Sparkles,
  Cpu,
  Zap,
  FileText,
  ChevronRight,
  Mail,
  Bell,
  MessageCircle,
  Send,
  Activity,
  CreditCard,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useQuery } from '@tanstack/react-query'
import { defineAbilitiesFor, PermissionAction, PermissionSubject } from '@/lib/auth/permissions'
import { UserRoleType } from '@/types/users/user-role'
import { Badge } from '@/components/ui/badge'

type NavItem = {
  title: string
  href: string
  icon: keyof typeof ICON_MAP
  permission?: { action: PermissionAction; subject: PermissionSubject }
  subItems?: SubNavItem[]
  count?: number
}

type SubNavItem = {
  title: string
  href: string
  icon: any
}

interface AdminSidebarProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role?: string | null
  }
}

// Icon mapping for dynamic nav items
const ICON_MAP = {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Hash,
  Sparkles,
  Cpu,
  Zap,
  FileText,
  Send,
  Activity,
  CreditCard,
} as const

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { data: version } = useQuery<string | null>({
    queryKey: ['app-version'],
    queryFn: async () => {
      const response = await fetch('/version.json')
      const data = await response.json()
      return data.version ?? null
    },
    staleTime: Infinity,
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30s
  })


  const userRole = (user.role || 'user') as UserRoleType
  const ability = defineAbilitiesFor(userRole)

  // Handler to close sidebar on mobile when clicking a menu item
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  // Dashboards Section
  const dashboardItems: NavItem[] = [
    { title: 'Geral', href: '/admin', icon: 'LayoutDashboard' },
  ]

  // Gestão de Dados Section
  const dataItems: NavItem[] = [
    {
      title: 'Recursos',
      href: '/admin/resources',
      icon: 'BookOpen',
      permission: { action: 'read', subject: 'Resource' },
      count: stats?.totalResources
    },
    {
      title: 'Disciplinas',
      href: '/subjects',
      icon: 'Hash',
      permission: { action: 'read', subject: 'Subject' },
      count: stats?.totalSubjects
    },
    {
      title: 'Usuários',
      href: '/admin/users',
      icon: 'Users',
      permission: { action: 'read', subject: 'User' },
      count: stats?.totalUsers
    },
  ]




  // Config Section


  // Faturamento Section
  const billingItems: NavItem[] = [
    {
      title: 'Faturamento',
      href: '/admin/billing',
      icon: 'CreditCard',
      permission: { action: 'manage', subject: 'all' },
      count: stats?.activeSubscriptions
    },
  ]

  // Helper to check if a menu with subitems should be active
  const isMenuActive = (item: NavItem): boolean => {
    if (item.subItems) {
      return item.subItems.some(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`))
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  // Render menu item (with or without subitems)
  const renderMenuItem = (item: NavItem) => {
    const Icon = ICON_MAP[item.icon]
    const hasSubItems = item.subItems && item.subItems.length > 0

    if (hasSubItems) {
      const isActive = isMenuActive(item)

      return (
        <Collapsible
          key={item.href}
          asChild
          defaultOpen={isActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.subItems!.map((subItem) => {
                  const isSubActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
                  return (
                    <SidebarMenuSubItem key={subItem.href}>
                      <SidebarMenuSubButton asChild isActive={isSubActive}>
                        <Link href={subItem.href} onClick={handleNavClick}>
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/admin')

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.href} onClick={handleNavClick}>
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
        {item.count !== undefined && (
          <SidebarMenuBadge className="bg-sage-2/50 text-sage group-data-[active=true]/menu-item:bg-sage group-data-[active=true]/menu-item:text-paper border border-sage/10 font-body">
            {item.count}
          </SidebarMenuBadge>
        )}
      </SidebarMenuItem>


    )
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <div className="p-4 border-b border-dashed border-line">
        <div className="flex items-center gap-3">
          <div className="relative size-[34px] rounded-[10px] bg-ink text-paper flex items-center justify-center font-display font-semibold text-lg after:absolute after:-top-[3px] after:-right-[3px] after:size-2 after:rounded-full after:bg-mustard">
            K
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-display font-semibold text-xl tracking-tight leading-none">Kadernim</div>
            <div className="font-hand text-sm text-terracotta leading-none mt-0.5">da Professora</div>
          </div>
        </div>
      </div>
      <SidebarContent>
        {/* Dashboards */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão de Dados */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão de Dados</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>





        {/* Faturamento */}
        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {billingItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
