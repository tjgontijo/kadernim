'use client'

import React, { useState, useEffect } from 'react'
import {
    X,
    User,
    Shield,
    Ban,
    CheckCircle2,
    XCircle,
    Loader2,
    Camera,
    Lock
} from 'lucide-react'
import { cn } from '@/lib/utils/index'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    useUpdateAdminUser,
    useUploadUserAvatar,
    useUserAccess,
    useToggleUserAccess
} from '@/hooks/admin/use-admin-users'
import { toast } from 'sonner'
import imageCompression from 'browser-image-compression'
import {
    applyWhatsAppMask,
    removeWhatsAppMask,
    normalizeWhatsApp,
    denormalizeWhatsApp
} from '@/lib/utils/phone'
import { AvatarCropper } from '@/components/shared/avatar-cropper'

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

interface UserEditDrawerProps {
    user: UserData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UserEditDrawer({ user, open, onOpenChange, onSuccess }: UserEditDrawerProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const [resourceSearch, setResourceSearch] = useState('')
    const [localAccess, setLocalAccess] = useState<Record<string, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [tempAvatar, setTempAvatar] = useState<string | null>(null)
    const [isCropOpen, setIsCropOpen] = useState(false)

    const updateMutation = useUpdateAdminUser()
    const uploadMutation = useUploadUserAvatar()
    const { data: accessList, isLoading: isLoadingAccess } = useUserAccess(user?.id || '')
    const toggleAccessMutation = useToggleUserAccess()

    useEffect(() => {
        if (user) {
            setName(user.name)
            setEmail(user.email)
            const denormalized = denormalizeWhatsApp(user.phone || '')
            setPhone(applyWhatsAppMask(denormalized))
            setRole(user.role)
        }
    }, [user])

    useEffect(() => {
        if (accessList) {
            const initialAccess: Record<string, boolean> = {}
            accessList.forEach(item => {
                initialAccess[item.id] = item.hasAccess
            })
            setLocalAccess(initialAccess)
        }
    }, [accessList])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setPhone(applyWhatsAppMask(val))
    }

    const handleSave = async () => {
        if (!user) return
        setIsSaving(true)

        try {
            // 1. Identificar mudanças de acesso
            const accessChanges = accessList?.filter(item => {
                return (localAccess[item.id] ?? false) !== item.hasAccess
            }) || []

            // 2. Preparar promises de acesso
            const accessPromises = accessChanges.map(item =>
                toggleAccessMutation.mutateAsync({
                    userId: user.id,
                    resourceId: item.id,
                    hasAccess: localAccess[item.id]
                })
            )

            // 3. Executar o update principal e os acessos em paralelo
            await Promise.all([
                updateMutation.mutateAsync({
                    userId: user.id,
                    data: {
                        name,
                        email,
                        phone: phone ? normalizeWhatsApp(removeWhatsAppMask(phone)) : null,
                        role: role as any
                    }
                }),
                ...accessPromises
            ])

            toast.success('Usuário atualizado com sucesso')
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        // Validate size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB')
            return
        }

        // Validate type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Formato não suportado. Use JPG ou PNG.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setTempAvatar(reader.result as string)
            setIsCropOpen(true)
        }
        reader.readAsDataURL(file)

        // Reset input value
        e.target.value = ''
    }

    const handleCropComplete = async (file: File) => {
        if (!user) return
        setIsUploading(true)
        try {
            await uploadMutation.mutateAsync({
                userId: user.id,
                file: file
            })

            toast.success('Avatar atualizado')
            onSuccess?.()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Erro ao subir avatar')
        } finally {
            setIsUploading(false)
        }
    }

    const filteredAccess = accessList?.filter(r =>
        r.title.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.subject.toLowerCase().includes(resourceSearch.toLowerCase())
    )

    if (!user) return null

    const getRoleBadge = (r: string) => {
        switch (r) {
            case 'admin': return <Badge className="bg-primary text-primary-foreground font-black uppercase text-[10px]">Admin</Badge>
            case 'subscriber': return <Badge variant="secondary" className="font-black uppercase text-[10px]">Assinante</Badge>
            default: return <Badge variant="outline" className="font-black uppercase text-[10px]">Usuário</Badge>
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
            <DrawerContent className="h-[100dvh] max-h-none rounded-none border-none data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="mx-auto w-full max-w-7xl flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="border-b pb-4 shrink-0 px-6">
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                Editar Usuário
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                    <X className="h-4 w-4" />
                                </Button>
                            </DrawerClose>
                        </div>
                        <DrawerDescription className="sr-only">Formulário para edição dos dados cadastrais, avatar e níveis de acesso do usuário.</DrawerDescription>
                    </DrawerHeader>

                    <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pt-6 shrink-0">
                            <TabsList className="w-full sm:w-[400px] grid grid-cols-2 rounded-xl bg-muted/50 p-1">
                                <TabsTrigger value="info" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Informações
                                </TabsTrigger>
                                <TabsTrigger value="access" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    Acesso ({user.resourceAccessCount})
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 space-y-8 focus-visible:outline-none scrollbar-thin">
                            {/* Avatar Section / Card */}
                            <div className="flex flex-col items-center gap-4 py-8 bg-muted/20 rounded-3xl border border-muted-foreground/5 relative overflow-hidden">
                                <div className="absolute top-4 right-4 z-20">
                                    <PermissionGuard action="manage" subject="User" fallback={null}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                                    <Lock className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1 shadow-2xl border-muted-foreground/10">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-3 py-2">
                                                    Nível de Acesso
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => setRole('user')}
                                                    className={cn("rounded-xl py-2 px-3 font-bold", role === 'user' && "bg-primary/5 text-primary")}
                                                >
                                                    <User className="mr-2 h-4 w-4" /> Usuário Comum
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setRole('subscriber')}
                                                    className={cn("rounded-xl py-2 px-3 font-bold", role === 'subscriber' && "bg-primary/5 text-primary")}
                                                >
                                                    <Shield className="mr-2 h-4 w-4" /> Assinante
                                                </DropdownMenuItem>
                                                <PermissionGuard roles={['admin']}>
                                                    <DropdownMenuItem
                                                        onClick={() => setRole('admin')}
                                                        className={cn("rounded-xl py-2 px-3 font-black text-primary", role === 'admin' && "bg-primary/10")}
                                                    >
                                                        <Shield className="mr-2 h-4 w-4" /> Administrador
                                                    </DropdownMenuItem>
                                                </PermissionGuard>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </PermissionGuard>
                                </div>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 animate-in fade-in">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <span className="text-sm font-bold text-primary">Enviando imagem...</span>
                                    </div>
                                )}
                                <div className="relative group">
                                    <Avatar className="h-28 w-28 border-4 border-background shadow-2xl relative transition-transform duration-300 group-hover:scale-105">
                                        <AvatarImage src={user.image || ''} className="rounded-full object-cover" />
                                        <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-all border-2 border-background"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleAvatarUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center gap-2">
                                        <h4 className="font-black text-xl text-foreground">{name || 'Sem nome'}</h4>
                                        {getRoleBadge(role)}
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">{email}</p>
                                </div>
                            </div>

                            {/* Form Grid */}
                            <div className="grid gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">
                                        Nome Completo
                                    </Label>
                                    <div className="relative group/input">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-14 pl-12 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base transition-all"
                                            placeholder="Nome completo do usuário"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">
                                            E-mail de Cadastro
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-14 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base transition-all"
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="phone" className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">
                                            WhatsApp / Celular
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            className="h-14 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base transition-all"
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                {/* Status Dashboard */}
                                <div className="space-y-4 pt-4">
                                    <Label className="text-xs uppercase font-black tracking-[0.15em] text-muted-foreground/70">
                                        Status e Assinatura
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/50">E-mail</span>
                                            {user.emailVerified ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                                                    <CheckCircle2 className="h-4 w-4" /> Verificado
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-sm">
                                                    <XCircle className="h-4 w-4" /> Pendente
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/50">Conta</span>
                                            {user.banned ? (
                                                <div className="flex items-center gap-1.5 text-destructive font-bold text-sm">
                                                    <Ban className="h-4 w-4" /> Banida
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                                                    <CheckCircle2 className="h-4 w-4" /> Ativa
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/5">
                                            <span className="text-[10px] uppercase font-black text-muted-foreground/50">Assinatura</span>
                                            {user.subscription?.isActive ? (
                                                <div className="flex flex-col">
                                                    <span className="text-primary font-black text-sm uppercase italic">Premium</span>
                                                    {user.subscription.expiresAt && (
                                                        <span className="text-[9px] text-muted-foreground font-bold">
                                                            Até {new Date(user.subscription.expiresAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground font-bold text-sm">Nenhuma</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="access" className="flex-1 flex flex-col overflow-hidden focus-visible:outline-none">
                            <PermissionGuard action="update" subject="User" fallback={
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                    <Lock className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                    <p className="font-bold text-muted-foreground">Acesso Negado</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Você não tem permissão para gerenciar acessos individuais.</p>
                                </div>
                            }>
                                <div className="p-6 pb-2 shrink-0">
                                    <div className="relative group">
                                        <Input
                                            placeholder="Buscar materiais por título ou componente..."
                                            className="h-14 pl-12 bg-muted/30 border-muted-foreground/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-base transition-all"
                                            value={resourceSearch}
                                            onChange={(e) => setResourceSearch(e.target.value)}
                                        />
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin">
                                    {isLoadingAccess ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                            <span className="text-sm font-bold text-muted-foreground">Carregando catálogo...</span>
                                        </div>
                                    ) : filteredAccess?.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed text-center px-10">
                                            <Shield className="h-10 w-10 text-muted-foreground/20 mb-3" />
                                            <p className="font-bold text-muted-foreground">Nenhum recurso encontrado.</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">Tente buscar por termos diferentes ou verifique a conexão.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-3 pb-4">
                                            {filteredAccess?.map((res) => (
                                                <label
                                                    key={res.id}
                                                    className={cn(
                                                        "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md",
                                                        localAccess[res.id]
                                                            ? "bg-primary/5 border-primary/20 shadow-sm"
                                                            : "bg-background border-muted-foreground/10 hover:border-primary/20 hover:bg-muted/30"
                                                    )}
                                                >
                                                    <div className="flex flex-col min-w-0 pr-4">
                                                        <span className={cn(
                                                            "text-sm font-black truncate transition-colors",
                                                            localAccess[res.id] ? "text-primary" : "text-foreground"
                                                        )}>
                                                            {res.title}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[9px] h-4 font-black bg-background/50 border-muted-foreground/10 uppercase tracking-tighter">
                                                                {res.educationLevel}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground/30">•</span>
                                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tight">{res.subject}</span>
                                                            {res.isFree && (
                                                                <span className="text-[10px] text-green-600 font-black uppercase italic ml-auto pl-2">Gratis</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0">
                                                        <Checkbox
                                                            checked={localAccess[res.id]}
                                                            onCheckedChange={(checked: boolean) => {
                                                                setLocalAccess(prev => ({
                                                                    ...prev,
                                                                    [res.id]: !!checked
                                                                }))
                                                            }}
                                                            className="h-6 w-6 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                        />
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </PermissionGuard>
                        </TabsContent>
                    </Tabs>

                    <DrawerFooter className="border-t pt-6 bg-background/80 backdrop-blur-md shrink-0 px-6 pb-10">
                        <div className="flex gap-4">
                            <DrawerClose asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted transition-all"
                                    disabled={isSaving}
                                >
                                    Descartar
                                </Button>
                            </DrawerClose>
                            <Button
                                className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                onClick={handleSave}
                                disabled={isSaving || isUploading}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-3" />
                                        Processando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
            <AvatarCropper
                image={tempAvatar}
                open={isCropOpen}
                onOpenChange={setIsCropOpen}
                onCropComplete={handleCropComplete}
            />
        </Drawer>
    )
}
