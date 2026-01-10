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
  Cpu,
  Zap,
  FileText,
  ChevronRight,
  Mail,
  Bell,
  MessageCircle,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState, useEffect } from 'react'
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
  Cpu,
  Zap,
  FileText,
} as const

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    fetch('/version.json')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => console.log('Version file not found'))
  }, [])

  const userName = user.name || 'Usuário'
  const userEmail = user.email || ''
  const userImage = user.image
  const userRole = (user.role || 'user') as UserRoleType
  const ability = defineAbilitiesFor(userRole)

  // Nav items with permission requirements
  const platformItems: NavItem[] = [
    { title: 'Geral', href: '/admin', icon: 'LayoutDashboard' },
    { title: 'Monitoramento IA', href: '/admin/llm-usage', icon: 'Cpu', permission: { action: 'manage', subject: 'all' } },
  ]

  const dataItems: NavItem[] = [
    { title: 'Recursos', href: '/admin/resources', icon: 'BookOpen', permission: { action: 'read', subject: 'Resource' } },
    { title: 'Pedidos', href: '/admin/community-requests', icon: 'Sparkles', permission: { action: 'read', subject: 'Resource' } },
    { title: 'Disciplinas', href: '/admin/subjects', icon: 'Hash', permission: { action: 'read', subject: 'Subject' } },
    { title: 'Usuários', href: '/admin/users', icon: 'Users', permission: { action: 'read', subject: 'User' } },
    { title: 'Automações', href: '/admin/automations', icon: 'Zap', permission: { action: 'manage', subject: 'all' } },
    { title: 'Campanhas', href: '/admin/campaigns', icon: 'Send', permission: { action: 'manage', subject: 'all' } },
  ]

  // Template sub-items
  const templateSubItems = [
    { title: 'Email', href: '/admin/templates/email', icon: Mail },
    { title: 'Push', href: '/admin/templates/push', icon: Bell },
    { title: 'WhatsApp', href: '/admin/templates/whatsapp', icon: MessageCircle },
  ]

  // Check if any template route is active
  const isTemplatesActive = pathname.startsWith('/admin/templates')

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
                <div className="flex size-8 items-center justify-center">
                  <img
                    src="/images/system/icon-1024x1024.png"
                    alt="Kadernim"
                    className="hidden size-8 object-contain group-data-[collapsible=icon]:block"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Kadernim</span>
                  <span className="truncate text-[8px] text-muted-foreground">
                    {version ? `v${version}` : 'Admin'}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
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

              {/* Templates Collapsible Menu */}
              {ability.can('manage', 'all') && (
                <Collapsible
                  asChild
                  defaultOpen={isTemplatesActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Templates" isActive={isTemplatesActive}>
                        <FileText className="h-4 w-4" />
                        <span>Templates</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {templateSubItems.map((item) => {
                          const isSubActive = pathname === item.href
                          return (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                <Link href={item.href} onClick={handleNavClick}>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
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
