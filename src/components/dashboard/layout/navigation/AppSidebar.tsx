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
  Heart,
  FolderHeart,
  Calendar,
  Sparkles,
  Clock,
  Settings
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
  useSidebar,
} from '@/components/ui/sidebar'
import { defineAbilitiesFor, PermissionAction, PermissionSubject } from '@/lib/auth/permissions'
import { UserRoleType } from '@/types/users/user-role'
import { authClient } from '@/lib/auth/auth-client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/index'
import { Logo } from '@/components/ui/logo'

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
  count?: string
  permission?: { action: PermissionAction; subject: PermissionSubject }
  onClick?: () => void
}

type NavGroup = {
  label?: string
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
      items: [
        { title: 'Biblioteca', href: '/resources', icon: BookOpen, count: '842' },
        { title: 'Meus favoritos', href: '/favorites', icon: Heart, count: '38' },
        { title: 'Coleções', href: '/collections', icon: FolderHeart, count: '7' },
        { title: 'Planejador', href: '/planner', icon: Calendar },
      ],
    },
    {
      label: 'Descobrir',
      items: [
        { title: 'Novidades', href: '/discover/new', icon: Sparkles },
        { title: 'Esta semana', href: '/discover/weekly', icon: Clock },
      ],
    },
    {
      label: 'Conta',
      items: [
        { title: 'Meu perfil', href: '/account', icon: User },
        { title: 'Assinatura', href: '/billing', icon: CreditCard },
        { title: 'Sair', href: '#', icon: LogOut, onClick: handleLogout },
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
      ],
    })
  }

  const renderMenuItem = (item: NavItem) => {
    if (item.permission && !ability.can(item.permission.action, item.permission.subject)) {
      return null
    }

    const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/admin' && item.href !== '#')
    const Icon = item.icon

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton 
          asChild 
          tooltip={item.title}
          className={cn(
            "flex items-center gap-[10px] px-[12px] py-[9px] rounded-3 font-medium text-[14px] transition-all relative border outline-none ring-0",
            isActive 
              ? "bg-card text-ink shadow-1 border-line before:absolute before:left-[-2px] before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[20px] before:bg-terracotta before:rounded-sm hover:bg-card hover:text-ink" 
              : "border-transparent text-ink-soft hover:bg-paper-2 hover:text-ink hover:border-transparent active:bg-paper-2"
          )}
        >
          {item.onClick ? (
            <button onClick={item.onClick} className="w-full flex items-center gap-2.5">
              <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
              <span className="flex-1 text-left">{item.title}</span>
              {item.count && <span className="font-mono text-[11px] text-ink-mute bg-paper-2 px-[7px] py-[2px] rounded-full ml-auto">{item.count}</span>}
            </button>
          ) : (
            <Link href={item.href} onClick={handleNavClick} className="w-full flex items-center gap-[10px]">
              <Icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
              <span className="flex-1">{item.title}</span>
              {item.count && <span className="font-mono text-[11px] text-ink-mute bg-paper-2 px-[7px] py-[2px] rounded-full ml-auto">{item.count}</span>}
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const SidebarContentInternal = (
    <div className="flex flex-col h-full w-full px-[14px] py-[20px]">
      <div className="pb-[24px] mb-[24px] border-b border-dashed border-line shrink-0">
        <Logo 
          href="/resources" 
          showText={!collapsed} 
        />
      </div>
      <SidebarContent className="gap-0 py-0 scrollbar-hide px-0 pb-8">
        {navGroups.map((group, i) => (
          <SidebarGroup key={group.label || i} className="px-0 pb-0 pt-2">
            {!collapsed && group.label && (
              <SidebarGroupLabel className="font-semibold text-[11px] uppercase tracking-[0.12em] text-ink-mute px-0 pb-[6px] pt-[12px] h-auto">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-[3px]">
                {group.items.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </div>
  )

  // MOBILE
  if (isMobile) {
    return (
      <Sidebar collapsible="icon" variant="inset" className="bg-[oklch(0.97_0.012_85)] border-r border-line">
        {SidebarContentInternal}
      </Sidebar>
    )
  }

  // DESKTOP: aside with oklch(0.97 0.012 85) background
  return (
    <aside
      className={cn(
        "bg-[oklch(0.97_0.012_85)] flex flex-col h-full transition-[width] duration-200 ease-linear shrink-0 overflow-y-auto border-r border-line",
        collapsed ? "w-[var(--sidebar-width-icon)]" : "w-[260px]"
      )}
    >
      {SidebarContentInternal}
    </aside>
  )
}
