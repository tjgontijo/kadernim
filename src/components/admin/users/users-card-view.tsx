'use client'

import * as React from 'react'
import { Edit, Trash2, Shield, User, Star, Ban, Mail, Phone, Calendar } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useAbility } from '@/components/auth/permission-guard'

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

type UsersCardViewProps = {
    users: UserData[]
    onView?: (userId: string) => void
    onEdit?: (userId: string) => void
    onDelete?: (userId: string) => void
    onToggleBan?: (userId: string) => void
}

export function UsersCardView({ users, onView, onEdit, onDelete, onToggleBan }: UsersCardViewProps) {
    const ability = useAbility()
    const getInitials = (name: string) => {
        if (!name) return '??'
        return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge variant="destructive" className="text-[10px]">Admin</Badge>
            case 'subscriber':
                return <Badge className="text-[10px] bg-primary">Assinante</Badge>
            default:
                return <Badge variant="outline" className="text-[10px]">Usuário</Badge>
        }
    }

    return (
        <TooltipProvider>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={cn(
                            "group relative rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/40 hover:shadow-md cursor-pointer",
                            user.banned && "border-red-200 bg-red-50/10"
                        )}
                        onClick={() => {
                            if (ability.can('update', 'User')) {
                                onEdit?.(user.id)
                            }
                        }}
                    >
                        {/* Main content */}
                        <div className="flex p-3 gap-3">
                            {/* Avatar column */}
                            <div className="relative shrink-0">
                                <Avatar className="h-12 w-12 border border-border/50">
                                    <AvatarImage src={user.image || ''} alt={user.name} />
                                    <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.banned && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-background">
                                        <Ban className="h-2 w-2 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content column */}
                            <div className="flex-1 min-w-0 pr-8">
                                <h3 className="font-semibold text-sm text-foreground truncate leading-tight mb-0.5">
                                    {user.name}
                                </h3>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-0.5">
                                        <Phone className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{user.phone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions - hover */}
                            <div
                                className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PermissionGuard action="update" subject="User">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg"
                                                onClick={() => onEdit?.(user.id)}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">Editar</TooltipContent>
                                    </Tooltip>
                                </PermissionGuard>
                            </div>
                        </div>

                        {/* Bottom info */}
                        <div className="border-t border-border/50 px-3 py-2 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {getRoleBadge(user.role)}
                                {user.subscription?.isActive && (
                                    <Badge variant="outline" className="text-[10px] border-green-500/20 bg-green-500/5 text-green-600">
                                        Assinante Ativo
                                    </Badge>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(user.createdAt).getFullYear()}
                            </div>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                    </div>
                )}
            </div>
        </TooltipProvider>
    )
}
