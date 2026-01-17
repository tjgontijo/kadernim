'use client'

import React, { useState } from 'react'
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
import { CrudPageShell } from '@/components/admin/crud/crud-page-shell'
import { CrudDataView } from '@/components/admin/crud/crud-data-view'
import { DeleteConfirmDialog } from '@/components/admin/crud/delete-confirm-dialog'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useDataTable } from '@/hooks/utils/use-data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserEditDrawer, UserCreateDrawer } from '@/components/admin/users'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/index'
import { getRoleBadge as getRoleBadgeClass } from '@/lib/utils/badge-variants'

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
    const [isDeletingLoading, setIsDeletingLoading] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

    // Filters
    const [role, setRole] = useState<string>('all')
    const [status, setStatus] = useState<string>('all')
    const [emailVerifiedOnly, setEmailVerifiedOnly] = useState(false)

    const crud = useDataTable<User>({
        queryKey: ['admin-users-crud'],
        endpoint: '/api/v1/admin/users'
    })

    // Apply custom filters
    React.useEffect(() => {
        const filters: Record<string, any> = {}
        if (role !== 'all') filters.role = role
        if (status === 'banned') filters.banned = true
        if (status === 'active') filters.subscriptionActive = true
        if (status === 'inactive') filters.subscriptionActive = false
        if (emailVerifiedOnly) filters.emailVerified = true
        crud.handleFilterChange(filters)
    }, [role, status, emailVerifiedOnly])

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setIsEditDrawerOpen(true)
    }

    const handleToggleBan = async (user: User) => {
        try {
            const response = await fetch(`/api/v1/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banned: !user.banned })
            })

            if (!response.ok) {
                throw new Error('Erro ao atualizar usuário')
            }

            toast.success(user.banned ? 'Usuário desbanido' : 'Usuário banido')
            crud.refetch()
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const confirmDelete = async () => {
        if (!isDeletingId) return
        setIsDeletingLoading(true)
        try {
            const response = await fetch(`/api/v1/admin/users/${isDeletingId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Erro ao excluir usuário')
            }

            toast.success('Usuário excluído com sucesso')
            crud.refetch()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsDeletingLoading(false)
            setIsDeletingId(null)
        }
    }

    const getRoleBadge = (role: string) => {
        const icons: Record<string, React.ReactNode> = {
            admin: <Crown className="h-3 w-3" />,
            subscriber: <Package className="h-3 w-3" />,
            user: <Users className="h-3 w-3" />,
        }
        const icon = icons[role] || icons.user
        return (
            <Badge variant="outline" className={cn("gap-1 font-medium", getRoleBadgeClass(role))}>
                {icon}
                {role === 'admin' ? 'Admin' : role === 'subscriber' ? 'Assinante' : 'Usuário'}
            </Badge>
        )
    }

    const getSubscriptionBadge = (subscription: User['subscription']) => {
        if (!subscription || subscription.status !== 'active') {
            return <span className="text-xs text-muted-foreground/50 italic">—</span>
        }
        return (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
                {subscription.planName || 'Ativo'}
            </Badge>
        )
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
                                crud.handlePageChange(1)
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
                                crud.handlePageChange(1)
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
                        crud.handlePageChange(1)
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
                page={crud.page}
                limit={crud.limit}
                onPageChange={crud.handlePageChange}
                onLimitChange={crud.handleLimitChange}
                totalItems={crud.pagination?.total ?? 0}
                totalPages={crud.pagination?.totalPages ?? 0}
                hasMore={crud.pagination?.hasMore ?? false}
                isLoading={crud.isLoading}
                filters={filtersComponent}
                onAdd={() => setIsCreateDrawerOpen(true)}
            >
                <CrudDataView
                    data={crud.data}
                    view={crud.view}
                    tableView={
                        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/30 border-b border-border">
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Usuário
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Cargo
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Assinatura
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                E-mail
                                            </th>
                                            <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Acessos
                                            </th>
                                            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                                Criado em
                                            </th>
                                            <th className="w-28"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crud.data.map((user) => (
                                            <tr
                                                key={user.id}
                                                className={cn(
                                                    "group border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors cursor-pointer",
                                                    user.banned && "opacity-50 bg-destructive/5"
                                                )}
                                                onClick={() => handleEdit(user)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border">
                                                            <AvatarImage src={user.image || ''} alt={user.name} />
                                                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                                                {user.name?.slice(0, 2).toUpperCase() || '??'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-foreground truncate leading-tight">
                                                                    {user.name}
                                                                </span>
                                                                {user.banned && (
                                                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                                                                        BANIDO
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground truncate block">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getRoleBadge(user.role)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getSubscriptionBadge(user.subscription)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        {user.emailVerified ? (
                                                            <MailCheck className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Mail className="h-4 w-4 text-muted-foreground/40" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                            {user._count?.resourceAccess ?? 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PermissionGuard action="update" subject="User">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                                                                onClick={() => handleEdit(user)}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                        </PermissionGuard>
                                                        <PermissionGuard action="update" subject="User">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    "h-8 w-8 rounded-full transition-colors",
                                                                    user.banned
                                                                        ? "text-emerald-500 hover:bg-emerald-500/10"
                                                                        : "text-amber-500 hover:bg-amber-500/10"
                                                                )}
                                                                onClick={() => handleToggleBan(user)}
                                                                title={user.banned ? 'Desbanir' : 'Banir'}
                                                            >
                                                                {user.banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                                            </Button>
                                                        </PermissionGuard>
                                                        <PermissionGuard action="delete" subject="User">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                                onClick={() => setIsDeletingId(user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </PermissionGuard>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                    cardView={
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {crud.data.map((user) => (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md cursor-pointer",
                                        user.banned && "opacity-60 bg-destructive/5"
                                    )}
                                    onClick={() => handleEdit(user)}
                                >
                                    <div className="flex p-3 gap-3">
                                        <Avatar className="h-12 w-12 border shrink-0">
                                            <AvatarImage src={user.image || ''} alt={user.name} />
                                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                                {user.name?.slice(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
                                                    {user.name}
                                                </h3>
                                                {user.banned && (
                                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 shrink-0">
                                                        BANIDO
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getRoleBadge(user.role)}
                                                {user.emailVerified && (
                                                    <MailCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <PermissionGuard action="update" subject="User">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </Button>
                                            </PermissionGuard>
                                            <PermissionGuard action="delete" subject="User">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                                    onClick={() => setIsDeletingId(user.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </PermissionGuard>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 px-3 py-2 bg-muted/5 flex items-center justify-between">
                                        {getSubscriptionBadge(user.subscription)}
                                        <span className="text-[9px] text-muted-foreground/40 font-mono">
                                            {user._count?.resourceAccess ?? 0} acessos
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                />
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
                isLoading={isDeletingLoading}
                title="Excluir Usuário?"
                description="Esta ação não pode ser desfeita. Todos os dados do usuário, incluindo acessos a recursos e histórico, serão permanentemente removidos."
                trigger={null}
            />
        </>
    )
}
