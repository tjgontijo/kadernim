'use client'

import React from 'react'
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
    Package 
} from 'lucide-react'
import { TableVirtuoso } from 'react-virtuoso'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { cn } from '@/lib/utils/index'
import { getRoleBadge as getRoleBadgeClass } from '@/lib/utils/badge-variants'

type User = {
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

interface UsersTableVirtuosoProps {
    users: User[]
    onEdit: (user: User) => void
    onToggleBan: (user: User) => void
    onDelete: (id: string) => void
    onEndReached?: () => void
}

export function UsersTableVirtuoso({
    users,
    onEdit,
    onToggleBan,
    onDelete,
    onEndReached
}: UsersTableVirtuosoProps) {
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
            return <span className="text-[10px] text-muted-foreground/40 italic uppercase tracking-wider">—</span>
        }
        return (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-wider">
                {subscription.planName || 'Ativo'}
            </Badge>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col overflow-hidden">
            <TableVirtuoso
                data={users}
                endReached={onEndReached}
                increaseViewportBy={200}
                fixedHeaderContent={() => (
                    <tr className="bg-muted/80 backdrop-blur-sm border-b border-border/40 z-10">
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Usuário
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Cargo
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Assinatura
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            E-mail
                        </th>
                        <th className="px-4 py-3 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Acessos
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                            Criado em
                        </th>
                        <th className="w-28"></th>
                    </tr>
                )}
                itemContent={(index, user) => (
                    <>
                        <td className="px-4 py-3" onClick={() => onEdit(user)}>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                                    <AvatarImage src={user.image || ''} alt={user.name} />
                                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                        {user.name?.slice(0, 2).toUpperCase() || '??'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[13px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                                            {user.name}
                                        </span>
                                        {user.banned && (
                                            <Badge variant="destructive" className="text-[8px] px-1.5 py-0 font-black">
                                                BANIDO
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/60 truncate block font-medium">
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
                                    <Mail className="h-4 w-4 text-muted-foreground/20" />
                                )}
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                                <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                                    {user._count?.resourceAccess ?? 0}
                                </span>
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/60">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                        </td>

                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150">
                                <PermissionGuard action="update" subject="User">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                        onClick={() => onEdit(user)}
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
                                        onClick={() => onToggleBan(user)}
                                        title={user.banned ? 'Desbanir' : 'Banir'}
                                    >
                                        {user.banned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard action="delete" subject="User">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </td>
                    </>
                )}
                components={{
                    Table: (props) => <table {...props} className="w-full border-collapse" />,
                    TableRow: (props) => (
                        <tr 
                            {...props} 
                            className={cn(
                                "group border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                                (props.item as User)?.banned && "bg-destructive/5 opacity-80"
                            )} 
                        />
                    ),
                    Scroller: React.forwardRef<HTMLDivElement, any>((props, ref) => (
                        <div {...props} ref={ref} className={cn(props.className, "scrollbar-hide")} />
                    )),
                }}
            />
            
            {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nenhum usuário encontrado</p>
                </div>
            )}
        </div>
    )
}
