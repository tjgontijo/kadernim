# PRD: Frontend Design System & UI Architecture

**Projeto**: Kadernim SaaS
**Versão**: 1.0
**Data**: 2025-12-29
**Status**: Em Planejamento

---

## 1. VISÃO GERAL

Definir a arquitetura de frontend, estrutura de componentes e design system para a administração do Kadernim SaaS. O sistema segue os padrões estabelecidos no whatrack, utilizando Next.js 14+, shadcn/ui e Tailwind CSS.

### 1.1 Objetivos
- ✓ Criar interface consistente para toda a administração
- ✓ Maximizar reusabilidade de componentes
- ✓ Garantir acessibilidade e responsividade
- ✓ Implementar navegação intuitiva com Sidebar + Header + Main
- ✓ Manter padrões de UX/UI consistentes

---

## 2. ESTRUTURA GERAL DO PROJETO

```
/kadernim/src
├── /app
│   ├── /(auth)
│   │   ├── layout.tsx
│   │   ├── /sign-in
│   │   ├── /sign-up
│   │   ├── /forgot-password
│   │   ├── /reset-password
│   │   ├── /onboarding
│   │   └── page.tsx
│   │
│   ├── /dashboard
│   │   ├── layout.tsx                    # Layout principal do dashboard
│   │   ├── page.tsx                      # Dashboard home
│   │   ├── /users                        # Gestão de usuários
│   │   ├── /organizations                # Gestão de organizações
│   │   ├── /permissions                  # Gestão de permissões/papéis
│   │   ├── /integrations                 # Integrações de terceiros
│   │   ├── /audit-logs                   # Logs de auditoria
│   │   ├── /settings
│   │   │   ├── /account                  # Configurações da conta
│   │   │   ├── /organization             # Configurações da organização
│   │   │   ├── /billing                  # Gestão de billing
│   │   │   ├── /api-keys                 # Chaves de API
│   │   │   └── /security                 # Segurança (2FA, Sessions)
│   │   └── /analytics                    # Analytics & Reports
│   │
│   ├── /api/v1
│   │   ├── /organizations
│   │   ├── /users
│   │   ├── /permissions
│   │   ├── /integrations
│   │   └── ...
│   │
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout
│   └── globals.css
│
├── /components
│   ├── /ui                               # shadcn Components (50+ componentes)
│   │
│   ├── /dashboard
│   │   ├── /sidebar                      # Sidebar e navegação
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-client.tsx
│   │   │   ├── user-dropdown-menu.tsx
│   │   │   └── navigation-items.ts
│   │   │
│   │   ├── /header                       # Header principal
│   │   │   ├── header.tsx
│   │   │   ├── header-actions.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   └── search-bar.tsx
│   │   │
│   │   ├── /layout-components
│   │   │   ├── dashboard-content.tsx
│   │   │   ├── page-header.tsx
│   │   │   └── organization-selector.tsx
│   │   │
│   │   ├── /users                        # Componentes de usuários
│   │   │   ├── client-users-table.tsx
│   │   │   ├── user-form-dialog.tsx
│   │   │   ├── user-filters.tsx
│   │   │   ├── user-bulk-actions.tsx
│   │   │   └── user-detail-sheet.tsx
│   │   │
│   │   ├── /organizations                # Componentes de organizações
│   │   │   ├── organizations-table.tsx
│   │   │   ├── org-form-dialog.tsx
│   │   │   ├── org-settings-sheet.tsx
│   │   │   └── org-members-panel.tsx
│   │   │
│   │   ├── /permissions                  # Componentes de permissões
│   │   │   ├── roles-list.tsx
│   │   │   ├── role-form-dialog.tsx
│   │   │   ├── permissions-matrix.tsx
│   │   │   └── permission-selector.tsx
│   │   │
│   │   ├── /integrations                 # Componentes de integrações
│   │   │   ├── integrations-grid.tsx
│   │   │   ├── integration-setup-dialog.tsx
│   │   │   ├── integration-list.tsx
│   │   │   └── integration-status-badge.tsx
│   │   │
│   │   ├── /audit-logs                   # Componentes de auditoria
│   │   │   ├── audit-log-table.tsx
│   │   │   ├── audit-log-filters.tsx
│   │   │   ├── audit-log-detail-modal.tsx
│   │   │   └── audit-stats.tsx
│   │   │
│   │   ├── /analytics                    # Componentes de analytics
│   │   │   ├── analytics-overview.tsx
│   │   │   ├── charts/
│   │   │   │   ├── user-growth-chart.tsx
│   │   │   │   ├── activity-heatmap.tsx
│   │   │   │   ├── usage-distribution.tsx
│   │   │   │   └── conversion-funnel.tsx
│   │   │   └── metrics-grid.tsx
│   │   │
│   │   ├── /settings                     # Componentes de configurações
│   │   │   ├── settings-nav.tsx
│   │   │   ├── account-settings-form.tsx
│   │   │   ├── organization-settings-form.tsx
│   │   │   ├── billing-overview.tsx
│   │   │   ├── api-keys-manager.tsx
│   │   │   ├── security-panel.tsx
│   │   │   └── session-manager.tsx
│   │   │
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── error-boundary.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── confirmation-dialog.tsx
│   │
│   ├── /data-table
│   │   ├── data-table-view.tsx
│   │   ├── responsive-data-table.tsx
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-skeleton.tsx
│   │   ├── data-table-empty-state.tsx
│   │   ├── content-header.tsx
│   │   ├── filters/
│   │   │   ├── filter-pill.tsx
│   │   │   ├── search-filter.tsx
│   │   │   ├── date-range-filter.tsx
│   │   │   ├── status-filter.tsx
│   │   │   └── select-filter.tsx
│   │   └── cards/
│   │       └── data-table-card-list.tsx
│   │
│   ├── /forms
│   │   ├── /schemas                      # Zod schemas para forms
│   │   ├── form-builder.tsx
│   │   ├── field-wrapper.tsx
│   │   └── form-error-display.tsx
│   │
│   ├── /providers
│   │   ├── auth-provider.tsx
│   │   ├── query-provider.tsx
│   │   ├── modal-provider.tsx
│   │   ├── sidebar-provider.tsx
│   │   └── theme-provider.tsx
│   │
│   ├── /icons
│   │   ├── custom-icons.tsx
│   │   └── icon-map.ts
│   │
│   ├── /home
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── pricing.tsx
│   │   ├── cta.tsx
│   │   └── footer.tsx
│   │
│   └── /onboarding
│       ├── onboarding-flow.tsx
│       ├── onboarding-steps.tsx
│       └── setup-wizards/
│           └── organization-setup.tsx
│
├── /hooks
│   ├── use-mobile.ts
│   ├── use-data-table.ts
│   ├── use-keyboard-shortcuts.ts
│   ├── use-sidebar.ts
│   ├── use-filter-state.ts
│   ├── use-auth.ts
│   ├── use-organization.ts
│   └── use-permissions.ts
│
├── /lib
│   ├── /auth
│   │   ├── auth-client.ts
│   │   └── permissions-helper.ts
│   ├── /validations
│   │   ├── user-schema.ts
│   │   ├── organization-schema.ts
│   │   ├── role-schema.ts
│   │   ├── integration-schema.ts
│   │   └── audit-log-schema.ts
│   ├── constants.ts
│   ├── navigation.ts                     # Definições de rotas
│   └── utils.ts
│
├── /server
│   ├── /auth
│   ├── /organization
│   ├── /users
│   ├── /permissions
│   ├── /integrations
│   └── /audit
│
└── /styles
    ├── globals.css
    ├── variables.css
    └── animations.css
```

---

## 3. LAYOUT PRINCIPAL

### 3.1 Estrutura de 3 Camadas

```
┌────────────────────────────────────────────────────┐
│           HEADER (120px)                           │
│  [≡] Breadcrumbs | Ações Dinâmicas | Perfil       │
├──────────┬────────────────────────────────────────┤
│          │                                        │
│ SIDEBAR  │         MAIN CONTENT AREA              │
│ (240px)  │                                        │
│          │  ┌──────────────────────────────────┐  │
│ collapse │  │ Page Header + Subheader          │  │
│ to 60px  │  ├──────────────────────────────────┤  │
│          │  │ Filtros / Ações                  │  │
│          │  ├──────────────────────────────────┤  │
│          │  │ Conteúdo Principal               │  │
│          │  │ (Tabelas, Cards, Gráficos)      │  │
│          │  │                                  │  │
│          │  └──────────────────────────────────┘  │
│          │                                        │
└──────────┴────────────────────────────────────────┘
```

### 3.2 Header Responsivo

**Desktop (≥1024px)**:
- SidebarTrigger (hamburger icon)
- Breadcrumbs interativos
- Barra de pesquisa
- HeaderActions slot para ações específicas
- User avatar + dropdown menu
- Notificações

**Mobile (<1024px)**:
- SidebarTrigger collapsa sidebar
- Breadcrumbs em cascata (mobile-friendly)
- Menu de ações colapsável
- User avatar compact

**Implementação**:
```typescript
// header.tsx
export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-6 py-3">
      {/* Esquerda */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
        <Breadcrumbs />
      </div>

      {/* Direita */}
      <div className="flex items-center gap-4">
        <HeaderActionsSlot />
        <UserDropdownMenu />
      </div>
    </header>
  )
}
```

### 3.3 Sidebar Navegação

**Características**:
- Collapsível (240px ↔ 60px)
- Grupos de navegação com labels
- Icons + labels (expandido) ou só icons (collapsed)
- Estado ativo da rota atual
- Tooltips ao hover
- User menu no footer

**Estrutura de Grupos**:

```
┌─────────────────────┐
│ Logo                │
├─────────────────────┤
│ PLATAFORMA          │
│ ├─ Dashboard        │
│ └─ Relatórios       │
├─────────────────────┤
│ ADMINISTRAÇÃO       │
│ ├─ Usuários         │
│ ├─ Organizações     │
│ ├─ Funções/Perms    │
│ └─ Auditoria        │
├─────────────────────┤
│ INTEGRAÇÕES         │
│ └─ Gerenciar        │
├─────────────────────┤
│ CONFIGURAÇÕES       │
│ ├─ Minha Conta      │
│ ├─ Organização      │
│ ├─ Billing          │
│ ├─ Chaves API       │
│ └─ Segurança        │
├─────────────────────┤
│ [Avatar] Usuário ▼  │ ← User Menu
└─────────────────────┘
```

**Items de Navegação**:
```typescript
const navigationItems = [
  {
    group: "PLATAFORMA",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "BarChart3" },
      { label: "Relatórios", href: "/dashboard/analytics", icon: "LineChart" },
    ],
  },
  {
    group: "ADMINISTRAÇÃO",
    items: [
      { label: "Usuários", href: "/dashboard/users", icon: "Users" },
      { label: "Organizações", href: "/dashboard/organizations", icon: "Building2" },
      { label: "Funções & Perms", href: "/dashboard/permissions", icon: "Shield" },
      { label: "Auditoria", href: "/dashboard/audit-logs", icon: "LogsIcon" },
    ],
  },
  {
    group: "INTEGRAÇÕES",
    items: [
      { label: "Integrações", href: "/dashboard/integrations", icon: "Plug" },
    ],
  },
  {
    group: "CONFIGURAÇÕES",
    items: [
      { label: "Minha Conta", href: "/dashboard/settings/account", icon: "User" },
      { label: "Organização", href: "/dashboard/settings/organization", icon: "Cog" },
      { label: "Billing", href: "/dashboard/settings/billing", icon: "CreditCard" },
      { label: "Chaves API", href: "/dashboard/settings/api-keys", icon: "Key" },
      { label: "Segurança", href: "/dashboard/settings/security", icon: "Lock" },
    ],
  },
];
```

**User Dropdown Menu**:
```
┌─────────────────────────────────┐
│ 👤 João Silva                   │
│    joao@example.com             │
├─────────────────────────────────┤
│ ⭐ Upgrade para Pro              │
├─────────────────────────────────┤
│ 🏢 Mudar Organização             │
├─────────────────────────────────┤
│ ⚙️  Meu Perfil                   │
│ 💰 Billing                       │
│ 🔒 Segurança                     │
├─────────────────────────────────┤
│ 🌙 Tema (Light/Dark/System)     │
├─────────────────────────────────┤
│ 🚪 Sair                          │
└─────────────────────────────────┘
```

---

## 4. COMPONENTES UI (shadcn/ui)

### 4.1 Componentes Necessários (60+ componentes)

**Inputs & Forms**:
```
button           input           textarea       select
checkbox         radio-group     switch         label
input-otp        input-group     button-group   password-input
```

**Feedback**:
```
alert            alert-dialog    toast          skeleton
badge            progress        spinner        sonner
```

**Navigation**:
```
sidebar          breadcrumb       tabs           pagination
navigation-menu  menubar          dropdown-menu  command
```

**Containers**:
```
card             accordion        collapsible    dialog
drawer           sheet            popover        tooltip
scroll-area      resizable        separator      slot
```

**Data Display**:
```
table            data-grid        avatar         avatar-group
badge            progress-bar     status-badge   code-block
```

**Complex**:
```
form             date-picker      time-picker    color-picker
search-input     location-picker  filter-pill    rich-editor
combo-box        multi-select     tag-input      tree-view
```

### 4.2 Componentes Customizados

```typescript
// Specific to Kadernim admin
- status-badge.tsx           // Badges com status customizados
- permission-badge.tsx       // Badges para permissões
- role-badge.tsx             // Badges para funções
- organization-badge.tsx     // Badges para organizações
- activity-indicator.tsx     // Indicador de atividade
- integration-status.tsx     // Status de integrações
- permissions-matrix.tsx     // Matriz de permissões
- role-selector.tsx          // Seletor de funções
- organization-selector.tsx  // Seletor de organizações
- bulk-action-toolbar.tsx    // Barra de ações em massa
- empty-state.tsx            // Estados vazios
- confirmation-dialog.tsx    // Dialogs de confirmação
```

---

## 5. MÓDULOS & FUNCIONALIDADES

### 5.1 Dashboard Home (`/dashboard`)

**Objetivo**: Visão geral do sistema para admins

**Seções**:
1. **Welcome Card**: Boas-vindas personalizado
2. **Quick Stats**:
   - Total de usuários
   - Organizações ativas
   - Integrações configuradas
   - Eventos de auditoria (últimas 24h)

3. **Activity Heatmap**: Atividade por hora/dia
4. **Top Organizations**: Top 10 orgs por atividade
5. **Recent Audit Events**: Últimos 20 eventos
6. **Quick Actions**: Botões de ação rápida

**Componentes**:
```
dashboard-metrics-grid.tsx
activity-heatmap.tsx
organizations-activity-list.tsx
recent-events-list.tsx
quick-actions-card.tsx
```

### 5.2 Gestão de Usuários (`/dashboard/users`)

**Funcionalidades**:
- Listar todos os usuários
- Filtros: Status, Organização, Role, Data de criação
- Busca por nome/email
- Criação de novo usuário
- Edição de usuário
- Ativar/Desativar
- Resetar senha
- Deletar usuário (soft delete)
- Visualização em modo tabela/cards
- Paginação e sorting
- Ações em massa (bulk actions)

**Componentes**:
```
client-users-table.tsx          # Tabela principal
user-form-dialog.tsx            # Dialog novo/editar
user-filters.tsx                # Filters
user-bulk-actions.tsx           # Ações em massa
user-detail-sheet.tsx           # Detalhes do usuário
user-avatar.tsx                 # Avatar customizado
user-status-badge.tsx           # Status
user-role-selector.tsx          # Seletor de role
```

**Columns da Tabela**:
```
┌─ Checkbox (select)
├─ Avatar + Nome
├─ Email
├─ Organização
├─ Função/Role
├─ Status (Active/Inactive)
├─ Último Login
├─ Data de Criação
└─ Ações (Edit, Reset Pwd, Delete)
```

**Formulário de Usuário**:
```
- Nome completo (required)
- Email (required, unique)
- Organização (required, searchable)
- Função/Role (required, multi-select)
- Status (Active/Inactive)
- Ativar 2FA (checkbox)
- Data de expiração (optional)
- Notas (textarea)
```

### 5.3 Gestão de Organizações (`/dashboard/organizations`)

**Funcionalidades**:
- Listar organizações
- Filtros: Status, Tipo, Plano, Data
- Busca por nome
- Criar organização
- Editar organização
- Gerenciar membros da org
- Visualizar quota de uso
- Deletar organização
- Clone organização (admin)

**Componentes**:
```
organizations-table.tsx
org-form-dialog.tsx
org-settings-sheet.tsx
org-members-panel.tsx
org-quota-usage.tsx
org-status-badge.tsx
member-list-table.tsx
```

**Columns da Tabela**:
```
┌─ Logo + Nome
├─ Tipo (Enterprise/Professional/Free)
├─ Membros (count)
├─ Usuários (count)
├─ Status
├─ Plano/Subscription
├─ Limite de Quota
├─ Data de Criação
└─ Ações
```

**Formulário de Organização**:
```
- Nome (required)
- Slug/Subdomain (required, auto-generate)
- Logo (upload)
- Descrição (textarea)
- Tipo de Plano (select)
- Limite de Usuários (number)
- Limite de Integrações (number)
- Status (Active/Suspended/Deleted)
- Contato Principal (email)
```

### 5.4 Gestão de Permissões/Roles (`/dashboard/permissions`)

**Funcionalidades**:
- Listar Roles predefinidas e customizadas
- Visualizar Permissions
- Criar Role customizada
- Editar Role
- Deletar Role customizada
- Matriz de Permissões (quem pode fazer o quê)
- Assignar Role a usuários
- Preview de permissões

**Componentes**:
```
roles-list.tsx
role-form-dialog.tsx
permissions-matrix.tsx
permission-selector.tsx
permission-tree.tsx
role-badge.tsx
permission-editor.tsx
```

**Roles Padrão**:
```
- Super Admin (todas as permissões)
- Admin (gerenciamento de usuários, orgs, integrações)
- Manager (gerenciamento dentro da org)
- Member (acesso básico)
- Viewer (somente leitura)
- Guest (acesso limitado)
```

**Permissões por Categoria**:
```
Users
├── users:read
├── users:create
├── users:update
├── users:delete
└── users:reset_password

Organizations
├── organizations:read
├── organizations:create
├── organizations:update
├── organizations:delete
└── organizations:manage_members

Roles & Permissions
├── roles:read
├── roles:create
├── roles:update
└── roles:delete

Integrations
├── integrations:read
├── integrations:create
├── integrations:update
├── integrations:delete
└── integrations:configure

Audit
├── audit:read
├── audit:export
└── audit:delete

Billing
├── billing:read
├── billing:update
└── billing:manage_subscription

API Keys
├── api_keys:create
├── api_keys:read
├── api_keys:delete
└── api_keys:rotate

Security
├── security:2fa
├── security:sessions
└── security:security_settings
```

### 5.5 Integrações (`/dashboard/integrations`)

**Funcionalidades**:
- Descobrir integrações disponíveis
- Instalar/Desinstalar
- Configurar integração
- Testar conexão
- Historicidade de eventos
- Logs de sync
- Ativar/Desativar
- Deletar integração

**Componentes**:
```
integrations-grid.tsx
integration-setup-dialog.tsx
integration-list.tsx
integration-status-badge.tsx
integration-config-form.tsx
integration-test-button.tsx
sync-logs-table.tsx
```

**Grid de Integrações Disponíveis**:
```
┌─────────────────────────────────────┐
│ [Logo] Integrando 1                 │
│ Descrição curta                     │
│ [Conectar]      [Documentação]      │
└─────────────────────────────────────┘
```

**Lista de Integrações Ativas**:
```
Integrando 1        ✓ Conectado    [Configurar] [Remover]
Integrando 2        ✓ Conectado    [Configurar] [Remover]
Integrando 3        ✗ Erro         [Reconectar] [Remover]
```

### 5.6 Auditoria (`/dashboard/audit-logs`)

**Funcionalidades**:
- Visualizar todos os eventos
- Filtrar por: usuário, tipo de evento, recurso, data
- Busca full-text
- Visualizar detalhes do evento
- Exportar logs (CSV/JSON)
- Deletar logs (apenas super admin)
- Timeline view
- Analytics de eventos

**Componentes**:
```
audit-log-table.tsx
audit-log-filters.tsx
audit-log-detail-modal.tsx
audit-log-timeline.tsx
audit-stats.tsx
export-logs-button.tsx
```

**Tipos de Evento**:
```
user:created
user:updated
user:deleted
user:password_reset
user:login
user:logout
organization:created
organization:updated
organization:deleted
role:created
role:updated
role:deleted
permission:assigned
permission:revoked
integration:connected
integration:disconnected
integration:configured
api_key:created
api_key:rotated
api_key:deleted
security:2fa_enabled
security:2fa_disabled
security:session_created
security:session_terminated
billing:subscription_changed
billing:payment_made
billing:payment_failed
```

**Columns da Tabela**:
```
┌─ Data/Hora
├─ Usuário
├─ Tipo de Evento
├─ Recurso
├─ Ação (created/updated/deleted)
├─ Status (success/warning/error)
├─ IP Address
└─ Detalhes (expandível)
```

### 5.7 Analytics & Reports (`/dashboard/analytics`)

**Funcionalidades**:
- Estatísticas gerais
- Gráficos de crescimento
- Heatmap de atividades
- Distribuição por organização
- Performance do sistema
- Exportar relatórios
- Agendamento de relatórios
- Dashboards customizados

**Componentes**:
```
analytics-overview.tsx
user-growth-chart.tsx
activity-heatmap.tsx
usage-distribution.tsx
conversion-funnel.tsx
metrics-grid.tsx
export-report-dialog.tsx
```

**Gráficos & Métricas**:
```
- User Growth (Line Chart)
- Organizations Growth (Bar Chart)
- Activity by Weekday (Heatmap)
- Users by Organization (Pie Chart)
- Audit Events by Type (Bar Chart)
- API Usage (Line Chart)
- System Health (Progress Bars)
- Last 7 Days Stats (Metric Cards)
```

### 5.8 Configurações

#### 5.8.1 Minha Conta (`/dashboard/settings/account`)
```
Seções:
- Perfil (nome, email, avatar)
- Informações Pessoais (telefone, idioma)
- Preferências (tema, notificações)
- Ativar/Desativar 2FA
- Sessions ativas
- Histórico de login
- Deletar conta
```

#### 5.8.2 Organização (`/dashboard/settings/organization`)
```
Seções:
- Informações gerais (nome, logo, descrição)
- Membros (listar, adicionar, remover)
- Convites pendentes
- Roles na organização
- Webhooks
- Domínios customizados
```

#### 5.8.3 Billing (`/dashboard/settings/billing`)
```
Seções:
- Plano atual
- Uso de quota
- Faturas (histórico)
- Métodos de pagamento
- Upgrade/Downgrade
- Cancelamento
```

#### 5.8.4 Chaves API (`/dashboard/settings/api-keys`)
```
Funcionalidades:
- Criar nova chave
- Listar chaves
- Rotar chave
- Deletar chave
- Scopes/Permissões por chave
- Último uso
- IP whitelist (opcional)
```

#### 5.8.5 Segurança (`/dashboard/settings/security`)
```
Seções:
- 2FA (ativar/desativar, backup codes)
- Sessions (listar, terminar)
- IP Whitelist
- Login Alerts
- Device Management
- Password Policy
```

---

## 6. PADRÕES DE IMPLEMENTAÇÃO

### 6.1 Estrutura de Página

```typescript
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeaderActions } from '@/components/dashboard/header-actions'
import { PageHeader } from '@/components/data-table/page-header'
import { DataTableView } from '@/components/data-table/data-table-view'

export default function PageName() {
  const [filters, setFilters] = useState({...})

  const { data, isLoading } = useQuery({
    queryKey: ['resource', filters],
    queryFn: async () => {
      // API call
    }
  })

  return (
    <>
      <HeaderActions>
        <Button onClick={...}>Ação</Button>
      </HeaderActions>

      <div className="space-y-6">
        <PageHeader title="Título" description="Descrição" />

        <DataTableView
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </>
  )
}
```

### 6.2 Validação com Zod

```typescript
import { z } from 'zod'

export const userFormSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  organizationId: z.string().uuid(),
  roles: z.array(z.string()).min(1),
  status: z.enum(['active', 'inactive']),
  expiresAt: z.date().optional(),
})

export type UserFormInput = z.infer<typeof userFormSchema>
```

### 6.3 React Query Setup

```typescript
// hooks/use-users.ts
export function useUsers(filters: FiltersType) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const response = await fetch(`/api/v1/users?${new URLSearchParams(filters)}`)
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// hooks/use-create-user.ts
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UserFormInput) => {
      const response = await fetch('/api/v1/users', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário criado com sucesso!')
    },
  })
}
```

### 6.4 Componente de Tabela de Dados

```typescript
// components/data-table/responsive-data-table.tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  getRowClassName?: (row: T) => string
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  loading,
  ...props
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    // ...
  })

  if (loading) return <DataTableSkeleton columnCount={columns.length} />
  if (data.length === 0) return <DataTableEmptyState />

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table>
          {/* ... */}
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-2">
        {data.map(item => (
          <DataTableCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}
```

### 6.5 Dialog de CRUD

```typescript
// components/dashboard/users/user-form-dialog.tsx
interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string // undefined = novo
}

export function UserFormDialog({
  open,
  onOpenChange,
  userId,
}: UserFormDialogProps) {
  const isEdit = !!userId
  const { data: user } = useQuery({
    enabled: isEdit,
    // ...
  })

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user || { roles: [] },
  })

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()

  async function onSubmit(data: UserFormInput) {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: userId, ...data })
    } else {
      await createMutation.mutateAsync(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <Button type="submit" disabled={createMutation.isPending}>
              {isEdit ? 'Atualizar' : 'Criar'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### 6.6 Ações em Massa

```typescript
// components/dashboard/users/user-bulk-actions.tsx
interface UserBulkActionsProps {
  selectedIds: string[]
  onClose: () => void
}

export function UserBulkActions({
  selectedIds,
  onClose,
}: UserBulkActionsProps) {
  const activateMutation = useActivateUsers()
  const deactivateMutation = useDeactivateUsers()

  return (
    <div className="flex gap-2 p-2 bg-muted rounded-lg border">
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} selecionado(s)
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => activateMutation.mutate(selectedIds)}
      >
        Ativar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => deactivateMutation.mutate(selectedIds)}
      >
        Desativar
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClose}
      >
        Limpar
      </Button>
    </div>
  )
}
```

---

## 7. FLUXOS DE USUÁRIO PRINCIPAIS

### 7.1 Autenticação

```
Landing Page
    ↓
Sign In / Sign Up
    ↓
Email Verification (opcional)
    ↓
2FA Setup (opcional, primeira vez)
    ↓
Create/Select Organization
    ↓
Onboarding (primeiras configuras)
    ↓
Dashboard
```

### 7.2 Gestão de Usuários

```
Ir para Users
    ↓
Filtrar/Buscar
    ↓
Clicar em usuário para detalhes/editar
    ↓
Salvar alterações
    ↓
Toast de confirmação
    ↓
Invalidar cache e recarregar tabela
```

### 7.3 Criar Nova Organização

```
Admin → Organizations
    ↓
Clicar "Nova Organização"
    ↓
Dialog com formulário
    ├─ Nome, Logo, Descrição
    ├─ Tipo de Plano
    └─ Contato Principal
    ↓
Salvar
    ↓
Redirecionado para org details
    ↓
Sugerir próximos passos
```

### 7.4 Configurar Integração

```
Integrations Page
    ↓
Clicar em integração desejada
    ↓
Setup Dialog
    ├─ Ler documentação
    ├─ Copiar chaves de API
    └─ Preencher credenciais
    ↓
Test Connection
    ↓
Se sucesso: Salvar e ativar
Se erro: Mostrar erro e permitir retry
    ↓
Listar em "Integrações Ativas"
```

---

## 8. CONSIDERAÇÕES TÉCNICAS

### 8.1 Performance

- **Code Splitting**: Cada rota é um bundle separado
- **Image Optimization**: Next.js Image component
- **Data Fetching**: React Query com staleTime apropriado
- **Memoization**: useMemo/useCallback para componentes pesados
- **Virtual Scrolling**: Para listas com 1000+ itens
- **Pagination**: Padrão server-side com limit/offset

### 8.2 Segurança

- **CSRF Protection**: Token de CSRF em mutações
- **XSS Prevention**: React escapa por padrão
- **SQL Injection**: Prepared statements no backend
- **Auth**: JWT + HTTP-only cookies
- **Rate Limiting**: API rate limiting por usuário
- **Audit Logging**: Todos os actions críticos são logged
- **Permission Validation**: Backend valida em cada request

### 8.3 Responsividade

```css
/* Breakpoints */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px

/* Strategy: Mobile-first */
- Default: mobile
- md: tablet adjustments
- lg: sidebar appears
- xl: full desktop experience
```

### 8.4 Acessibilidade

- ✓ ARIA labels em inputs
- ✓ Keyboard navigation (Tab, Enter, Escape)
- ✓ Focus management
- ✓ Semantic HTML
- ✓ Color contrast ratio ≥ 4.5:1
- ✓ Alt text em imagens
- ✓ Screen reader support

### 8.5 SEO (Landing Page)

- ✓ Meta tags dinâmicas
- ✓ Open Graph tags
- ✓ Sitemap.xml
- ✓ Robots.txt
- ✓ Canonical URLs
- ✓ Structured data (schema.org)

---

## 9. STACK TECNOLÓGICO

```
Frontend:
├── Next.js 16.1.1+                # Framework React/SSR (Turbopack default)
├── React 19.2+                    # UI Library + Compiler stable
├── TypeScript 5+                  # Type Safety
├── TailwindCSS 4+                 # Styling
├── shadcn/ui                      # Component Library
└── Lucide React                   # Icons

State & Data:
├── @tanstack/react-query          # Server State
├── Zustand (opcional)             # Client State
├── React Hook Form                # Form Management
└── Zod                            # Validation

Utilities:
├── next-auth                      # Authentication
├── next-themes                    # Theme Management
├── axios                          # HTTP Client
├── date-fns                       # Date utilities
├── lodash-es                      # Utility functions
└── clsx/classnames                # Class merging

Charts & Visualization:
├── Nivo                           # Advanced Charts
├── Recharts (alternativa)         # Simple Charts
└── Heatmap.js                     # Heatmap

Real-time:
├── Socket.io (alternativa)        # WebSocket
└── Pusher (alternativa)           # Pub/Sub

Dev Tools:
├── ESLint                         # Linting
├── Prettier                       # Formatting
├── Vitest                         # Unit Testing
└── Playwright                     # E2E Testing
```

---

## 10. MATRIZ DE RESPONSABILIDADES

| Módulo | Prioridade | Complexidade | Timeframe |
|--------|-----------|--------------|-----------|
| Dashboard | P0 | Média | Sprint 1 |
| Users CRUD | P0 | Média | Sprint 1 |
| Orgs CRUD | P0 | Média | Sprint 1 |
| Auth/2FA | P0 | Alta | Sprint 1 |
| Sidebar/Header | P0 | Baixa | Sprint 1 |
| Permissions/Roles | P1 | Alta | Sprint 2 |
| Integrations | P1 | Alta | Sprint 2 |
| Audit Logs | P1 | Média | Sprint 2 |
| Settings | P1 | Média | Sprint 2 |
| Analytics | P2 | Alta | Sprint 3 |
| Billing | P2 | Alta | Sprint 3 |
| API Keys | P2 | Média | Sprint 3 |

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Foundational (Sprint 1)
- [ ] Scaffold projeto Next.js com shadcn/ui
- [ ] Configurar Tailwind CSS
- [ ] Setup de providers (Auth, Query, Theme)
- [ ] Implementar Sidebar + Header
- [ ] Criar layout do dashboard
- [ ] Setup de autenticação
- [ ] Implementar página de login
- [ ] Criar dashboard home básico
- [ ] Implementar CRUD de usuários (tabela)
- [ ] Implementar CRUD de organizações

### Fase 2: Management (Sprint 2)
- [ ] Sistema de Roles & Permissions
- [ ] Página de Integrations
- [ ] Página de Audit Logs
- [ ] Settings sections
- [ ] Bulk actions
- [ ] Advanced filtering
- [ ] Dark mode completo

### Fase 3: Analytics & Polish (Sprint 3)
- [ ] Página de Analytics
- [ ] Gráficos e visualizações
- [ ] Billing management
- [ ] API Keys manager
- [ ] Performance optimization
- [ ] Testes unitários
- [ ] Testes E2E

---

## 12. REFERÊNCIAS E INSPIRAÇÕES

**Padrões do whatrack**:
- SidebarProvider pattern
- HeaderActions context
- DataTable reusável
- QueryKey conventions
- Zod validation schemas
- Responsive components

**Best Practices**:
- Atomic design principles
- DRY (Don't Repeat Yourself)
- Single Responsibility Principle
- Type safety first
- Mobile-first responsiveness
- Dark mode support

---

**Versão**: 1.0
**Última Atualização**: 2025-12-29
**Status**: Pronto para Implementação
