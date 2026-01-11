# PRD: Refatoração e Padronização da Área Administrativa (v2.0)

**Projeto:** Kadernim - Educational SaaS Platform
**Área:** Admin Section (`src/app/admin/*`)
**Data:** 2026-01-10
**Versão:** 2.0 - SIMPLIFICADA
**Autor:** Análise Técnica Completa

---

## 📋 Executive Summary

Este documento define os requisitos e roadmap **SIMPLIFICADO** para padronizar, otimizar e melhorar a área administrativa do Kadernim. Foco em **ajustes básicos essenciais**, sem melhorias complexas.

### Principais Mudanças na v2.0:
- ❌ **Remover** `/admin/templates/page.tsx` (hub)
- ❌ **Remover** mode switching de Automations (criar página separada para logs)
- ❌ **Não adicionar** tabs ao CrudPageShell
- ✅ **Focar** em componentes compartilhados básicos
- ✅ **Padronizar** cores via `globals.css`
- ✅ **Atualizar** skeletons para todas as mudanças
- ✅ **Permission guards** apenas na ÚLTIMA etapa (após tudo)

---

## 🎯 Escopo Revisado

### O Que Vamos Fazer:

1. **Criar 3 componentes compartilhados:**
   - `PreviewDialog` (email/push/whatsapp variants)
   - `FilterButton` (dropdown padronizado)
   - `ColumnToggle` (visibilidade de colunas)

2. **Deletar página:**
   - `/admin/templates/page.tsx` (hub desnecessário)

3. **Separar Automations:**
   - `/admin/automations/page.tsx` → apenas CRUD de rules
   - `/admin/automations/analytics/page.tsx` → nova página para analytics (área de dashboards)

4. **Migrar páginas para CRUD padrão:**
   - Resources → usar `CrudListView` + `CrudCardView`
   - Email Templates → usar componentes compartilhados
   - Push Templates → usar componentes compartilhados
   - WhatsApp Templates → usar componentes compartilhados

5. **Padronizar cores:**
   - Usar variáveis CSS de `globals.css`
   - Adicionar novas cores se necessário

6. **Atualizar skeletons:**
   - Garantir que loading states reflitam as mudanças

7. **Permission Guards (ÚLTIMA ETAPA):**
   - Adicionar apenas após Fase 3 completa

### O Que NÃO Vamos Fazer agora:

- ❌ Tabs no CrudPageShell
- ❌ Bulk actions
- ❌ Column sorting
- ❌ Export functionality
- ❌ Real-time sync
- ❌ Melhorias complexas

---

## 🎨 Cores Padronizadas (globals.css)

### Cores Semânticas Existentes:

```css
/* Light Theme */
--success: oklch(0.72 0.19 145);           /* #22C55E - Verde */
--success-foreground: oklch(1 0 0);        /* Branco */

--warning: oklch(0.80 0.16 85);            /* #F59E0B - Amarelo */
--warning-foreground: oklch(0.15 0.03 50); /* Texto escuro */

--info: oklch(0.65 0.18 255);              /* #3B82F6 - Azul */
--info-foreground: oklch(1 0 0);           /* Branco */

--destructive: oklch(0.60 0.22 25);        /* #EF4444 - Vermelho */
--destructive-foreground: oklch(1 0 0);    /* Branco */
```

### Novas Cores a Adicionar (se necessário):

```css
/* Adicionar em globals.css se precisar */

/* Badge variants - adicionar após linha 268 (antes do .dark) */
--badge-neutral: oklch(0.90 0.01 250);
--badge-neutral-foreground: oklch(0.42 0.02 250);

--badge-active: oklch(0.72 0.19 145 / 0.1);
--badge-active-foreground: oklch(0.40 0.19 145);

--badge-pending: oklch(0.80 0.16 85 / 0.1);
--badge-pending-foreground: oklch(0.45 0.16 85);

--badge-error: oklch(0.60 0.22 25 / 0.1);
--badge-error-foreground: oklch(0.60 0.22 25);
```

### Padrão de Uso:

**Antes (inconsistente):**
```tsx
className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
className="bg-amber-500/10 text-amber-600 border-amber-500/20"
className="bg-slate-500/10 text-slate-600 border-slate-500/20"
```

**Depois (padronizado):**
```tsx
className="bg-success/10 text-success border-success/20"
className="bg-warning/10 text-warning border-warning/20"
className="bg-muted text-muted-foreground border-border"
```

---

## 📐 Padding e Espaçamento

### Análise Atual:

#### Layout Principal:
```tsx
// src/app/admin/layout.tsx (linha 44)
<main className="flex-1 overflow-y-auto p-6">
```
- **Desktop:** `p-6` (24px)
- **Mobile:** `p-6` (24px)

#### CrudPageShell Header:
```tsx
// Desktop Header (linha 96)
<div className="flex flex-col gap-2 px-6 py-4 ...">

// Mobile Header (linha 142)
<div className="flex flex-col gap-3 p-4 border-b bg-background">
```
- **Desktop:** `px-6 py-4`
- **Mobile:** `p-4`

#### Toolbar:
```tsx
// Linha 119
<div className="flex flex-col gap-4 py-3 ... px-6 ...">
```
- **Desktop:** `px-6 py-3`

#### Área de Conteúdo (dentro do scroll):
```tsx
// Linha 184-186
<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
```
- **Sem padding próprio** - depende dos filhos

#### Paginação (Footer):
```tsx
// Linha 204
<div className="border-t border-border bg-background py-2 shrink-0 px-6 h-14 ...">
```
- **Desktop/Mobile:** `px-6 py-2`

#### Páginas Admin (Resources, exemplo linha 294):
```tsx
<div className="p-4 md:p-6 pb-20">
```
- **Mobile:** `p-4 pb-20`
- **Desktop:** `p-6 pb-20`

### ⚠️ Problema Identificado:

**Padding duplicado:**
```
Layout (p-6)
  └─ CrudPageShell
       └─ Header (px-6)
       └─ Toolbar (px-6)
       └─ Content (sem padding)
            └─ Página adiciona (p-4 md:p-6 pb-20) ❌ DUPLICADO
       └─ Footer (px-6)
```

**Resultado:** Content area tem padding duplicado (`p-6` do layout + `p-6` da página)

### ✅ Solução:

#### Opção 1: Remover padding do layout (RECOMENDADO)
```tsx
// src/app/admin/layout.tsx
<main className="flex-1 overflow-y-auto">
  {/* Sem p-6 */}
</main>
```

Cada página gerencia seu próprio padding via `CrudPageShell`.

#### Opção 2: Páginas não adicionam padding extra
```tsx
// Páginas admin
<CrudPageShell ...>
  {/* Sem wrapper com p-4 md:p-6 */}
  <CrudDataView ... />
</CrudPageShell>
```

**Decisão:** Opção 1 - Remover `p-6` do layout principal.

### Novo Padrão:

```tsx
// CrudPageShell já tem px-6 no header/toolbar/footer
// Content area não tem padding lateral
// Páginas adicionam padding ao conteúdo:

<div className="p-4 md:p-6 pb-20">
  <CrudDataView ... />
</div>
```

**Consistência:**
- Mobile: `p-4 pb-20`
- Desktop: `p-6 pb-20`
- Bottom: `pb-20` (espaço para FAB button)

---

## 🏗️ Componentes a Criar

### 1. PreviewDialog 🆕

**Arquivo:** `src/components/admin/shared/preview-dialog.tsx`

**Props:**
```tsx
interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: 'email' | 'push' | 'whatsapp'
  template: {
    id: string
    name: string
    subject?: string
    body: string
    from?: string
    to?: string
    // ... outros campos específicos
  }
}
```

**Uso:**
```tsx
<PreviewDialog
  open={!!previewTemplate}
  onOpenChange={(open) => !open && setPreviewTemplate(null)}
  variant="email"
  template={previewTemplate}
/>
```

**Features:**
- Mobile-responsive (max-w-md em mobile, max-w-2xl em desktop)
- Variants para cada tipo de template
- Close button
- Scroll interno se conteúdo grande

**Substituirá:**
- Email Templates preview (linhas 438-491)
- Push Templates preview (linhas 477-513)
- WhatsApp Templates preview (linhas 414-458)
- Templates Hub preview (linhas 421-449)

---

### 2. FilterButton 🆕

**Arquivo:** `src/components/admin/shared/filter-button.tsx`

**Props:**
```tsx
interface FilterButtonProps {
  label: string
  icon: LucideIcon
  value: string
  options: Array<{
    value: string
    label: string
  }>
  onChange: (value: string) => void
}
```

**Uso:**
```tsx
<FilterButton
  label="Cargo"
  icon={Shield}
  value={role}
  options={ROLE_OPTIONS}
  onChange={setRole}
/>
```

**Features:**
- DropdownMenu com badge mostrando valor atual
- Checkmark no item selecionado
- Estilo consistente: `h-8 gap-1.5 border-dashed text-xs`
- Badge secondary com valor

**Substituirá:**
- Users page filtros (linhas 186-237)
- Resources page filtros (linhas 135-202)
- Automations filtros (adaptado)

---

### 3. ColumnToggle 🆕

**Arquivo:** `src/components/admin/shared/column-toggle.tsx`

**Props:**
```tsx
interface ColumnToggleProps {
  columns: Array<{
    id: string
    label: string
    visible: boolean
  }>
  onChange: (columnId: string, visible: boolean) => void
}
```

**Uso:**
```tsx
<ColumnToggle
  columns={columns}
  onChange={(id, visible) => {
    setColumns(cols => cols.map(c =>
      c.id === id ? { ...c, visible } : c
    ))
  }}
/>
```

**Features:**
- DropdownMenu com checkboxes
- Ícone: SlidersHorizontal
- Label: "Colunas"
- Persiste estado no localStorage (opcional)

**Substituirá:**
- Resources page column toggle (linhas 273-291)

---

### 4. BadgeVariants Helper 🆕

**Arquivo:** `src/lib/utils/badge-variants.ts`

```tsx
export const badgeVariants = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
} as const

export function getBadgeVariant(type: keyof typeof badgeVariants) {
  return badgeVariants[type]
}

// Status-specific helpers
export const statusBadgeMap = {
  SENT: 'success',
  SENDING: 'info',
  SCHEDULED: 'warning',
  DRAFT: 'neutral',
  FAILED: 'error',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  PENDING: 'warning',
} as const

export function getStatusBadge(status: string) {
  const type = statusBadgeMap[status as keyof typeof statusBadgeMap] || 'neutral'
  return badgeVariants[type]
}

// Role-specific helpers
export const roleBadgeMap = {
  admin: 'warning',
  subscriber: 'success',
  editor: 'info',
  manager: 'primary',
  user: 'neutral',
} as const

export function getRoleBadge(role: string) {
  const type = roleBadgeMap[role as keyof typeof roleBadgeMap] || 'neutral'
  return badgeVariants[type]
}
```

**Uso:**
```tsx
import { getStatusBadge, getRoleBadge } from '@/lib/utils/badge-variants'

<Badge variant="outline" className={getStatusBadge('SENT')}>
  Enviado
</Badge>

<Badge variant="outline" className={getRoleBadge('admin')}>
  Admin
</Badge>
```

---

## 📱 Skeletons

### Páginas que Precisam de Skeletons Atualizados:

1. **Resources** - Após migração para CrudListView/CardView
2. **Templates** (Email/Push/WhatsApp) - Após usar componentes compartilhados
3. **Automations** - Após separação em 2 páginas
4. **Automations Logs** (nova página) - Criar skeleton

### Padrão de Skeleton:

**Para Table View:**
```tsx
<div className="space-y-2">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
  ))}
</div>
```

**Para Card View:**
```tsx
<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="h-32 bg-muted/30 rounded-xl animate-pulse" />
  ))}
</div>
```

**Onde adicionar:**
- Dentro do `<CrudDataView>` quando `isLoading={true}`
- Manter consistente com o grid layout real

---

## 🗑️ O Que Deletar

### 1. Templates Hub (`/admin/templates/page.tsx`)

**Razão:** Desnecessário - temos 3 páginas separadas.

**Ações:**
- [ ] Deletar arquivo: `src/app/admin/templates/page.tsx`
- [ ] Atualizar navegação no sidebar (remover link)
- [ ] Redirecionar `/admin/templates` → `/admin/templates/email` (opcional)

### 2. Mode Switching em Automations

**Razão:** Logs devem ser página separada na área de dashboards.

**Ações:**
- [ ] Remover mode state de `/admin/automations/page.tsx`
- [ ] Remover lógica de tabs/switching
- [ ] Remover componente de logs table
- [ ] Criar nova página: `/admin/automations/logs/page.tsx`

---

## 🚀 Roadmap Simplificado

### **Fase 1: Componentes Compartilhados** (Semana 1)

#### 1.1 Criar PreviewDialog (2 dias)
- [ ] Criar componente base
- [ ] Implementar variant 'email' (com iframe)
- [ ] Implementar variant 'push' (mobile mockup)
- [ ] Implementar variant 'whatsapp' (chat mockup)
- [ ] Mobile-responsive
- [ ] Testar isoladamente

#### 1.2 Criar FilterButton (1 dia)
- [ ] Criar componente
- [ ] Estilizar com padrão consistente
- [ ] Testar com diferentes options
- [ ] Documentar uso

#### 1.3 Criar ColumnToggle (1 dia)
- [ ] Criar componente
- [ ] Implementar DropdownMenu com checkboxes
- [ ] Adicionar persist em localStorage (opcional)
- [ ] Testar

#### 1.4 Criar BadgeVariants Helper (1 dia)
- [ ] Criar arquivo `badge-variants.ts`
- [ ] Adicionar cores no `globals.css` se necessário
- [ ] Implementar helpers (getStatusBadge, getRoleBadge)
- [ ] Documentar uso

**Entregáveis:**
- ✅ 4 componentes/helpers novos
- ✅ Código testado e documentado
- ✅ Cores padronizadas

---

### **Fase 2: Limpeza e Separação** (Semana 2)

#### 2.1 Deletar Templates Hub (0.5 dia)
- [ ] Deletar `src/app/admin/templates/page.tsx`
- [ ] Atualizar sidebar navigation
- [ ] Testar rotas

#### 2.2 Separar Automations (1.5 dias)
- [ ] Criar `/admin/automations/logs/page.tsx`
- [ ] Mover lógica de logs para nova página
- [ ] Simplificar `/admin/automations/page.tsx` (apenas rules CRUD)
- [ ] Atualizar navigation
- [ ] Criar skeleton para logs page

#### 2.3 Ajustar Padding Global (0.5 dia)
- [ ] Remover `p-6` de `src/app/admin/layout.tsx`
- [ ] Verificar todas as páginas admin
- [ ] Garantir `p-4 md:p-6 pb-20` em content areas
- [ ] Testar responsividade

**Entregáveis:**
- ✅ Templates Hub deletado
- ✅ Automations separado em 2 páginas
- ✅ Padding consistente

---

### **Fase 3: Migração de Páginas** (Semana 3-4)

#### 3.1 Migrar Resources (2 dias)
- [ ] Remover `ResourcesTableView` e `ResourcesCardView`
- [ ] Criar `resourceColumns` para `CrudListView`
- [ ] Criar `ResourceCard` render function
- [ ] Substituir filtros por `FilterButton`
- [ ] Adicionar `ColumnToggle`
- [ ] Substituir badges por helpers
- [ ] Atualizar skeleton
- [ ] Testar table e card views
- [ ] Testar mobile

#### 3.2 Migrar Email Templates (1.5 dias)
- [ ] Substituir delete dialog por `DeleteConfirmDialog`
- [ ] Substituir preview por `PreviewDialog` variant='email'
- [ ] Substituir badges por helpers
- [ ] Atualizar skeleton
- [ ] Testar

#### 3.3 Migrar Push Templates (1.5 dias)
- [ ] Substituir delete dialog por `DeleteConfirmDialog`
- [ ] Substituir preview por `PreviewDialog` variant='push'
- [ ] Substituir badges por helpers
- [ ] Atualizar skeleton
- [ ] Testar

#### 3.4 Migrar WhatsApp Templates (1.5 dias)
- [ ] Substituir delete dialog por `DeleteConfirmDialog`
- [ ] Substituir preview por `PreviewDialog` variant='whatsapp'
- [ ] Remover FAB hardcoded (usar CrudPageShell)
- [ ] Substituir badges por helpers
- [ ] Atualizar skeleton
- [ ] Testar

#### 3.5 Otimizar LLM Usage (1 dia)
- [ ] Mudar `pb-10` → `pb-20`
- [ ] Adicionar `useMemo` para chart data
- [ ] Verificar padding consistency
- [ ] Atualizar skeleton (se necessário)

**Entregáveis:**
- ✅ 5 páginas migradas
- ✅ Componentes compartilhados em uso
- ✅ Skeletons atualizados
- ✅ Tudo testado

---

### **Fase 4: Permission Guards** (Semana 5)

**⚠️ APENAS APÓS FASE 3 COMPLETA**

#### 4.1 Adicionar Permission Guards (3 dias)
- [ ] Resources page
- [ ] Email Templates
- [ ] Push Templates
- [ ] WhatsApp Templates
- [ ] Campaigns
- [ ] Automations
- [ ] Automations Logs (nova)
- [ ] LLM Usage

**Padrão:**
```tsx
<PermissionGuard action="update" subject="Resource">
  <Button onClick={handleEdit}>
    <Edit3 className="h-4 w-4" />
  </Button>
</PermissionGuard>
```

**Ações por Subject:**
- `create:{subject}`
- `update:{subject}`
- `delete:{subject}`
- `read:{subject}` (para export, se houver)

#### 4.2 Testes de Permissão (2 dias)
- [ ] Testar cada ação com diferentes roles
- [ ] Verificar que botões aparecem/desaparecem corretamente
- [ ] Testar edge cases
- [ ] Documentar permissões necessárias

**Entregáveis:**
- ✅ Todas as páginas com permission guards
- ✅ Testes de permissão passando
- ✅ Documentação de permissões

---

## 📊 Estrutura de Páginas Final

### Antes:
```
/admin
  ├─ page.tsx (dashboard) ✅
  ├─ users/page.tsx ✅
  ├─ subjects/page.tsx ✅
  ├─ resources/page.tsx ⚠️
  ├─ campaigns/page.tsx ⚠️
  ├─ templates/page.tsx ❌ DELETAR
  │   ├─ email/page.tsx ⚠️
  │   ├─ push/page.tsx ⚠️
  │   └─ whatsapp/page.tsx ⚠️
  ├─ automations/page.tsx ⚠️ (rules + logs)
  └─ llm-usage/page.tsx ⚠️
```

### Depois:
```
/admin
  ├─ page.tsx (dashboard) ✅
  ├─ users/page.tsx ✅
  ├─ subjects/page.tsx ✅
  ├─ resources/page.tsx ✅ MIGRADO
  ├─ campaigns/page.tsx ✅ PERMISSION GUARDS
  ├─ templates/
  │   ├─ email/page.tsx ✅ MIGRADO
  │   ├─ push/page.tsx ✅ MIGRADO
  │   └─ whatsapp/page.tsx ✅ MIGRADO
  ├─ automations/
  │   ├─ page.tsx ✅ APENAS RULES
  │   └─ logs/page.tsx ✅ NOVA (dashboard area)
  └─ llm-usage/page.tsx ✅ OTIMIZADO
```

---

## ✅ Checklist de Implementação

### Fase 1: Componentes Compartilhados
- [ ] PreviewDialog component
  - [ ] Variant 'email'
  - [ ] Variant 'push'
  - [ ] Variant 'whatsapp'
  - [ ] Mobile-responsive
- [ ] FilterButton component
- [ ] ColumnToggle component
- [ ] BadgeVariants helper
  - [ ] Adicionar cores em globals.css (se necessário)
  - [ ] getStatusBadge()
  - [ ] getRoleBadge()

### Fase 2: Limpeza e Separação
- [ ] Deletar Templates Hub
  - [ ] Deletar arquivo
  - [ ] Atualizar navigation
- [ ] Separar Automations
  - [ ] Criar /logs/page.tsx
  - [ ] Simplificar /page.tsx
  - [ ] Atualizar navigation
  - [ ] Criar skeletons
- [ ] Ajustar padding global
  - [ ] Remover p-6 do layout
  - [ ] Verificar todas as páginas

### Fase 3: Migração de Páginas
- [ ] Resources
  - [ ] CrudListView + CrudCardView
  - [ ] FilterButton
  - [ ] ColumnToggle
  - [ ] Badge helpers
  - [ ] Skeleton
- [ ] Email Templates
  - [ ] DeleteConfirmDialog
  - [ ] PreviewDialog
  - [ ] Badge helpers
  - [ ] Skeleton
- [ ] Push Templates
  - [ ] DeleteConfirmDialog
  - [ ] PreviewDialog
  - [ ] Badge helpers
  - [ ] Skeleton
- [ ] WhatsApp Templates
  - [ ] DeleteConfirmDialog
  - [ ] PreviewDialog
  - [ ] Remover FAB hardcoded
  - [ ] Badge helpers
  - [ ] Skeleton
- [ ] LLM Usage
  - [ ] Ajustar pb-20
  - [ ] Memoizar charts
  - [ ] Verificar padding

### Fase 4: Permission Guards (ÚLTIMA ETAPA)
- [ ] Resources
- [ ] Email Templates
- [ ] Push Templates
- [ ] WhatsApp Templates
- [ ] Campaigns
- [ ] Automations (rules)
- [ ] Automations Logs
- [ ] LLM Usage
- [ ] Testes de permissão

---

## 📏 Padrões de Código

### Imports Padrão:
```tsx
'use client'

import React, { useState } from 'react'
import { LucideIcon } from 'lucide-react'
import { CrudPageShell } from '@/components/admin/crud/crud-page-shell'
import { CrudDataView } from '@/components/admin/crud/crud-data-view'
import { CrudListView } from '@/components/admin/crud/crud-list-view'
import { CrudCardView } from '@/components/admin/crud/crud-card-view'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'
import { PreviewDialog } from '@/components/admin/shared/preview-dialog'
import { FilterButton } from '@/components/admin/shared/filter-button'
import { useDataTable } from '@/hooks/use-data-table'
import { useBreakpoint } from '@/hooks/use-breakpoint'
import { getStatusBadge } from '@/lib/utils/badge-variants'
```

### Estrutura de Página:
```tsx
export default function AdminResourcesPage() {
  const { isMobile } = useBreakpoint()
  const crud = useDataTable<Resource>({
    queryKey: ['admin-resources'],
    endpoint: '/api/v1/admin/resources'
  })

  // State local
  const [filter, setFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Handlers
  const handleDelete = async () => {
    // ...
  }

  // Render
  return (
    <>
      <CrudPageShell
        title="Recursos"
        icon={BookOpen}
        view={crud.view}
        setView={crud.setView}
        searchInput={crud.searchInput}
        onSearchChange={crud.setSearchInput}
        // ... outros props
        filters={
          <FilterButton
            label="Status"
            icon={Filter}
            value={filter}
            options={OPTIONS}
            onChange={setFilter}
          />
        }
      >
        <div className="p-4 md:p-6 pb-20">
          <CrudDataView
            data={crud.data}
            view={crud.view}
            tableView={<CrudListView ... />}
            cardView={<CrudCardView ... />}
          />
        </div>
      </CrudPageShell>

      <DeleteConfirmDialog ... />
    </>
  )
}
```

### Badges:
```tsx
import { getStatusBadge, getRoleBadge } from '@/lib/utils/badge-variants'

<Badge variant="outline" className={getStatusBadge(status)}>
  {status}
</Badge>
```

### Colors:
```tsx
// NÃO fazer:
className="bg-emerald-500/10 text-emerald-600"

// FAZER:
className="bg-success/10 text-success"
className="bg-warning/10 text-warning"
className="bg-destructive/10 text-destructive"
```

---

## 📚 Referências

### Componentes CRUD:
- `CrudPageShell`: `/src/components/admin/crud/crud-page-shell.tsx`
- `CrudDataView`: `/src/components/admin/crud/crud-data-view.tsx`
- `CrudListView`: `/src/components/admin/crud/crud-list-view.tsx`
- `CrudCardView`: `/src/components/admin/crud/crud-card-view.tsx`
- `DeleteConfirmDialog`: `/src/components/admin/crud/delete-confirm-dialog.tsx`

### Novos Componentes:
- `PreviewDialog`: `/src/components/admin/shared/preview-dialog.tsx` (CRIAR)
- `FilterButton`: `/src/components/admin/shared/filter-button.tsx` (CRIAR)
- `ColumnToggle`: `/src/components/admin/shared/column-toggle.tsx` (CRIAR)

### Helpers:
- `badge-variants`: `/src/lib/utils/badge-variants.ts` (CRIAR)
- `useDataTable`: `/src/hooks/use-data-table.ts`
- `useBreakpoint`: `/src/hooks/use-breakpoint.ts`

### Páginas de Referência:
- Subjects: `/src/app/admin/subjects/page.tsx` ✅ Best practice
- Users: `/src/app/admin/users/page.tsx` ✅ Best practice
- Campaigns: `/src/app/admin/campaigns/page.tsx` ✅ Best practice

### Páginas a Migrar:
- Resources: `/src/app/admin/resources/page.tsx`
- Email Templates: `/src/app/admin/templates/email/page.tsx`
- Push Templates: `/src/app/admin/templates/push/page.tsx`
- WhatsApp Templates: `/src/app/admin/templates/whatsapp/page.tsx`
- Automations: `/src/app/admin/automations/page.tsx`
- LLM Usage: `/src/app/admin/llm-usage/page.tsx`

### Páginas a Criar:
- Automations Logs: `/src/app/admin/automations/logs/page.tsx` (NOVA)

### Páginas a Deletar:
- Templates Hub: `/src/app/admin/templates/page.tsx` ❌ DELETAR

---

## 📊 Métricas de Sucesso

### Redução de Código:

| Métrica | Antes | Depois | Redução |
|---------|-------|--------|---------|
| Delete dialogs custom | 4 | 0 | 100% |
| Preview dialogs custom | 4 | 0 | 100% |
| Filter implementations | 3 | 0 | 100% |
| Badge helpers duplicados | 5+ | 1 | 80% |
| Páginas totais | 11 | 10 | -1 |

### Cobertura de Features:

| Feature | Antes | Depois |
|---------|-------|--------|
| CRUD Components corretos | 30% | 100% |
| Componentes compartilhados | 0% | 100% |
| Padding consistente | 40% | 100% |
| Cores padronizadas | 30% | 100% |
| Skeletons atualizados | 80% | 100% |
| Permission Guards | 30% | 100% |

---

## 🎯 Cronograma

**Total:** 5 semanas

- **Semana 1:** Fase 1 - Componentes Compartilhados
- **Semana 2:** Fase 2 - Limpeza e Separação
- **Semana 3-4:** Fase 3 - Migração de Páginas
- **Semana 5:** Fase 4 - Permission Guards

**Desenvolvedores:** 1-2
**Complexidade:** Média
**Risco:** Baixo (mudanças incrementais)

---

## ✅ Conclusão

Este PRD v2.0 foca em **refatorações essenciais** sem over-engineering:

### Princípios:
1. ✅ **Simplificar** - Remover complexidade desnecessária
2. ✅ **Padronizar** - Componentes compartilhados e cores consistentes
3. ✅ **Organizar** - Estrutura clara de páginas
4. ✅ **Segurança** - Permission guards (por último)

### Resultados Esperados:
- ✅ Código 50% mais limpo
- ✅ UX 100% consistente
- ✅ Mobile 100% funcional
- ✅ Manutenção 70% mais fácil

---

**Próximos Passos:**
1. ✅ Aprovar este PRD
2. ✅ Começar Fase 1 - Criar componentes compartilhados
3. ✅ Code review incremental
4. ✅ Deploy gradual com testes

**Status:** PRONTO PARA IMPLEMENTAÇÃO 🚀
