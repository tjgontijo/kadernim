'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Hash,
  CreditCard,
  User,
  LogOut,
  ShieldCheck,
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
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { UserDropdownMenuGlobal } from '@/components/dashboard/users/user-dropdown-menu-global'
import { defineAbilitiesFor, PermissionAction, PermissionSubject } from '@/lib/auth/permissions'
import { UserRoleType } from '@/types/users/user-role'
import { authClient } from '@/lib/auth/auth-client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/index'

interface AppSidebarProps {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role?: string | null
  }
}

type NavItem = {
  title: string
  href: string
  icon: any
  permission?: { action: PermissionAction; subject: PermissionSubject }
}

type NavGroup = {
  label: string
  items: NavItem[]
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, state, setOpenMobile } = useSidebar()
  const collapsed = state === 'collapsed'
  
  const userRole = (user.role || 'user') as UserRoleType
  const ability = defineAbilitiesFor(userRole)

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  const navGroups: NavGroup[] = [
    {
      label: 'Navegação',
      items: [
        { title: 'Recursos', href: '/resources', icon: BookOpen },
        { title: 'Minha Conta', href: '/account', icon: User },
      ],
    },
  ]

  if (userRole === 'admin' || userRole === 'manager' || userRole === 'editor') {
    navGroups.push({
      label: 'Plataforma (Admin)',
      items: [
        { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { title: 'Gestão de Recursos', href: '/admin/resources', icon: ShieldCheck, permission: { action: 'read', subject: 'Resource' } },
        { title: 'Disciplinas', href: '/admin/subjects', icon: Hash, permission: { action: 'read', subject: 'Subject' } },
        { title: 'Usuários', href: '/admin/users', icon: Users, permission: { action: 'read', subject: 'User' } },
        { title: 'Financeiro', href: '/admin/billing', icon: CreditCard, permission: { action: 'manage', subject: 'all' } },
      ],
    })
  }

  const renderMenuItem = (item: NavItem) => {
    if (item.permission && !ability.can(item.permission.action, item.permission.subject)) {
      return null
    }

    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/admin')
    const Icon = item.icon

    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
          <Link href={item.href} onClick={handleNavClick}>
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const SidebarContentInternal = (
    <>
      <SidebarContent className="gap-0 py-2 scrollbar-hide">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2 md:p-4 border-t border-sidebar-border/50">
        <UserDropdownMenuGlobal
          userName={user.name || 'Usuário'}
          userEmail={user.email || ''}
          userImage={user.image}
        />
      </SidebarFooter>
    </>
  )

  // MOBILE: Usa o componente Sidebar padrão que se comporta como Sheet
  if (isMobile) {
    return (
      <Sidebar collapsible="icon" variant="inset">
        {SidebarContentInternal}
      </Sidebar>
    )
  }

  // DESKTOP: Usa um aside customizado para respeitar o fluxo vertical (abaixo da Topbar)
  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col h-full transition-[width] duration-200 ease-linear shrink-0 overflow-hidden border-r border-sidebar-border/50",
        collapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {SidebarContentInternal}
    </aside>
  )
}
