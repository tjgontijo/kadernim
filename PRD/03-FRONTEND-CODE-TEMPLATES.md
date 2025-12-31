# Code Templates & Boilerplates

Snippets prontos para copiar/colar durante a implementação

---

## 1. ESTRUTURA BÁSICA DE PÁGINA

### 1.1 Page com Tabela + Filtros

```typescript
// app/dashboard/[resource]/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HeaderActions } from '@/components/dashboard/header-actions'
import { PageHeader } from '@/components/data-table/page-header'
import { DataTableView } from '@/components/data-table/data-table-view'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface FiltersType {
  search?: string
  status?: string
  organizationId?: string
  page?: number
  limit?: number
}

export default function ResourcePage() {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<FiltersType>({ page: 1, limit: 20 })
  // NOTE: Para Next.js 16 com route params dinâmicos, use:
  // export default async function ResourcePage(props: { params: Promise<{ id: string }> }) {
  //   const { id } = await props.params

  const { data, isLoading, error } = useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.entries(filters).reduce(
          (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
          {}
        )
      )
      const response = await fetch(`/api/v1/resources?${params}`)
      if (!response.ok) throw new Error('Failed to fetch resources')
      return response.json()
    },
  })

  return (
    <>
      <HeaderActions>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo
        </Button>
      </HeaderActions>

      <div className="space-y-6">
        <PageHeader
          title="Recursos"
          description="Gerencie seus recursos aqui"
        />

        <DataTableView
          data={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          error={error?.message}
          pagination={{
            page: filters.page ?? 1,
            pageSize: filters.limit ?? 20,
            total: data?.total ?? 0,
          }}
          onPaginationChange={(page, pageSize) => {
            setFilters(prev => ({ ...prev, page, limit: pageSize }))
          }}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Dialog/Sheet para criar/editar */}
      {/* <ResourceFormDialog open={open} onOpenChange={setOpen} /> */}
    </>
  )
}

// Column definitions
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

type Resource = {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt: string
}

export const columns: ColumnDef<Resource>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt') as string)
      return date.toLocaleDateString('pt-BR')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const resource = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {/* edit */}}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {/* delete */}} className="text-red-600">
              Deletar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

---

## 2. FORMULÁRIOS COM ZOD + REACT HOOK FORM

### 2.1 Schema Validation

```typescript
// lib/validations/resource-schema.ts
import { z } from 'zod'

export const resourceFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode exceder 100 caracteres'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  organizationId: z
    .string()
    .uuid('Organização inválida'),

  status: z
    .enum(['active', 'inactive'])
    .default('active'),

  tags: z
    .array(z.string())
    .min(1, 'Selecione pelo menos uma tag')
    .optional(),

  createdAt: z
    .date()
    .optional()
    .transform(val => val || new Date()),
})

export type ResourceFormInput = z.infer<typeof resourceFormSchema>

// Com refinamento/transformação customizada
export const userFormSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })
```

### 2.2 Formulário Reutilizável

```typescript
// components/forms/resource-form.tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { resourceFormSchema, type ResourceFormInput } from '@/lib/validations/resource-schema'

interface ResourceFormProps {
  initialData?: Partial<ResourceFormInput>
  onSubmit: (data: ResourceFormInput) => Promise<void>
  isLoading?: boolean
}

export function ResourceForm({
  initialData,
  onSubmit,
  isLoading,
}: ResourceFormProps) {
  const form = useForm<ResourceFormInput>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: '',
      email: '',
      status: 'active',
      ...initialData,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome" {...field} />
              </FormControl>
              <FormDescription>
                Nome único do recurso
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 3. DIALOG & SHEET PARA CRUD

### 3.1 Dialog com Formulário

```typescript
// components/dashboard/resources/resource-form-dialog.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ResourceForm } from '@/components/forms/resource-form'
import { toast } from 'sonner'
import { resourceFormSchema, type ResourceFormInput } from '@/lib/validations/resource-schema'

interface ResourceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceId?: string // undefined = novo recurso
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  resourceId,
}: ResourceFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!resourceId

  // Fetch recurso existente se editar
  const { data: resource, isLoading: isFetching } = useQuery({
    queryKey: ['resource', resourceId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/resources/${resourceId}`)
      return response.json()
    },
    enabled: isEdit && open,
  })

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (data: ResourceFormInput) => {
      const response = await fetch('/api/v1/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao criar')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      toast.success('Recurso criado com sucesso!')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar recurso')
    },
  })

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async (data: ResourceFormInput) => {
      const response = await fetch(`/api/v1/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao atualizar')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['resource', resourceId] })
      toast.success('Recurso atualizado com sucesso!')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar recurso')
    },
  })

  async function onSubmit(data: ResourceFormInput) {
    if (isEdit) {
      await updateMutation.mutateAsync(data)
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Recurso' : 'Novo Recurso'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações do recurso'
              : 'Crie um novo recurso preenchendo os dados abaixo'}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div>Carregando...</div>
        ) : (
          <ResourceForm
            initialData={resource}
            onSubmit={onSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### 3.2 Confirmação de Delete

```typescript
// components/dashboard/shared/confirmation-dialog.tsx
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  variant = 'default',
  onConfirm,
  isLoading,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            variant={variant}
          >
            {isLoading ? 'Deletando...' : action}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## 4. TABELAS COM DATA-TABLE

### 4.1 Custom Column Definitions

```typescript
// components/dashboard/resources/resource-columns.tsx
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

export type Resource = {
  id: string
  name: string
  status: 'active' | 'inactive'
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

interface ColumnContext {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const createResourceColumns = (
  context: ColumnContext
): ColumnDef<Resource>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue('name')}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge
          variant={status === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Criação',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => context.onEdit(row.original.id)}
            className="flex gap-2"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => context.onDelete(row.original.id)}
            className="text-red-600 flex gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Deletar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
]
```

---

## 5. CUSTOM HOOKS

### 5.1 Hook para Data Table

```typescript
// hooks/use-data-table.ts
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

export interface DataTableState {
  page: number
  pageSize: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, string>
}

interface UseDataTableOptions {
  queryKey: (state: DataTableState) => unknown[]
  queryFn: (state: DataTableState) => Promise<{
    items: any[]
    total: number
  }>
  initialPageSize?: number
}

export function useDataTable({
  queryKey,
  queryFn,
  initialPageSize = 20,
}: UseDataTableOptions) {
  const [state, setState] = useState<DataTableState>({
    page: 1,
    pageSize: initialPageSize,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: queryKey(state),
    queryFn: () => queryFn(state),
    staleTime: 1000 * 60, // 1 minuto
  })

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setState(prev => ({ ...prev, page: 1, pageSize }))
  }

  const handleSearch = (search: string) => {
    setState(prev => ({ ...prev, search, page: 1 }))
  }

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }))
  }

  const handleFilterChange = (filters: Record<string, string>) => {
    setState(prev => ({ ...prev, filters, page: 1 }))
  }

  const handleReset = () => {
    setState({
      page: 1,
      pageSize: initialPageSize,
    })
  }

  return {
    state,
    data: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    handlers: {
      handlePageChange,
      handlePageSizeChange,
      handleSearch,
      handleSort,
      handleFilterChange,
      handleReset,
    },
  }
}
```

### 5.2 Hook para Mutation com Toast

```typescript
// hooks/use-safe-mutation.ts
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SafeMutationOptions<T, E = Error> extends UseMutationOptions<T, E, any> {
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

export function useSafeMutation<T, E = Error>(
  options: SafeMutationOptions<T, E>
) {
  const {
    successMessage = 'Operação realizada com sucesso',
    errorMessage = 'Ocorreu um erro',
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError,
    ...mutationOptions
  } = options

  return useMutation({
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (showSuccessToast) {
        toast.success(successMessage)
      }
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      if (showErrorToast) {
        const message = error instanceof Error ? error.message : errorMessage
        toast.error(message)
      }
      onError?.(error, variables, context)
    },
  })
}
```

---

## 6. CONTEXT E PROVIDERS

### 6.1 Header Actions Context

```typescript
// components/dashboard/header-actions.tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react'

const HeaderActionsContext = createContext<ReactNode | null>(null)

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = React.useState<ReactNode>(null)

  return (
    <HeaderActionsContext.Provider value={actions}>
      <HeaderActionsContextProvider setActions={setActions}>
        {children}
      </HeaderActionsContextProvider>
    </HeaderActionsContext.Provider>
  )
}

function HeaderActionsContextProvider({
  children,
  setActions,
}: {
  children: ReactNode
  setActions: (actions: ReactNode) => void
}) {
  return (
    <HeaderActionsContext.Provider value={setActions as any}>
      {children}
    </HeaderActionsContext.Provider>
  )
}

export function HeaderActions({ children }: { children: ReactNode }) {
  const setActions = useContext(HeaderActionsContext) as any
  React.useEffect(() => {
    setActions(children)
    return () => setActions(null)
  }, [children, setActions])

  return null
}

export function HeaderActionsSlot() {
  return useContext(HeaderActionsContext) as ReactNode
}
```

### 6.2 Filters Context

```typescript
// components/dashboard/filters-context.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FiltersContextType {
  filters: Record<string, any>
  setFilters: (filters: Record<string, any>) => void
  addFilter: (key: string, value: any) => void
  removeFilter: (key: string) => void
  resetFilters: () => void
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Record<string, any>>({})

  const addFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const resetFilters = () => {
    setFilters({})
  }

  return (
    <FiltersContext.Provider
      value={{ filters, setFilters, addFilter, removeFilter, resetFilters }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (!context) {
    throw new Error('useFilters must be used within FiltersProvider')
  }
  return context
}
```

---

## 7. COMPONENTES REUTILIZÁVEIS

### 7.1 Card de Métrica

```typescript
// components/dashboard/metrics-card.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MetricsCardProps {
  title: string
  description?: string
  value: ReactNode
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    positive: boolean
  }
  className?: string
}

export function MetricsCard({
  title,
  description,
  value,
  icon,
  trend,
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {icon && <div className="text-2xl text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={cn(
              'text-xs mt-2',
              trend.positive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

### 7.2 Status Badge

```typescript
// components/dashboard/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success'

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' },
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  error: { label: 'Erro', className: 'bg-red-100 text-red-800' },
  warning: { label: 'Aviso', className: 'bg-orange-100 text-orange-800' },
  success: { label: 'Sucesso', className: 'bg-green-100 text-green-800' },
}

interface StatusBadgeProps {
  status: Status
  label?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export function StatusBadge({
  status,
  label,
  variant = 'default',
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={variant} className={cn('capitalize', config.className)}>
      {label || config.label}
    </Badge>
  )
}
```

### 7.3 Empty State

```typescript
// components/dashboard/shared/empty-state.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {icon && <div className="mb-4 text-4xl opacity-50">{icon}</div>}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  )
}
```

---

## 8. API HELPERS

### 8.1 Fetch com Tratamento de Erro

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface FetchOptions extends RequestInit {
  params?: Record<string, any>
}

export async function apiClient<T = any>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { params, ...fetchOptions } = options || {}

  let url = `${API_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(
      Object.entries(params).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
        {}
      )
    )
    url += `?${searchParams}`
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Uso
const users = await apiClient<User[]>('/api/v1/users', {
  params: { page: 1, limit: 20 },
})

const newUser = await apiClient<User>('/api/v1/users', {
  method: 'POST',
  body: JSON.stringify(userData),
})
```

---

## 9. DARK MODE

### 9.1 Setup Theme Provider

```typescript
// components/providers/theme-provider.tsx
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 9.2 Theme Toggle

```typescript
// components/dashboard/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 10. TESTES UNITÁRIOS

### 10.1 Component Test

```typescript
// components/__tests__/status-badge.test.ts
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/dashboard/status-badge'

describe('StatusBadge', () => {
  it('renders with correct status label', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<StatusBadge status="active" label="Online" />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('applies correct styles for different statuses', () => {
    const { container } = render(<StatusBadge status="error" />)
    expect(container.querySelector('[class*="red"]')).toBeInTheDocument()
  })
})
```

### 10.2 Hook Test

```typescript
// hooks/__tests__/use-data-table.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useDataTable } from '@/hooks/use-data-table'

describe('useDataTable', () => {
  it('initializes with correct state', () => {
    const { result } = renderHook(() =>
      useDataTable({
        queryKey: () => ['test'],
        queryFn: async () => ({ items: [], total: 0 }),
      })
    )

    expect(result.current.state.page).toBe(1)
    expect(result.current.state.pageSize).toBe(20)
  })

  it('updates page when handlePageChange is called', () => {
    const { result } = renderHook(() =>
      useDataTable({
        queryKey: () => ['test'],
        queryFn: async () => ({ items: [], total: 0 }),
      })
    )

    result.current.handlers.handlePageChange(2)

    expect(result.current.state.page).toBe(2)
  })
})
```

---

**Dica**: Copie e adapte esses templates para seus componentes específicos. A maioria pode ser reutilizada com mínimas mudanças!
