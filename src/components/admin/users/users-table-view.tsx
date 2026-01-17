'use client'

import * as React from 'react'
import { Edit, Trash2, Shield, User, Star, CheckCircle2, XCircle, Calendar, MoreHorizontal, Ban } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/index'
import { PermissionGuard } from '@/components/auth/permission-guard'

type UserData = {
    id: string
    name: string
    email: string
    phone?: string | null
    image?: string | null
    role: 'user' | 'subscriber' | 'admin'
    emailVerified: boolean
    banned: boolean
    subscription?: {
        isActive: boolean
        expiresAt: string | null
    } | null
    resourceAccessCount: number
    createdAt: string
    updatedAt: string
}

type UsersTableViewProps = {
    users: UserData[]
    visibleColumns: string[]
    onView?: (userId: string) => void
    onEdit?: (userId: string) => void
    onDelete?: (userId: string) => void
    onToggleBan?: (userId: string) => void
}

export function UsersTableView({
    users,
    visibleColumns,
    onView,
    onEdit,
    onDelete,
    onToggleBan,
}: UsersTableViewProps) {
    const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId)

    const getInitials = (name: string) => {
        if (!name) return '??'
        return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="destructive" className="text-[10px] font-bold">Admin</Badge>
            case 'subscriber':
                return <Badge variant="default" className="text-[10px] font-bold bg-primary hover:bg-primary">Assinante</Badge>
            default:
                return <Badge variant="outline" className="text-[10px] font-medium">Usuário</Badge>
        }
    }

    const getSubscriptionBadge = (subscription?: { isActive: boolean, expiresAt: string | null } | null) => {
        if (!subscription) return <span className="text-muted-foreground text-xs">—</span>

        if (subscription.isActive) {
            return (
                <Badge variant="outline" className="text-[10px] border-green-500/20 bg-green-500/10 text-green-600 font-medium">
                    Ativo
                </Badge>
            )
        }

        return (
            <Badge variant="outline" className="text-[10px] border-orange-500/20 bg-orange-500/10 text-orange-600 font-medium">
                Inativo
            </Badge>
        )
    }

    return (
        <TooltipProvider>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                    Usuário
                                </th>
                                {isColumnVisible('role') && (
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Cargo
                                    </th>
                                )}
                                {isColumnVisible('subscription') && (
                                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Assinatura
                                    </th>
                                )}
                                {isColumnVisible('emailVerified') && (
                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Verif.
                                    </th>
                                )}
                                {isColumnVisible('resourceAccessCount') && (
                                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Acessos
                                    </th>
                                )}
                                {isColumnVisible('createdAt') && (
                                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                                        Criado em
                                    </th>
                                )}
                                <th className="w-24"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className={cn(
                                        'group border-b border-border/50 last:border-0 transition-colors cursor-pointer',
                                        'hover:bg-muted/40',
                                        user.banned && 'bg-red-50/30'
                                    )}
                                    onClick={() => onEdit?.(user.id)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-border/50">
                                                <AvatarImage src={user.image || ''} alt={user.name} />
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                                                    {user.name}
                                                    {user.banned && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Ban className="h-3 w-3 text-destructive" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Usuário Banido</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {isColumnVisible('role') && (
                                        <td className="px-4 py-3">
                                            {getRoleBadge(user.role)}
                                        </td>
                                    )}

                                    {isColumnVisible('subscription') && (
                                        <td className="px-4 py-3">
                                            {getSubscriptionBadge(user.subscription)}
                                        </td>
                                    )}

                                    {isColumnVisible('emailVerified') && (
                                        <td className="px-4 py-3 text-center">
                                            {user.emailVerified ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                            )}
                                        </td>
                                    )}

                                    {isColumnVisible('resourceAccessCount') && (
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-xs font-medium bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                                                {user.resourceAccessCount}
                                            </span>
                                        </td>
                                    )}

                                    {isColumnVisible('createdAt') && (
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </td>
                                    )}

                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <PermissionGuard action="update" subject="User">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onEdit?.(user.id)
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Editar Usuário</TooltipContent>
                                                </Tooltip>
                                            </PermissionGuard>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <PermissionGuard action="update" subject="User">
                                                        <DropdownMenuItem onClick={() => onToggleBan?.(user.id)}>
                                                            <Ban className="h-4 w-4 mr-2" />
                                                            {user.banned ? 'Desbanir' : 'Banir'}
                                                        </DropdownMenuItem>
                                                    </PermissionGuard>
                                                    <PermissionGuard action="delete" subject="User">
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete?.(user.id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </PermissionGuard>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </TooltipProvider>
    )
}
