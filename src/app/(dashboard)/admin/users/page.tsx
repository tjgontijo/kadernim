'use client'

import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
    Users,
    Shield,
    UserCheck,
    Ban,
    Edit3,
    Trash2,
    Mail,
    MailCheck,
    Crown,
    Calendar,
    Package,
    X
} from 'lucide-react'
import { CrudPageShell } from '@/components/dashboard/crud/crud-page-shell'
import { CrudDataView } from '@/components/dashboard/crud/crud-data-view'
import { DeleteConfirmDialog } from '@/components/dashboard/crud/delete-confirm-dialog'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useInfiniteDataTable } from '@/hooks/utils/use-infinite-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserEditDrawer, UserCreateDrawer } from '@/components/dashboard/users'
import { UsersTableVirtuoso } from '@/components/dashboard/users/users-table-virtuoso'
import { UsersGridVirtuoso } from '@/components/dashboard/users/users-grid-virtuoso'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/index'
import { deleteAdminUser, updateAdminUser } from '@/lib/users/api-client'

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
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

    // Filters
    const [role, setRole] = useState<string>('all')
    const [status, setStatus] = useState<string>('all')
    const [emailVerifiedOnly, setEmailVerifiedOnly] = useState(false)

    const crud = useInfiniteDataTable<User>({
        queryKey: ['admin-users-crud'],
        endpoint: '/api/v1/admin/users'
    })

    const buildFilters = (
        nextRole: string,
        nextStatus: string,
        nextEmailVerifiedOnly: boolean
    ) => {
        const filters: Record<string, any> = {}
        if (nextRole !== 'all') filters.role = nextRole
        if (nextStatus === 'banned') filters.banned = true
        if (nextStatus === 'active') filters.subscriptionActive = true
        if (nextStatus === 'inactive') filters.subscriptionActive = false
        if (nextEmailVerifiedOnly) filters.emailVerified = true
        return filters
    }

    const applyFilters = (
        nextRole: string,
        nextStatus: string,
        nextEmailVerifiedOnly: boolean
    ) => {
        crud.handleFilterChange(buildFilters(nextRole, nextStatus, nextEmailVerifiedOnly))
    }

    const toggleBanMutation = useMutation({
        mutationFn: async (user: User) => {
            return updateAdminUser(user.id, { banned: !user.banned })
        },
        onSuccess: (_data, user) => {
            toast.success(user.banned ? 'Usuário desbanido' : 'Usuário banido')
            crud.refetch()
        },
        onError: (error: Error) => {
            toast.error(error.message)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return deleteAdminUser(id)
        },
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
        setEditingUser(user)
        setIsEditDrawerOpen(true)
    }

    const handleToggleBan = async (user: User) => {
        toggleBanMutation.mutate(user)
    }

    const confirmDelete = async () => {
        if (!isDeletingId) return
        deleteMutation.mutate(isDeletingId)
    }



    // Check if any filter is active
    const hasActiveFilters = role !== 'all' || status !== 'all' || emailVerifiedOnly || crud.searchInput.length > 0

    const clearAllFilters = () => {
        setRole('all')
        setStatus('all')
        setEmailVerifiedOnly(false)
        crud.clearFilters()
    }

    // Custom filters component
    const filtersComponent = (
        <div className="flex items-center gap-2">
            {/* Role Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed text-xs">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Cargo:</span>
                        <Badge variant="secondary" className="px-1 font-normal rounded-sm text-[10px]">
                            {ROLE_OPTIONS.find((o) => o.value === role)?.label}
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {ROLE_OPTIONS.map((opt) => (
                        <DropdownMenuCheckboxItem
                            key={opt.value}
                            checked={role === opt.value}
                            onCheckedChange={() => {
                                setRole(opt.value)
                                applyFilters(opt.value, status, emailVerifiedOnly)
                            }}
                        >
                            {opt.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Status Filter */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed text-xs">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Status:</span>
                        <Badge variant="secondary" className="px-1 font-normal rounded-sm text-[10px]">
                            {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                        </Badge>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {STATUS_OPTIONS.map((opt) => (
                        <DropdownMenuCheckboxItem
                            key={opt.value}
                            checked={status === opt.value}
                            onCheckedChange={() => {
                                setStatus(opt.value)
                                applyFilters(role, opt.value, emailVerifiedOnly)
                            }}
                        >
                            {opt.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <div className="flex items-center gap-2 px-2">
                <Switch
                    id="verified-only"
                    checked={emailVerifiedOnly}
                    onCheckedChange={(checked) => {
                        setEmailVerifiedOnly(checked)
                        applyFilters(role, status, checked)
                    }}
                />
                <Label htmlFor="verified-only" className="text-xs font-medium cursor-pointer">
                    Verificados
                </Label>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <>
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        onClick={clearAllFilters}
                    >
                        <X className="h-3.5 w-3.5" />
                        Limpar filtros
                    </Button>
                </>
            )}
        </div>
    )

    return (
        <>
            <CrudPageShell
                title="Usuários"
                subtitle="Gerencie os usuários, assinaturas e permissões do sistema"
                icon={Users}
                view={crud.view}
                setView={crud.setView}
                searchInput={crud.searchInput}
                onSearchChange={crud.setSearchInput}
                searchPlaceholder="Buscar por nome ou email..."
                page={crud.pagination?.page ?? 1}
                limit={crud.limit}
                onPageChange={() => {}}
                onLimitChange={crud.handleLimitChange}
                totalItems={crud.pagination?.total ?? 0}
                totalPages={crud.pagination?.totalPages ?? 0}
                hasMore={crud.hasNextPage ?? false}
                isLoading={crud.isLoading}
                filters={filtersComponent}
                onAdd={() => setIsCreateDrawerOpen(true)}
            >
                <div className="p-4 md:p-6 pb-20 h-full flex flex-col">
                    <CrudDataView
                        data={crud.data}
                        view={crud.view}
                        tableView={
                            <UsersTableVirtuoso
                                users={crud.data}
                                onEdit={handleEdit}
                                onToggleBan={handleToggleBan}
                                onDelete={(id) => setIsDeletingId(id)}
                                onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
                            />
                        }
                        cardView={
                            <UsersGridVirtuoso
                                users={crud.data}
                                onEdit={handleEdit}
                                onToggleBan={handleToggleBan}
                                onDelete={(id) => setIsDeletingId(id)}
                                onEndReached={() => crud.hasNextPage && crud.fetchNextPage()}
                            />
                        }
                    />

                    {crud.isFetchingNextPage && (
                        <div className="py-8">
                            {crud.view === 'cards' ? (
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="rounded-xl border border-border bg-card p-4 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-3.5 w-full" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                            <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                                                <Skeleton className="h-5 w-16 rounded-full" />
                                                <Skeleton className="h-4 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
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
                        </div>
                    )}
                </div>
            </CrudPageShell>

            <UserEditDrawer
                user={editingUser as any}
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                onSuccess={() => crud.refetch()}
            />

            <UserCreateDrawer
                open={isCreateDrawerOpen}
                onOpenChange={setIsCreateDrawerOpen}
                onSuccess={() => crud.refetch()}
            />

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
