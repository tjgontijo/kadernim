# Quick Reference - Frontend Kadernim

Guia rápido de referência para desenvolvimento

---

## 📁 ESTRUTURA DE PASTAS RÁPIDA

```
src/
├── app/
│   ├── (auth)/ → signin, signup, forgot-password
│   ├── dashboard/ → layout principal + páginas
│   │   ├── /users
│   │   ├── /organizations
│   │   ├── /permissions
│   │   ├── /integrations
│   │   ├── /audit-logs
│   │   ├── /analytics
│   │   └── /settings
│   └── api/v1/ → endpoints REST
│
├── components/
│   ├── ui/ → 60+ componentes shadcn
│   ├── dashboard/
│   │   ├── /sidebar → navegação
│   │   ├── /header → breadcrumbs, ações
│   │   ├── /users → CRUD de usuários
│   │   ├── /organizations → CRUD orgs
│   │   └── ...
│   ├── forms/ → formulários genéricos
│   ├── data-table/ → tabelas reutilizáveis
│   └── providers/ → Auth, Query, Modal
│
├── hooks/ → custom hooks
├── lib/ → validations, auth, utils
├── server/ → server-side logic
└── styles/ → globals.css, variables
```

---

## 🎨 STACK TECNOLÓGICO

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 15+ (App Router) |
| **UI Library** | shadcn/ui (60+ components) |
| **Styling** | TailwindCSS 3+ |
| **Forms** | React Hook Form + Zod |
| **State** | React Query + Context API |
| **Theme** | next-themes (Light/Dark/System) |
| **Icons** | Lucide React |
| **Charts** | Nivo / Recharts |
| **Auth** | NextAuth + JWT |
| **HTTP** | Fetch / Axios |

---

## 🏗️ LAYOUT 3-CAMADAS

```
┌──────────────────────────────────────┐
│  HEADER (120px)                      │
│  [≡] Breadcrumbs | Actions | Avatar  │
├─────────────┬────────────────────────┤
│  SIDEBAR    │  MAIN CONTENT          │
│  (240px →   │  ┌────────────────────┐│
│  60px)      │  │ PageHeader          ││
│  Collapse   │  │ Filters/Actions     ││
│  Tooltip    │  │ Content             ││
│             │  │ (Table/Cards/...)   ││
│             │  └────────────────────┘│
├─────────────┴────────────────────────┤
│ Toast Notifications (bottom-center)  │
└──────────────────────────────────────┘
```

---

## 🧭 NAVEGAÇÃO SIDEBAR

```
🏢 PLATAFORMA
├── Dashboard
└── Relatórios

👥 ADMINISTRAÇÃO
├── Usuários
├── Organizações
├── Funções & Perms
└── Auditoria

🔌 INTEGRAÇÕES
└── Integrações

⚙️ CONFIGURAÇÕES
├── Minha Conta
├── Organização
├── Billing
├── Chaves API
└── Segurança

[Avatar] João Silva ▼ → Dropdown
```

---

## 📄 COMPONENTES PRINCIPAIS

### Sidebar
```typescript
// Server
sidebar.tsx               // Define items
navigationItems array     // Items com labels/icons
ICON_MAP                 // Map de ícones → Lucide

// Client
sidebar-client.tsx       // Interatividade
user-dropdown-menu.tsx   // Menu do usuário
```

### Header
```typescript
header.tsx              // Container principal
breadcrumbs.tsx         // Auto-generated breadcrumbs
header-actions.tsx      // Context para injetar ações
```

### Pages
```typescript
'use client'

HeaderActions { ... }      // Injetar ações no header
PageHeader { ... }         // Título + descrição
DataTableView { ... }      // Tabela + filtros
```

---

## 🔄 FLUXOS PRINCIPAIS

### 1️⃣ Criar/Editar Recurso
```
Dialog Open
  ↓
Form com Zod validation
  ↓
useMutation (POST/PATCH)
  ↓
Toast (sucesso/erro)
  ↓
Invalidar query
  ↓
Atualizar tabela + fechar dialog
```

### 2️⃣ Deletar Recurso
```
Clicar em Delete
  ↓
AlertDialog (confirmação)
  ↓
useMutation (DELETE)
  ↓
Invalidar query
  ↓
Toast + atualizar tabela
```

### 3️⃣ Filtrar Tabela
```
Usuário escolhe filtros
  ↓
setFilters(newFilters)
  ↓
useDataTable re-executa query
  ↓
Tabela atualiza com novos resultados
```

---

## 💾 QUERIES & MUTATIONS

### Query (Read)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['users', filters],
  queryFn: async () => {
    return apiClient<User[]>('/api/v1/users', { params: filters })
  },
})
```

### Mutation (Create/Update/Delete)
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    return apiClient('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Sucesso!')
  },
})
```

---

## ✅ VALIDAÇÃO

### Schema Zod
```typescript
const schema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  status: z.enum(['active', 'inactive']),
})

type FormInput = z.infer<typeof schema>
```

### Form
```typescript
const form = useForm<FormInput>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})

<FormField control={form.control} name="name" render={...} />
```

---

## 🎯 PADRÕES IMPORTANTES

### 1. Server-side Validation (layout.tsx)
```typescript
const session = await getCurrentSession()
if (!session) redirect('/sign-in')

const organizationId = await getCurrentOrganizationId()
const isComplete = await isOrganizationSetupComplete(organizationId)
```

### 2. Client-side Protection
```typescript
'use client'
const { data: session } = useAuth()
if (!session) return <UnauthorizedPage />
```

### 3. Sidebar Collapse
```typescript
const { open } = useSidebar()
// open = true (240px) ou false (60px)
// Icons + Labels quando open
// Só icons + tooltip quando closed
```

### 4. Dynamic Header Actions
```typescript
<HeaderActions>
  <Button onClick={...}>Ação</Button>
</HeaderActions>
// Renderiza automaticamente no header
// Limpa ao sair da página
```

### 5. Breadcrumbs Automáticos
```typescript
usePathname() → pathname string
Mapeamento em routeLabels → label amigável
Auto-render sem configuração adicional
```

---

## 🎪 MÓDULOS (In Priority Order)

### Priority 0 (Sprint 1)
- [ ] Auth Pages
- [ ] Dashboard Layout (Sidebar + Header)
- [ ] Dashboard Home
- [ ] Users CRUD
- [ ] Organizations CRUD

### Priority 1 (Sprint 2)
- [ ] Permissions/Roles
- [ ] Integrations
- [ ] Audit Logs
- [ ] Settings

### Priority 2 (Sprint 3)
- [ ] Analytics & Charts
- [ ] Billing
- [ ] API Keys

---

## 📊 TABELA GENÉRICA

```typescript
// Columns
const columns: ColumnDef<Resource>[] = [
  selectCheckbox(),    // Multi-select
  simpleColumn(),      // Name/Title
  statusBadge(),       // Status
  dateColumn(),        // Date formatted
  actionsMenu(),       // Edit/Delete dropdown
]

// Table
<DataTableView
  data={items}
  columns={columns}
  loading={isLoading}
  pagination={...}
  onPaginationChange={...}
  filters={filters}
  onFiltersChange={setFilters}
/>
```

---

## 🎨 COMPONENTES REUTILIZÁVEIS

### Cards
```typescript
<MetricsCard title="..." value={123} icon={...} trend={{...}} />
<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>
```

### Badges
```typescript
<StatusBadge status="active" />
<Badge variant="destructive">Error</Badge>
```

### Dialogs
```typescript
<Dialog><DialogContent><DialogHeader>...</DialogHeader></DialogContent></Dialog>
<AlertDialog><AlertDialogContent>Confirma?</AlertDialogContent></AlertDialog>
```

### Forms
```typescript
<FormField control={control} name="..." render={...} />
<Input /> <Textarea /> <Select /> <Checkbox /> <Switch />
```

---

## 🔒 SEGURANÇA CHECKLIST

- ✓ CSRF tokens em mutações
- ✓ XSS prevention (React escapa por padrão)
- ✓ Rate limiting (backend)
- ✓ Permission check (backend)
- ✓ Audit logging (todos os actions)
- ✓ HTTP-only cookies para auth
- ✓ Password hashing (backend)
- ✓ 2FA support
- ✓ Input validation (Zod)

---

## 🚀 PERFORMANCE TIPS

| Optimization | Method |
|-------------|--------|
| Code Splitting | Next.js App Router automático |
| Image Optimization | next/image component |
| Bundle Size | Remove unused deps |
| Cache | React Query staleTime |
| Rendering | Memoization onde necessário |
| Virtual Scrolling | Para 1000+ items |
| Pagination | Server-side limit/offset |
| Lazy Loading | dynamic() imports |

---

## 🌙 DARK MODE

```typescript
// Setup
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>

// Use
const { theme, setTheme } = useTheme()
setTheme('dark')

// CSS
@media (prefers-color-scheme: dark) { ... }
.dark { ... }
```

---

## 📱 RESPONSIVENESS

### Breakpoints
```
sm: 640px    (mobile default)
md: 768px    (tablet)
lg: 1024px   (sidebar appears)
xl: 1280px   (full desktop)
2xl: 1536px  (ultra-wide)
```

### Mobile-first Strategy
```
default: mobile styles
md: tablet adjustments
lg: desktop + sidebar
```

---

## 🧪 TESTES

### Setup
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

### Component Test
```typescript
test('renders button', () => {
  render(<Button>Click</Button>)
  expect(screen.getByText('Click')).toBeInTheDocument()
})
```

### Hook Test
```typescript
test('useDataTable returns correct state', () => {
  const { result } = renderHook(() => useDataTable({...}))
  expect(result.current.state.page).toBe(1)
})
```

---

## 📚 CHEAT SHEET - IMPORTS COMUNS

```typescript
// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

// Forms
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Data
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

// Navigation
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// Theme
import { useTheme } from 'next-themes'

// Sidebar
import { useSidebar } from '@/components/ui/sidebar'

// Auth
import { useSession } from '@/hooks/use-auth'

// Icons
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react'

// Utils
import { cn } from '@/lib/utils'
```

---

## 🎯 PRINCÍPIOS

1. **DRY** - Don't Repeat Yourself → Reuse components/hooks
2. **KISS** - Keep It Simple, Stupid → Avoid over-engineering
3. **YAGNI** - You Aren't Gonna Need It → Only build what's needed
4. **SRP** - Single Responsibility → One thing per component
5. **Type Safety** - Use TypeScript everywhere
6. **Server-side First** - Validation + Auth no server
7. **Mobile First** - Design mobile then expand

---

## 🐛 DEBUG TIPS

```typescript
// Query status
console.log(useQuery().status) // loading/success/error

// Form errors
console.log(form.formState.errors)

// Context value
const value = useContext(YourContext)
console.log(value)

// Theme
const { theme } = useTheme()
console.log(`Current theme: ${theme}`)

// React DevTools
// Extensions → React Query DevTools
// Components → Profiler
```

---

## 📖 DOCUMENTAÇÃO REFERÊNCIA

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- TailwindCSS: https://tailwindcss.com/docs
- React Query: https://tanstack.com/query/latest
- Zod: https://zod.dev
- React Hook Form: https://react-hook-form.com

---

## ✨ NEXT STEPS

1. Setup projeto Next.js + shadcn
2. Configurar Tailwind + theme
3. Implementar Auth pages
4. Criar Layout + Sidebar + Header
5. Implementar primeiro CRUD (Users)
6. Adicionar filtros e paginação
7. Setup de testing
8. Otimizar performance
9. Deploy

---

**Última atualização**: 2025-12-29
**Status**: Pronto para implementação ✨
