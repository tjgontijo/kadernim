'use client'

import React from 'react'
import { 
    Users, 
    Shield, 
    UserCheck, 
    Ban, 
    Edit3, 
    Trash2, 
    MailCheck, 
    Crown, 
    Calendar, 
    Package 
} from 'lucide-react'
import { VirtuosoGrid } from 'react-virtuoso'
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

interface UsersGridVirtuosoProps {
    users: User[]
    onEdit: (user: User) => void
    onToggleBan: (user: User) => void
    onDelete: (id: string) => void
    onEndReached?: () => void
}

const ListContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, className, ...props }, ref) => (
    <div
      ref={ref}
      style={{ ...style }}
      className={cn("grid gap-4 p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500", className)}
      {...props}
    />
  )
)
ListContainer.displayName = 'VirtualizedUserGridList'

const ItemContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ style, ...props }, ref) => (
    <div ref={ref} style={{ ...style }} {...props} className="h-full pb-2" />
  )
)
ItemContainer.displayName = 'VirtualizedUserGridItem'

export function UsersGridVirtuoso({
    users,
    onEdit,
    onToggleBan,
    onDelete,
    onEndReached
}: UsersGridVirtuosoProps) {
    const getRoleBadge = (role: string) => {
        const icons: Record<string, React.ReactNode> = {
            admin: <Crown className="h-3 w-3" />,
            subscriber: <Package className="h-3 w-3" />,
            user: <Users className="h-3 w-3" />,
        }
        const icon = icons[role] || icons.user
        return (
            <Badge variant="outline" className={cn("gap-1 font-medium text-[9px] uppercase tracking-wider", getRoleBadgeClass(role))}>
                {icon}
                {role === 'admin' ? 'Admin' : role === 'subscriber' ? 'Assinante' : 'Usuário'}
            </Badge>
        )
    }

    const getSubscriptionBadge = (subscription: User['subscription']) => {
        if (!subscription || subscription.status !== 'active') {
            return <span className="text-[9px] text-muted-foreground/30 italic uppercase tracking-wider">—</span>
        }
        return (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest">
                {subscription.planName || 'Ativo'}
            </Badge>
        )
    }

    const [scrollParent, setScrollParent] = React.useState<HTMLElement | undefined>(undefined)

    React.useEffect(() => {
        const el = document.getElementById('crud-scroll-container')
        if (el) setScrollParent(el)
    }, [])

    return (
        <div className="h-full min-h-[500px]">
            <VirtuosoGrid
                data={users}
                endReached={onEndReached}
                customScrollParent={scrollParent}
                increaseViewportBy={400}
                components={{
                    List: ListContainer,
                    Item: ItemContainer,
                }}
                itemContent={(index, user) => (
                    <div
                        className={cn(
                            "group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full flex flex-col",
                            user.banned && "bg-destructive/5 opacity-80"
                        )}
                        onClick={() => onEdit(user)}
                    >
                        <div className="flex p-4 gap-4 flex-1">
                            <Avatar className="h-14 w-14 border border-border/50 shadow-sm shrink-0">
                                <AvatarImage src={user.image || ''} alt={user.name} />
                                <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                    {user.name?.slice(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0 pr-8">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-[14px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                                        {user.name}
                                    </h3>
                                    {user.banned && (
                                        <Badge variant="destructive" className="text-[8px] px-1.5 py-0 font-black shrink-0">
                                            BANIDO
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground/60 truncate font-medium mb-2">{user.email}</p>
                                <div className="flex items-center gap-2">
                                    {getRoleBadge(user.role)}
                                    {user.emailVerified && (
                                        <MailCheck className="h-3.5 w-3.5 text-emerald-500" />
                                    )}
                                </div>
                            </div>

                            <div
                                className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PermissionGuard action="update" subject="User">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm"
                                        onClick={() => onEdit(user)}
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard action="update" subject="User">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm transition-colors",
                                            user.banned
                                                ? "text-emerald-500 hover:bg-emerald-500/10"
                                                : "text-amber-500 hover:bg-amber-500/10"
                                        )}
                                        onClick={() => onToggleBan(user)}
                                    >
                                        {user.banned ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                    </Button>
                                </PermissionGuard>
                                <PermissionGuard action="delete" subject="User">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg bg-background/90 backdrop-blur-sm shadow-sm text-destructive hover:text-destructive"
                                        onClick={() => onDelete(user.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </PermissionGuard>
                            </div>
                        </div>

                        <div className="border-t border-border/40 px-4 py-2.5 bg-muted/5 flex items-center justify-between">
                            {getSubscriptionBadge(user.subscription)}
                            <div className="flex items-center gap-1.5 font-bold text-[9px] text-primary uppercase tracking-[0.1em]">
                                <Calendar className="h-3 w-3 opacity-30" />
                                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>
                )}
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
