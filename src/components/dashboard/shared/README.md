# Admin Shared Components

Componentes compartilhados para páginas administrativas do Kadernim.

## 📦 Componentes Disponíveis

### 1. PreviewDialog

Dialog unificado para preview de templates (Email, Push, WhatsApp).

**Uso:**

```tsx
import { PreviewDialog } from '@/components/admin/shared'

<PreviewDialog
  open={!!previewTemplate}
  onOpenChange={(open) => !open && setPreviewTemplate(null)}
  variant="email" // ou 'push' | 'whatsapp'
  template={previewTemplate}
/>
```

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `open` | `boolean` | Controla visibilidade do dialog |
| `onOpenChange` | `(open: boolean) => void` | Callback quando estado muda |
| `variant` | `'email' \| 'push' \| 'whatsapp'` | Tipo de template |
| `template` | `Template \| null` | Dados do template |

**Template Types:**

```tsx
// Email
interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string // HTML
  preheader?: string | null
}

// Push
interface PushTemplate {
  id: string
  name: string
  title: string
  body: string
  icon?: string | null
  image?: string | null
  url?: string | null
  tag?: string | null
}

// WhatsApp
interface WhatsAppTemplate {
  id: string
  name: string
  slug: string
  body: string
  description?: string | null
}
```

---

### 2. FilterButton

Botão dropdown padronizado para filtros.

**Uso:**

```tsx
import { FilterButton } from '@/components/admin/shared'

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos os Cargos' },
  { value: 'user', label: 'Usuário' },
  { value: 'subscriber', label: 'Assinante' },
  { value: 'admin', label: 'Admin' },
]

<FilterButton
  label="Cargo"
  icon={Shield}
  value={role}
  options={ROLE_OPTIONS}
  onChange={setRole}
/>
```

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `label` | `string` | Label do filtro |
| `icon` | `LucideIcon` | Ícone do filtro |
| `value` | `string` | Valor atual selecionado |
| `options` | `FilterOption[]` | Opções disponíveis |
| `onChange` | `(value: string) => void` | Callback quando muda |

**FilterOption Type:**

```tsx
interface FilterOption {
  value: string
  label: string
}
```

---

### 3. ColumnToggle

Toggle de visibilidade de colunas para tabelas.

**Uso:**

```tsx
import { ColumnToggle } from '@/components/admin/shared'

const [columns, setColumns] = useState([
  { id: 'name', label: 'Nome', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'role', label: 'Cargo', visible: true },
  { id: 'createdAt', label: 'Criado em', visible: false },
])

<ColumnToggle
  columns={columns}
  onChange={(id, visible) => {
    setColumns(cols => cols.map(c =>
      c.id === id ? { ...c, visible } : c
    ))
  }}
/>
```

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `columns` | `Column[]` | Array de colunas |
| `onChange` | `(columnId: string, visible: boolean) => void` | Callback quando muda |

**Column Type:**

```tsx
interface Column {
  id: string
  label: string
  visible: boolean
}
```

---

## 🎨 Badge Variants Helper

Helpers para padronizar cores de badges usando `globals.css`.

**Uso:**

```tsx
import { getStatusBadge, getRoleBadge, getTemplateTypeBadge } from '@/lib/utils/badge-variants'

// Status badges
<Badge variant="outline" className={getStatusBadge('SENT')}>
  Enviado
</Badge>

<Badge variant="outline" className={getStatusBadge('PENDING')}>
  Pendente
</Badge>

// Role badges
<Badge variant="outline" className={getRoleBadge('admin')}>
  Admin
</Badge>

// Template type badges
<Badge variant="outline" className={getTemplateTypeBadge('email')}>
  Email
</Badge>
```

**Funções Disponíveis:**

| Função | Parâmetro | Retorno | Descrição |
|--------|-----------|---------|-----------|
| `getBadgeVariant(type)` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' \| 'primary' \| 'secondary'` | `string` | Retorna classes CSS |
| `getStatusBadge(status)` | `string` | `string` | Badge para status (SENT, PENDING, etc) |
| `getRoleBadge(role)` | `string` | `string` | Badge para roles (admin, user, etc) |
| `getTemplateTypeBadge(type)` | `string` | `string` | Badge para tipos de template |

**Status Suportados:**

- `SENT` → success (verde)
- `SENDING` → info (azul)
- `SCHEDULED` → warning (amarelo)
- `DRAFT` → neutral (cinza)
- `FAILED` → error (vermelho)
- `ACTIVE` → success
- `INACTIVE` → neutral
- `PENDING` → warning

**Roles Suportados:**

- `admin` → warning (amarelo)
- `subscriber` → success (verde)
- `editor` → info (azul)
- `manager` → primary (azul primário)
- `user` → neutral (cinza)

---

## 🎯 Padrões de Uso

### Cores Consistentes

**❌ Não fazer:**
```tsx
className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
```

**✅ Fazer:**
```tsx
className={getStatusBadge('ACTIVE')} // usa bg-success/10 text-success border-success/20
```

### Import Centralizado

```tsx
// Componentes
import { PreviewDialog, FilterButton, ColumnToggle } from '@/components/admin/shared'

// Helpers
import { getStatusBadge, getRoleBadge } from '@/lib/utils/badge-variants'
```

---

## 📱 Responsividade

Todos os componentes são mobile-responsive:

- **PreviewDialog**:
  - Email: `max-w-4xl` em desktop, ajusta em mobile
  - Push/WhatsApp: `max-w-md` (ótimo para mobile)

- **FilterButton**: Compacto (`h-8`) para caber em toolbars mobile

- **ColumnToggle**: Dropdown que funciona bem em touch

---

## 🔧 Manutenção

### Adicionar Nova Cor

Se precisar de nova cor, adicione em `globals.css`:

```css
/* Em :root (light) e .dark */
--new-color: oklch(...);
--new-color-foreground: oklch(...);
```

Depois adicione em `badge-variants.ts`:

```tsx
export const badgeVariants = {
  // ... existentes
  newColor: 'bg-newColor/10 text-newColor border-newColor/20',
}
```

### Adicionar Novo Status

```tsx
// Em badge-variants.ts
export const statusBadgeMap = {
  // ... existentes
  NEW_STATUS: 'success', // ou outro tipo
}
```

---

## ✅ Checklist de Migração

Ao migrar uma página para usar estes componentes:

- [ ] Substituir preview dialog custom por `PreviewDialog`
- [ ] Substituir filtros dropdown por `FilterButton`
- [ ] Substituir column toggle (se houver) por `ColumnToggle`
- [ ] Substituir badges hardcoded por helpers (`getStatusBadge`, `getRoleBadge`)
- [ ] Remover imports de componentes antigos
- [ ] Testar em mobile
- [ ] Atualizar skeletons (se necessário)
