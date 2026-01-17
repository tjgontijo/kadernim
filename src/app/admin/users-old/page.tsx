'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    SlidersHorizontal,
    Search,
    Filter,
    Shield,
    Users,
    ChevronLeft,
    ChevronRight,
    X,
    UserCheck,
    Ban
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useAdminUsers, useUpdateAdminUser, useDeleteAdminUser } from '@/hooks/admin/use-admin-users'
import { toast } from 'sonner'
import { useIsMobile } from '@/hooks/layout/use-mobile'
import { cn } from '@/lib/utils/index'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    TemplateMainShell,
    TemplateMainHeader,
    DataToolbar,
    ViewSwitcher,
    type ViewType,
} from '@/components/client/resources'
import { UsersCardView, UsersTableView, UserEditDrawer } from '@/components/admin/users'

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

export default function AdminUsersPage() {
    const router = useRouter()
    const [view, setView] = useState<ViewType>('list')
    const isMobile = useIsMobile()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(15)
    const [visibleColumns, setVisibleColumns] = useState<string[]>(['role', 'subscription', 'createdAt'])

    // Filters
    const [role, setRole] = useState<string>('all')
    const [status, setStatus] = useState<string>('all')
    const [emailVerifiedOnly, setEmailVerifiedOnly] = useState(false)

    // Search with debounce
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // Mutations
    const updateMutation = useUpdateAdminUser()
    const deleteMutation = useDeleteAdminUser()

    // Edit state
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)

    // Debounce effect for search
    useEffect(() => {
        const trimmed = searchInput.trim()

        if (trimmed.length === 0) {
            if (searchQuery) {
                setSearchQuery('')
                setPage(1)
            }
            return undefined
        }

        if (trimmed.length < 2) {
            return undefined
        }

        const handle = window.setTimeout(() => {
            setSearchQuery(trimmed)
            setPage(1)
        }, 400)

        return () => {
            window.clearTimeout(handle)
        }
    }, [searchInput, searchQuery])

    // Get data
    const { data: usersData, isLoading, error, refetch } = useAdminUsers({
        filters: {
            page,
            limit,
            q: searchQuery,
            role: role !== 'all' ? role as any : undefined,
            banned: status === 'banned' ? true : undefined,
            subscriptionActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
            emailVerified: emailVerifiedOnly || undefined,
        }
    })

    const users = usersData?.data || []
    const pagination = usersData?.pagination

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        // Scroll to top of list
        const listTop = document.getElementById('data-list-area')
        if (listTop) listTop.scrollTop = 0
    }

    // Sync editing user with updated data from list
    useEffect(() => {
        if (editingUser && users.length > 0) {
            const updated = users.find(u => u.id === editingUser.id)
            if (updated) {
                setEditingUser(updated)
            }
        }
    }, [users, editingUser?.id])

    const handleEdit = (userId: string) => {
        const user = users.find(u => u.id === userId)
        if (user) {
            setEditingUser(user)
            setIsEditDrawerOpen(true)
        }
    }

    const handleToggleBan = async (userId: string) => {
        const user = users.find(u => u.id === userId)
        if (!user) return

        updateMutation.mutate({
            userId,
            data: { banned: !user.banned }
        }, {
            onSuccess: () => {
                toast.success(user.banned ? 'Usuário desbanido' : 'Usuário banido')
            },
            onError: () => {
                toast.error('Ocorreu um erro ao atualizar o usuário')
            }
        })
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação é irreversível.')) return

        deleteMutation.mutate(userId, {
            onSuccess: () => {
                toast.success('Usuário excluído')
            },
            onError: () => {
                toast.error('Ocorreu um erro ao excluir o usuário')
            }
        })
    }

    return (
        <TemplateMainShell>
            {/* Header Area */}
            <TemplateMainHeader
                title="Usuários"
                subtitle="Gerencie os usuários, assinaturas e permissões do sistema."
                icon={Users}
            >
                <div className="flex items-center gap-2">
                    <ViewSwitcher view={view} setView={setView} />
                </div>
            </TemplateMainHeader>

            {/* Toolbar Area */}
            <DataToolbar>
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        className="pl-9 h-10 bg-background"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filters Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    {/* Role Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-dashed">
                                <Shield className="h-4 w-4" />
                                <span>Cargo:</span>
                                <Badge variant="secondary" className="px-1 font-normal rounded-sm">
                                    {ROLE_OPTIONS.find((o) => o.value === role)?.label}
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {ROLE_OPTIONS.map((opt) => (
                                <DropdownMenuCheckboxItem
                                    key={opt.value}
                                    checked={role === opt.value}
                                    onCheckedChange={() => {
                                        setRole(opt.value)
                                        setPage(1)
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
                            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-dashed">
                                <UserCheck className="h-4 w-4" />
                                <span>Status:</span>
                                <Badge variant="secondary" className="px-1 font-normal rounded-sm">
                                    {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {STATUS_OPTIONS.map((opt) => (
                                <DropdownMenuCheckboxItem
                                    key={opt.value}
                                    checked={status === opt.value}
                                    onCheckedChange={() => {
                                        setStatus(opt.value)
                                        setPage(1)
                                    }}
                                >
                                    {opt.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-4 w-[1px] bg-border mx-1" />

                    {/* Verification Switch */}
                    <div className="flex items-center gap-2 px-2">
                        <Switch
                            id="verified-only"
                            checked={emailVerifiedOnly}
                            onCheckedChange={(checked) => {
                                setEmailVerifiedOnly(checked)
                                setPage(1)
                            }}
                        />
                        <Label htmlFor="verified-only" className="text-xs font-medium cursor-pointer">
                            Verificados
                        </Label>
                    </div>

                    <div className="h-4 w-[1px] bg-border mx-1" />

                    {/* Columns Visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                <span>Colunas</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {[
                                { id: 'role', label: 'Cargo' },
                                { id: 'subscription', label: 'Assinatura' },
                                { id: 'emailVerified', label: 'Verificado' },
                                { id: 'resourceAccessCount', label: 'Acessos' },
                                { id: 'createdAt', label: 'Criado em' },
                            ].map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    checked={visibleColumns.includes(col.id)}
                                    onCheckedChange={(checked) => {
                                        setVisibleColumns((prev) =>
                                            checked ? [...prev, col.id] : prev.filter((id) => id !== col.id)
                                        )
                                    }}
                                >
                                    {col.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile Filters Trigger */}
                <div className="md:hidden ml-auto">
                    <Drawer>
                        <DrawerTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Filtros Avançados</DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 space-y-6">
                                <div className="space-y-3">
                                    <Label>Cargo</Label>
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos os cargos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Qualquer status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="mobile-verified">Apenas E-mails Verificados</Label>
                                    <Switch
                                        id="mobile-verified"
                                        checked={emailVerifiedOnly}
                                        onCheckedChange={setEmailVerifiedOnly}
                                    />
                                </div>
                            </div>
                            <DrawerFooter className="border-t">
                                <DrawerClose asChild>
                                    <Button onClick={() => setPage(1)}>Aplicar Filtros</Button>
                                </DrawerClose>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                </div>
            </DataToolbar>

            {/* Content Area */}
            <div id="data-list-area" className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-light">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse font-medium">
                            Carregando usuários...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                            <X className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Falha ao carregar dados</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mb-6">
                            Ocorreu um erro ao tentar buscar a lista de usuários.
                        </p>
                        <Button onClick={() => refetch()} variant="outline">Tentar Novamente</Button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30 mb-4">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum usuário encontrado</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Não encontramos nenhum usuário com os filtros aplicados nas suas buscas.
                        </p>
                        <Button
                            variant="link"
                            className="mt-4"
                            onClick={() => {
                                setSearchInput('')
                                setSearchQuery('')
                                setRole('all')
                                setStatus('all')
                                setEmailVerifiedOnly(false)
                                setPage(1)
                            }}
                        >
                            Limpar todos os filtros
                        </Button>
                    </div>
                ) : view === 'list' && !isMobile ? (
                    <UsersTableView
                        users={users as any}
                        visibleColumns={visibleColumns}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleBan={handleToggleBan}
                    />
                ) : (
                    <UsersCardView
                        users={users as any}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleBan={handleToggleBan}
                    />
                )}
            </div>

            {/* Pagination Bar */}
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-border bg-card/50 backdrop-blur-md px-4 py-3 flex items-center justify-between sm:px-6 shrink-0 transition-all">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="rounded-xl h-9"
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!pagination.hasMore}
                            onClick={() => handlePageChange(page + 1)}
                            className="rounded-xl h-9"
                        >
                            Próxima
                        </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <p className="text-sm text-muted-foreground whitespace-nowrap">
                                Mostrando <span className="font-semibold text-foreground">{users.length}</span> de{' '}
                                <span className="font-semibold text-foreground">{pagination.total}</span> usuários
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Itens:</span>
                                <Select
                                    value={String(limit)}
                                    onValueChange={(val) => {
                                        setLimit(Number(val))
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[15, 30, 50, 100].map((v) => (
                                            <SelectItem key={v} value={String(v)} className="text-xs">
                                                {v}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl border-border/50 hover:bg-muted"
                                disabled={page === 1}
                                onClick={() => handlePageChange(page - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1.5 px-2">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum = i + 1
                                    if (pagination.totalPages > 5 && page > 3) {
                                        pageNum = page - 2 + i
                                        if (pageNum + 2 > pagination.totalPages) {
                                            pageNum = pagination.totalPages - 4 + i
                                        }
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? 'default' : 'ghost'}
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 rounded-xl text-xs font-bold transition-all",
                                                page === pageNum ? "shadow-md shadow-primary/20 scale-105" : "hover:bg-muted"
                                            )}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-xl border-border/50 hover:bg-muted"
                                disabled={!pagination.hasMore}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Drawer Area */}
            <UserEditDrawer
                user={editingUser}
                open={isEditDrawerOpen}
                onOpenChange={setIsEditDrawerOpen}
                onSuccess={() => refetch()}
            />
        </TemplateMainShell>
    )
}
