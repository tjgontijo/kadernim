'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Filter, Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'
import { useInfiniteDataTable } from '@/hooks/utils/use-infinite-data-table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { UsersTableVirtuoso } from '@/components/dashboard/users/users-table-virtuoso'
import { toast } from 'sonner'
import { deleteAdminUser, updateAdminUser } from '@/lib/users/api-client'
import { PageScaffold } from '@/components/dashboard/shared/page-scaffold'
import { SearchInput } from '@/components/dashboard/shared/search-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  banned: boolean
  emailVerified: boolean
  createdAt: string
  subscription: {
    status: string
    planName: string | null
    expiresAt: string | null
  } | null
  _count?: {
    resourceAccess: number
  }
}

const ROLE_OPTIONS = [
  { value: 'all', label: 'Todos os Cargos' },
  { value: 'user', label: 'Usuário' },
  { value: 'subscriber', label: 'Assinante' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Qualquer Status' },
  { value: 'active', label: 'Assinatura Ativa' },
  { value: 'inactive', label: 'Sem Assinatura' },
  { value: 'banned', label: 'Banidos' },
]

export default function AdminUsersCrudPage() {
  const router = useRouter()
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [role, setRole] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [emailVerifiedOnly, setEmailVerifiedOnly] = useState(false)

  const crud = useInfiniteDataTable<User>({
    queryKey: ['admin-users-crud'],
    endpoint: '/api/v1/admin/users',
  })

  const buildFilters = (nextRole: string, nextStatus: string, nextEmailVerifiedOnly: boolean) => {
    const filters: Record<string, any> = {}
    if (nextRole !== 'all') filters.role = nextRole
    if (nextStatus === 'banned') filters.banned = true
    if (nextStatus === 'active') filters.subscriptionActive = true
    if (nextStatus === 'inactive') filters.subscriptionActive = false
    if (nextEmailVerifiedOnly) filters.emailVerified = true
    return filters
  }

  const toggleBanMutation = useMutation({
    mutationFn: async (user: User) => updateAdminUser(user.id, { banned: !user.banned }),
    onSuccess: (_data, user) => {
      toast.success(user.banned ? 'Usuário desbanido' : 'Usuário banido')
      crud.refetch()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso')
      crud.refetch()
      setIsDeletingId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleEdit = (user: User) => {
    router.push(`/admin/users/${user.id}/edit`)
  }

  const handleToggleBan = async (user: User) => {
    toggleBanMutation.mutate(user)
  }

  const confirmDelete = async () => {
    if (!isDeletingId) return
    deleteMutation.mutate(isDeletingId)
  }

  const activeFiltersCount =
    (role !== 'all' ? 1 : 0) +
    (status !== 'all' ? 1 : 0) +
    (emailVerifiedOnly ? 1 : 0)

  const applyFilters = () => {
    crud.replaceFilters(buildFilters(role, status, emailVerifiedOnly))
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setRole('all')
    setStatus('all')
    setEmailVerifiedOnly(false)
    crud.replaceFilters({})
    setIsFilterOpen(false)
  }

  return (
    <>
      <PageScaffold className="flex-1 flex flex-col pt-4 sm:pt-6 pb-6 sm:pb-8 overflow-hidden">
        <PageScaffold.Header title="Usuários" />

        <PageScaffold.Controls>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <div className="flex items-center gap-2 w-full">
              <SearchInput
                placeholder="Buscar por nome ou email..."
                value={crud.searchInput}
                onChange={(event) => crud.setSearchInput(event.target.value)}
                onClear={() => crud.setSearchInput('')}
                aria-label="Buscar usuários"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 sm:h-12 rounded-2xl border-border/50 shrink-0 relative px-4 font-semibold"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-4 w-4 text-foreground/70" />
                <span className="ml-2 hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-background">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Filtrar Usuários</DialogTitle>
                <DialogDescription>
                  Selecione cargo, status e validação de e-mail.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Cargo
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50">
                      {ROLE_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Status
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-12 w-full rounded-2xl text-sm font-semibold [&>span]:truncate">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50">
                      {STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card p-3 flex items-center justify-between">
                  <Label htmlFor="verified-only" className="text-sm font-semibold">Somente e-mails verificados</Label>
                  <Switch
                    id="verified-only"
                    checked={emailVerifiedOnly}
                    onCheckedChange={setEmailVerifiedOnly}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={clearFilters}>
                  Limpar
                </Button>
                <Button onClick={applyFilters}>
                  Aplicar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageScaffold.Controls>

        <section className="flex-1 min-h-0 px-0 mt-4">
          {crud.isLoading || (crud.isFetching && crud.data.length === 0) ? (
            <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col overflow-hidden">
              <div className="grid grid-cols-[minmax(320px,1fr)_140px_180px_90px_90px_120px_112px] gap-0 bg-muted/80 border-b border-border/40">
                {['Usuário', 'Cargo', 'Assinatura', 'E-mail', 'Acessos', 'Criado em', ''].map((label) => (
                  <div key={label} className="px-4 py-3">
                    {label ? <Skeleton className="h-3 w-20 rounded-lg" /> : null}
                  </div>
                ))}
              </div>
              <div className="divide-y divide-border/40">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-[minmax(320px,1fr)_140px_180px_90px_90px_120px_112px] items-center">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-40 rounded-lg" />
                        <Skeleton className="h-3 w-56 rounded-lg" />
                      </div>
                    </div>
                    <div className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></div>
                    <div className="px-4 py-3"><Skeleton className="h-6 w-28 rounded-full" /></div>
                    <div className="px-4 py-3 flex justify-center"><Skeleton className="h-4 w-4 rounded-full" /></div>
                    <div className="px-4 py-3 flex justify-center"><Skeleton className="h-7 w-9 rounded-full" /></div>
                    <div className="px-4 py-3"><Skeleton className="h-4 w-20 rounded-lg" /></div>
                    <div className="px-4 py-3 flex justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <UsersTableVirtuoso
              users={crud.data}
              onEdit={handleEdit}
              onToggleBan={handleToggleBan}
              onDelete={(id) => setIsDeletingId(id)}
              onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
            />
          )}

          {crud.isFetchingNextPage && (
            <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-card p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3.5 w-2/5" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
          <Button
            onClick={() => router.push('/admin/users/create')}
            className="w-14 h-14 rounded-full shadow-3xl bg-terracotta hover:bg-terracotta-hover text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
            size="icon"
            aria-label="Novo usuário"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>
      </PageScaffold>

      <DeleteConfirmDialog
        open={!!isDeletingId}
        onOpenChange={(open) => !open && setIsDeletingId(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        title="Excluir Usuário?"
        description="Esta ação não pode ser desfeita. Todos os dados do usuário, incluindo acessos a recursos e histórico, serão permanentemente removidos."
        trigger={null}
      />
    </>
  )
}
