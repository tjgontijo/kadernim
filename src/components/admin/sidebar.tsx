'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  BarChart3,
  Settings,
  Hash,
  Tags,
  Sparkles,
} from 'lucide-react'
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
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { UserDropdownMenu } from './users/user-dropdown-menu'
import { defineAbilitiesFor, PermissionAction, PermissionSubject } from '@/lib/auth/permissions'
import { UserRoleType } from '@/types/user-role'

type NavItem = {
  title: string
  href: string
  icon: string
  permission?: { action: PermissionAction; subject: PermissionSubject }
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
  Building2,
  BarChart3,
  Settings,
  Hash,
  Tags,
  Sparkles,
} as const

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const userName = user.name || 'Usuário'
  const userEmail = user.email || ''
  const userImage = user.image
  const userRole = (user.role || 'user') as UserRoleType
  const ability = defineAbilitiesFor(userRole)

  // Nav items with permission requirements
  const platformItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
  ]

  const dataItems: NavItem[] = [
    { title: 'Recursos', href: '/admin/resources', icon: 'BookOpen', permission: { action: 'read', subject: 'Resource' } },
    { title: 'Pedidos', href: '/admin/community-requests', icon: 'Sparkles', permission: { action: 'read', subject: 'Resource' } },
    { title: 'Matérias', href: '/admin/subjects', icon: 'Hash', permission: { action: 'read', subject: 'Subject' } },
    { title: 'Usuários', href: '/admin/users', icon: 'Users', permission: { action: 'read', subject: 'User' } },
    { title: 'Organizações', href: '/admin/organizations', icon: 'Building2', permission: { action: 'read', subject: 'Organization' } },
    { title: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', permission: { action: 'read', subject: 'Analytics' } },
  ]

  const configItems: NavItem[] = [
    { title: 'Configurações', href: '/admin/settings', icon: 'Settings' },
  ]

  // Handler to close sidebar on mobile when clicking a menu item
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  K
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Kadernim</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map((item) => {
                  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
                  const isActive = pathname === item.href
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} onClick={handleNavClick}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dados</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map((item) => {
                  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} onClick={handleNavClick}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems
                .filter((item) => !item.permission || ability.can(item.permission.action, item.permission.subject))
                .map((item) => {
                  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP]
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} onClick={handleNavClick}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <UserDropdownMenu
              userName={userName}
              userEmail={userEmail}
              userImage={userImage}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
