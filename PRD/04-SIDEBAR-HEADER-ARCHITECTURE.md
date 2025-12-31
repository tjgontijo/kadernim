# Sidebar & Header Architecture

Implementação detalhada baseada no padrão do whatrack

---

## 1. ESTRUTURA GERAL

```
DashboardLayout (Server Component)
│
├─ getCurrentOrganizationId() [validation]
├─ isAuthenticatedUser() [validation]
├─ isOrganizationComplete() [validation]
│
└─ SidebarProvider
   │
   ├─ HeaderActionsProvider
   │  │
   │  ├─ DashboardHeader
   │  │  ├─ SidebarTrigger
   │  │  ├─ Breadcrumbs
   │  │  ├─ HeaderActionsSlot
   │  │  └─ UserDropdownMenu
   │  │
   │  └─ main.flex-1
   │     ├─ DashboardContent
   │     │  ├─ OnboardingBanner
   │     │  ├─ OrganizationSelectorGate
   │     │  └─ {children}
   │     │
   │     └─ Toaster (sonner)
   │
   └─ DashboardSidebar (Client Component)
      ├─ Logo/Branding
      ├─ NavigationItems (SidebarGroup)
      ├─ Footer (UserDropdownMenu)
      └─ Collapse Handler
```

---

## 2. DASHBOARD LAYOUT

### 2.1 Server Component (layout.tsx)

```typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/server/auth'
import { getCurrentOrganizationId } from '@/server/organization'
import { isOrganizationSetupComplete } from '@/server/organization'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/dashboard/sidebar/sidebar'
import { DashboardHeader } from '@/components/dashboard/header/header'
import { DashboardContent } from '@/components/dashboard/layout-components/dashboard-content'
import { HeaderActionsProvider } from '@/components/dashboard/header-actions'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Dashboard - Kadernim',
  description: 'Admin dashboard',
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // 1. Validar autenticação
  const session = await getCurrentSession()
  if (!session) {
    redirect('/sign-in')
  }

  // 2. Validar organização
  const organizationId = await getCurrentOrganizationId()
  if (!organizationId) {
    redirect('/dashboard/select-organization')
  }

  // 3. Validar setup completo
  const isSetupComplete = await isOrganizationSetupComplete(organizationId)
  if (!isSetupComplete) {
    redirect('/dashboard/onboarding')
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <HeaderActionsProvider>
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <DashboardContent>
              {children}
            </DashboardContent>
          </main>
          <Toaster position="bottom-center" />
        </HeaderActionsProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### 2.2 Dashboard Content Wrapper

```typescript
// components/dashboard/layout-components/dashboard-content.tsx
import { OnboardingBanner } from '@/components/onboarding/onboarding-banner'
import { OrganizationSelectorGate } from '@/components/dashboard/organization-selector'
import { ReactNode } from 'react'

interface DashboardContentProps {
  children: ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  return (
    <div className="w-full space-y-6 p-6">
      <OnboardingBanner />
      <OrganizationSelectorGate>
        {children}
      </OrganizationSelectorGate>
    </div>
  )
}
```

---

## 3. SIDEBAR IMPLEMENTATION

### 3.1 Server Component (sidebar.tsx)

```typescript
// components/dashboard/sidebar/sidebar.tsx
import { DashboardSidebarClient } from './sidebar-client'
import {
  BarChart3,
  Users,
  Building2,
  Shield,
  LogsIcon,
  Plug,
  User,
  Cog,
  CreditCard,
  Key,
  Lock,
  LineChart,
} from 'lucide-react'

// Mapeamento de ícones
export const ICON_MAP: Record<string, any> = {
  BarChart3,
  Users,
  Building2,
  Shield,
  LogsIcon,
  Plug,
  User,
  Cog,
  CreditCard,
  Key,
  Lock,
  LineChart,
}

export const navigationItems = [
  {
    group: 'PLATAFORMA',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'BarChart3',
      },
      {
        label: 'Relatórios',
        href: '/dashboard/analytics',
        icon: 'LineChart',
      },
    ],
  },
  {
    group: 'ADMINISTRAÇÃO',
    items: [
      {
        label: 'Usuários',
        href: '/dashboard/users',
        icon: 'Users',
      },
      {
        label: 'Organizações',
        href: '/dashboard/organizations',
        icon: 'Building2',
      },
      {
        label: 'Funções',
        href: '/dashboard/permissions',
        icon: 'Shield',
      },
      {
        label: 'Auditoria',
        href: '/dashboard/audit-logs',
        icon: 'LogsIcon',
      },
    ],
  },
  {
    group: 'INTEGRAÇÕES',
    items: [
      {
        label: 'Integrações',
        href: '/dashboard/integrations',
        icon: 'Plug',
      },
    ],
  },
  {
    group: 'CONFIGURAÇÕES',
    items: [
      {
        label: 'Minha Conta',
        href: '/dashboard/settings/account',
        icon: 'User',
      },
      {
        label: 'Organização',
        href: '/dashboard/settings/organization',
        icon: 'Building2',
      },
      {
        label: 'Billing',
        href: '/dashboard/settings/billing',
        icon: 'CreditCard',
      },
      {
        label: 'Chaves API',
        href: '/dashboard/settings/api-keys',
        icon: 'Key',
      },
      {
        label: 'Segurança',
        href: '/dashboard/settings/security',
        icon: 'Lock',
      },
    ],
  },
]

interface SidebarProps {
  // Props do SidebarProvider já passadas automaticamente
}

export function DashboardSidebar() {
  return <DashboardSidebarClient />
}
```

### 3.2 Client Component (sidebar-client.tsx)

```typescript
// components/dashboard/sidebar/sidebar-client.tsx
'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from '@/components/ui/sidebar'
import { Logo } from '@/components/dashboard/sidebar/logo'
import { UserDropdownMenu } from './user-dropdown-menu'
import { navigationItems, ICON_MAP } from './sidebar'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function DashboardSidebarClient() {
  const pathname = usePathname()
  const { open } = useSidebar()

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo */}
        <Logo />

        {/* Grupos de navegação */}
        {navigationItems.map(group => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className={cn(
              'text-xs font-semibold uppercase tracking-wider text-muted-foreground',
              !open && 'hidden'
            )}>
              {group.group}
            </SidebarGroupLabel>

            <SidebarMenu>
              {group.items.map(item => {
                const Icon = ICON_MAP[item.icon]
                const active = isActive(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={!open ? item.label : undefined}
                      className={cn(
                        'transition-colors',
                        active && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Link href={item.href}>
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer - User Dropdown */}
      <SidebarFooter>
        <UserDropdownMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
```

### 3.3 Logo Component

```typescript
// components/dashboard/sidebar/logo.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSidebar } from '@/components/ui/sidebar'
import { SidebarGroup, SidebarMenuButton } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export function Logo() {
  const { open } = useSidebar()

  return (
    <SidebarGroup>
      <SidebarMenuButton size="lg" asChild>
        <Link href="/dashboard" className={cn(!open && 'justify-center')}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            K
          </div>
          {open && (
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">Kadernim</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarGroup>
  )
}
```

### 3.4 User Dropdown Menu

```typescript
// components/dashboard/sidebar/user-dropdown-menu.tsx
'use client'

import { useMemo } from 'react'
import { useSession } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LogOut,
  Settings,
  CreditCard,
  Shield,
  Sun,
  Moon,
  Monitor,
  Building2,
  Crown,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from '@/server/auth'

export function UserDropdownMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const user = session?.user
  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }, [user?.name])

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" side="right">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/dashboard/settings/account">
                  <Settings className="mr-2 h-4 w-4" />
                  Meu Perfil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dashboard/settings/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/dashboard/settings/security">
                  <Shield className="mr-2 h-4 w-4" />
                  Segurança
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a href="/dashboard/select-organization">
                  <Building2 className="mr-2 h-4 w-4" />
                  Mudar Organização
                </a>
              </DropdownMenuItem>
              {user?.role === 'SUPER_ADMIN' && (
                <DropdownMenuItem asChild>
                  <a href="/admin">
                    <Crown className="mr-2 h-4 w-4" />
                    Painel Super Admin
                  </a>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Tema */}
            <DropdownMenuLabel className="text-xs">Tema</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === 'light' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === 'dark' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
                {theme === 'system' && <span className="ml-auto">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
```

---

## 4. HEADER IMPLEMENTATION

### 4.1 Header Component

```typescript
// components/dashboard/header/header.tsx
'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from './breadcrumbs'
import { HeaderActionsSlot } from './header-actions'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background px-4 py-3 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumbs />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Header Actions Slot (injetadas por páginas) */}
        <HeaderActionsSlot />

        {/* Notificações */}
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User info (avatar já está na sidebar) */}
      </div>
    </header>
  )
}
```

### 4.2 Breadcrumbs

```typescript
// components/dashboard/header/breadcrumbs.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Mapeamento de rota para label amigável
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  organizations: 'Organizações',
  permissions: 'Funções & Permissões',
  'audit-logs': 'Auditoria',
  integrations: 'Integrações',
  analytics: 'Relatórios',
  settings: 'Configurações',
  account: 'Minha Conta',
  organization: 'Organização',
  billing: 'Billing',
  'api-keys': 'Chaves API',
  security: 'Segurança',
}

function generateBreadcrumbs(pathname: string) {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .slice(1) // Remove 'dashboard'

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
  ]

  let href = '/dashboard'
  segments.forEach((segment, index) => {
    href += `/${segment}`
    const label = routeLabels[segment] || segment

    if (index === segments.length - 1) {
      // Última item: página
      breadcrumbs.push({ label, href: undefined })
    } else {
      // Item intermediário: link
      breadcrumbs.push({ label, href })
    }
  })

  return breadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {crumb.href ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### 4.3 Header Actions Provider

```typescript
// components/dashboard/header/header-actions.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react'

const HeaderActionsContext = createContext<
  ((actions: ReactNode) => void) | null
>(null)

interface HeaderActionsProviderProps {
  children: ReactNode
}

export function HeaderActionsProvider({
  children,
}: HeaderActionsProviderProps) {
  const [actions, setActions] = useState<ReactNode>(null)

  return (
    <HeaderActionsContext.Provider value={setActions}>
      <HeaderActionsInnerProvider actions={actions}>
        {children}
      </HeaderActionsInnerProvider>
    </HeaderActionsContext.Provider>
  )
}

function HeaderActionsInnerProvider({
  children,
  actions,
}: {
  children: ReactNode
  actions: ReactNode
}) {
  return (
    <div data-header-actions-slot={true}>
      {children}
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function HeaderActions({ children }: { children: ReactNode }) {
  const setActions = useContext(HeaderActionsContext)

  React.useEffect(() => {
    if (!setActions) {
      console.warn('HeaderActions deve estar dentro de HeaderActionsProvider')
      return
    }

    setActions(children)
    return () => setActions(null)
  }, [children, setActions])

  return null
}

export function HeaderActionsSlot() {
  // Renderiza o conteúdo do context no header
  const actions = useContext(HeaderActionsContext)
  return actions
}
```

---

## 5. PADRÃO DE USO EM PÁGINAS

### 5.1 Página com Header Actions

```typescript
// app/dashboard/users/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeaderActions } from '@/components/dashboard/header/header-actions'
import { PageHeader } from '@/components/data-table/page-header'
import { DataTableView } from '@/components/data-table/data-table-view'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { UserFormDialog } from '@/components/dashboard/users/user-form-dialog'

export default function UsersPage() {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({})

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      // API call
    },
  })

  return (
    <>
      {/* Header Actions - renderizadas no header automaticamente */}
      <HeaderActions>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </HeaderActions>

      {/* Conteúdo da página */}
      <div className="space-y-6">
        <PageHeader
          title="Usuários"
          description="Gerencie todos os usuários do sistema"
          action={{
            label: 'Como usar?',
            onClick: () => {/* help */},
          }}
        />

        <DataTableView
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Dialog */}
      <UserFormDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
```

---

## 6. RESPONSIVIDADE

### 6.1 Comportamentos por Breakpoint

```typescript
// Sidebar
- mobile: colapsada (ícones apenas)
- md (768px): colapsada ou expandida
- lg (1024px): sempre expandida

// Header
- mobile: compact (sem breadcrumbs)
- md+: full breadcrumbs

// Main Content
- mobile: full width, padding reduzido
- lg: sidebar width calculado automático
```

### 6.2 Mobile Menu

```typescript
// components/dashboard/header/mobile-menu.tsx
'use client'

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { DashboardSidebarClient } from '../sidebar/sidebar-client'

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <DashboardSidebarClient />
      </SheetContent>
    </Sheet>
  )
}
```

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar layout.tsx com validações
- [ ] Configurar SidebarProvider
- [ ] Implementar Logo component
- [ ] Implementar Sidebar com navegação
- [ ] Implementar User Dropdown Menu
- [ ] Implementar Header com SidebarTrigger
- [ ] Implementar Breadcrumbs dinâmicos
- [ ] Implementar HeaderActionsProvider/Context
- [ ] Testar collapse/expand de sidebar
- [ ] Testar responsividade mobile
- [ ] Testar HeaderActions em página
- [ ] Implementar skeleton loading
- [ ] Adicionar tooltips em sidebar collapsed
- [ ] Testar tema claro/escuro
- [ ] Testar autenticação e redirecionamento

---

## 8. PADRÕES IMPORTANTES

### 8.1 Never re-render sidebar unnecessarily
- Usar `'use client'` apenas em `sidebar-client.tsx`
- Logo é componente separado
- UserDropdownMenu é componente separado

### 8.2 Header actions são injetadas
- Páginas usam `<HeaderActions>` para renderizar botões
- Context Provider gerencia state
- Automático desaparece ao sair da página

### 8.3 Breadcrumbs gerados automaticamente
- Baseado em `pathname` do `usePathname()`
- Mapeamento em `routeLabels`
- Útil para UX de navegação

### 8.4 Authenticação no layout
- Server-side validation
- Redirecionamento automático
- Validação de organização
- Check de onboarding

---

**Referência**: Padrão exato do whatrack adaptado para Kadernim
