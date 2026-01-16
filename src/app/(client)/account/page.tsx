'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    User,
    Mail,
    Phone,
    Calendar,
    Crown,
    Loader2,
    Check,
    ExternalLink,
    Sparkles,
    Camera,
    Pencil,
    Settings,
    Smartphone,
    RefreshCw,
    Trash2,
    LogOut,
    Shield,
    Download,
    AlertCircle
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    applyWhatsAppMask,
    removeWhatsAppMask,
    normalizeWhatsApp,
    denormalizeWhatsApp
} from '@/lib/utils/phone'
import { AvatarCropper } from '@/components/ui/avatar-cropper'
import { ProfileSkeleton } from '@/components/client/shared/skeletons/profile-skeleton'
import { usePwa } from '@/hooks/use-pwa'
import { signOut } from '@/lib/auth'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface AccountData {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    role: string
    emailVerified: boolean
    createdAt: string
    subscription: {
        id: string
        isActive: boolean
        purchaseDate: string
        expiresAt: string | null
    } | null
}

export default function AccountPage() {
    const queryClient = useQueryClient()
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
    const [tempAvatar, setTempAvatar] = useState<string | null>(null)
    const [isCropOpen, setIsCropOpen] = useState(false)
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
    const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
    const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false)
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
    const [isRevokingSessions, setIsRevokingSessions] = useState(false)

    const {
        version,
        isPwa,
        hasUpdate,
        isUpdating,
        checkForUpdate,
        applyUpdate,
        clearCache,
        isClearing,
    } = usePwa()

    const { data: account, isLoading } = useQuery<AccountData>({
        queryKey: ['account'],
        queryFn: async () => {
            const res = await fetch('/api/v1/account')
            if (!res.ok) throw new Error('Erro ao carregar conta')
            return res.json()
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (data: { name?: string; phone?: string | null }) => {
            const res = await fetch('/api/v1/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Erro ao atualizar')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['account'] })
            queryClient.invalidateQueries({ queryKey: ['session'] })
            setIsEditingProfile(false)
            toast.success('Perfil atualizado!')
        },
        onError: () => {
            toast.error('Erro ao atualizar perfil')
        },
    })

    const avatarMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/v1/account/avatar', {
                method: 'POST',
                body: formData,
            })
            if (!res.ok) throw new Error('Erro ao atualizar avatar')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['account'] })
            queryClient.invalidateQueries({ queryKey: ['session'] })
            toast.success('Foto atualizada!')
        },
        onError: () => {
            toast.error('Erro ao atualizar foto')
        },
    })

    const handleEditStart = () => {
        if (account) {
            setEditName(account.name)
            setEditPhone(applyWhatsAppMask(denormalizeWhatsApp(account.phone || '')))
            setIsEditingProfile(true)
        }
    }

    const handleEditSave = () => {
        updateMutation.mutate({
            name: editName,
            phone: editPhone ? normalizeWhatsApp(removeWhatsAppMask(editPhone)) : null,
        })
    }

    const handleEditCancel = () => {
        setIsEditingProfile(false)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditPhone(applyWhatsAppMask(e.target.value))
    }

    const handleSubscribe = () => {
        // Link para checkout da Yampi
        window.open('https://seguro.profdidatica.com.br/r/TMNDJH4WEN', '_blank', 'noopener,noreferrer')
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

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

        // Reset input value so same file can be selected again
        e.target.value = ''
    }

    const handleCropComplete = async (file: File) => {
        setIsUploadingAvatar(true)
        try {
            await avatarMutation.mutateAsync(file)
        } catch (error) {
            console.error('Upload error:', error)
        } finally {
            setIsUploadingAvatar(false)
        }
    }

    const handleCheckUpdate = async () => {
        setIsCheckingUpdate(true)
        try {
            const hasNewUpdate = await checkForUpdate()
            if (hasNewUpdate) {
                toast.success('Nova versão disponível!')
            } else {
                toast.info('Você já está na versão mais recente')
            }
        } catch {
            toast.error('Erro ao verificar atualizações')
        } finally {
            setIsCheckingUpdate(false)
        }
    }

    const handleClearCache = async () => {
        try {
            await clearCache()
            toast.success('Cache limpo com sucesso! Recarregando...')
            setTimeout(() => window.location.reload(), 1000)
        } catch {
            toast.error('Erro ao limpar cache')
        }
        setShowClearCacheDialog(false)
    }

    const handleRevokeAllSessions = async () => {
        setIsRevokingSessions(true)
        try {
            const res = await fetch('/api/v1/account/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ revokeAll: true }),
            })
            if (!res.ok) throw new Error('Erro ao revogar sessões')
            toast.success('Todas as sessões foram encerradas')
            await signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login' } } })
        } catch {
            toast.error('Erro ao encerrar sessões')
        } finally {
            setIsRevokingSessions(false)
            setShowLogoutAllDialog(false)
        }
    }

    const handleLogout = async () => {
        await signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login' } } })
    }

    if (isLoading) {
        return <ProfileSkeleton />
    }

    if (!account) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Erro ao carregar dados da conta
            </div>
        )
    }

    const subscription = account.subscription
    const daysRemaining = subscription?.expiresAt
        ? differenceInDays(new Date(subscription.expiresAt), new Date())
        : null

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 py-8">
            {/* Unified Card: Profile + Details */}
            <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden pt-12 relative">
                {/* Edit Button - Top Right */}
                {!isEditingProfile && (
                    <button
                        onClick={handleEditStart}
                        className="absolute top-6 right-6 p-2.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all shadow-sm border border-primary/20 hover:scale-110 active:scale-95 z-10"
                        title="Editar Perfil"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                )}

                <CardContent className="p-8 pt-0">
                    {/* Header: Avatar & Name */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="relative group">
                            <Avatar
                                className="h-40 w-40 border-[6px] border-background shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                                onClick={() => account.image && setIsImagePreviewOpen(true)}
                            >
                                <AvatarImage src={account.image || ''} className="object-cover" />
                                <AvatarFallback className="text-4xl font-black bg-primary/5 text-primary/40 backdrop-blur-sm">
                                    {account.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                </AvatarFallback>
                            </Avatar>

                            {isUploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md rounded-full z-10">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                </div>
                            )}

                            <label
                                htmlFor="avatar-upload-main"
                                className="absolute bottom-1 right-1 p-2 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-primary rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all border border-border opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110 active:scale-95"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </label>
                            <input
                                type="file"
                                id="avatar-upload-main"
                                className="hidden"
                                accept="image/jpeg,image/png,image/jpg"
                                onChange={handleAvatarUpload}
                                disabled={isUploadingAvatar}
                            />
                        </div>

                        <div className="mt-6 flex flex-col items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tighter text-foreground text-center">
                                {account.name}
                            </h1>

                            <div className="flex items-center gap-2">
                                {account.role === 'admin' && (
                                    <Badge className="bg-purple-500/10 text-purple-600 border-purple-200/50 font-bold px-3 py-0.5 rounded-full">
                                        <Crown className="h-3.5 w-3.5 mr-1.5" />
                                        Admin
                                    </Badge>
                                )}
                                {account.role === 'subscriber' && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-0.5 rounded-full">
                                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                        Assinante
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {isEditingProfile ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                                    <Input
                                        id="edit-name"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Seu nome"
                                        className="h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editPhone}
                                        onChange={handlePhoneChange}
                                        placeholder="(00) 00000-0000"
                                        className="h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={handleEditCancel}
                                    disabled={updateMutation.isPending}
                                    className="flex-1 h-12 rounded-2xl font-bold"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleEditSave}
                                    disabled={updateMutation.isPending || !editName}
                                    className="flex-[2] h-12 rounded-2xl font-bold shadow-lg shadow-primary/20"
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid gap-6">
                                <div className="flex items-center gap-4 transition-all hover:translate-x-1">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">E-mail</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground">{account.email}</span>
                                            {account.emailVerified && (
                                                <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center" title="E-mail Verificado">
                                                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 transition-all hover:translate-x-1">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">WhatsApp</span>
                                        <span className="font-bold text-foreground">
                                            {account.phone
                                                ? applyWhatsAppMask(denormalizeWhatsApp(account.phone))
                                                : <span className="text-muted-foreground/40 italic font-medium">Não informado</span>}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 transition-all hover:translate-x-1">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Membro desde</span>
                                        <span className="font-bold text-foreground">
                                            {format(new Date(account.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card: Assinatura */}
            <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-500/10 rounded-2xl">
                                <Crown className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Assinatura</CardTitle>
                                <CardDescription className="font-medium">Gestão do seu plano premium</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8">
                    {/* Admin - Acesso total */}
                    {account.role === 'admin' && (
                        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                <Settings className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-black text-purple-900 dark:text-purple-300">Acesso Administrativo</h4>
                                <p className="text-sm text-purple-600/70 font-medium">Você possui privilégios de acesso total vitalício.</p>
                            </div>
                        </div>
                    )}

                    {/* Subscriber com assinatura ativa */}
                    {account.role === 'subscriber' && subscription?.isActive && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black px-4 py-1 rounded-full uppercase text-[10px] tracking-widest">
                                        Assinatura Ativa
                                    </Badge>
                                </div>
                            </div>

                            {subscription.expiresAt && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Próxima Renovação</span>
                                            <span className="font-black text-foreground text-lg">
                                                {format(new Date(subscription.expiresAt), "d MMM yyyy", { locale: ptBR })}
                                            </span>
                                        </div>

                                        {daysRemaining !== null && (
                                            <div className="text-right">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Tempo Restante</span>
                                                <div className={cn(
                                                    "text-lg font-black",
                                                    daysRemaining > 30 ? "text-emerald-600" :
                                                        daysRemaining > 7 ? "text-amber-600" : "text-red-600"
                                                )}>
                                                    {daysRemaining} dias
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {daysRemaining !== null && (
                                        <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden p-0.5">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
                                                    daysRemaining > 30 ? "bg-emerald-500" :
                                                        daysRemaining > 7 ? "bg-amber-500" : "bg-red-500"
                                                )}
                                                style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 365) * 100))}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {!subscription.expiresAt && (
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-primary">Acesso Vitalício</h4>
                                        <p className="text-sm text-primary/70 font-medium">Sua conta premium não possui data de expiração.</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-muted-foreground/10 hover:bg-muted transition-all active:scale-[0.98]"
                                onClick={handleSubscribe}
                            >
                                <ExternalLink className="h-4 w-4 mr-3" />
                                Renovar / Estender Plano
                            </Button>
                        </div>
                    )}

                    {/* Subscriber com assinatura expirada ou user comum */}
                    {account.role !== 'admin' && !(account.role === 'subscriber' && subscription?.isActive) && (
                        <div className="space-y-6">
                            <div className="text-center py-8 px-4 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background mb-4 shadow-sm border border-muted-foreground/5">
                                    <Sparkles className="h-8 w-8 text-primary/40" />
                                </div>
                                <h3 className="font-black text-xl tracking-tight mb-2">
                                    {subscription && !subscription.isActive
                                        ? 'Assinatura Expirada'
                                        : 'Seja Premium'}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
                                    {subscription && !subscription.isActive
                                        ? 'Sua assinatura terminou. Renove agora para recuperar o acesso a todos os materiais.'
                                        : 'Desbloqueie o acesso completo a todos os recursos e materiais exclusivos da plataforma.'}
                                </p>
                            </div>

                            <Button
                                className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                onClick={handleSubscribe}
                            >
                                <Crown className="h-5 w-5 mr-3" />
                                {subscription && !subscription.isActive ? 'Renovar Assinatura' : 'Quero ser Premium'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card: Gerenciamento do App */}
            <Card className="border-none shadow-xl shadow-foreground/5 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-500/10 rounded-2xl">
                                <Smartphone className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black tracking-tight">Aplicativo</CardTitle>
                                <CardDescription className="font-medium">Gerenciamento e configurações do app</CardDescription>
                            </div>
                        </div>
                        {version && (
                            <Badge variant="outline" className="font-mono text-xs">
                                v{version.version}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-4">
                    {/* Status do App */}
                    <div className="p-4 rounded-2xl bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-medium">Modo de instalação</span>
                            <Badge variant={isPwa ? "default" : "secondary"} className="font-bold">
                                {isPwa ? 'App Instalado' : 'Navegador'}
                            </Badge>
                        </div>
                        {version && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground font-medium">Versão atual</span>
                                <span className="font-mono text-sm font-bold">{version.version}</span>
                            </div>
                        )}
                    </div>

                    {/* Atualização */}
                    {hasUpdate ? (
                        <Button
                            onClick={applyUpdate}
                            disabled={isUpdating}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                        >
                            {isUpdating ? (
                                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 mr-3" />
                            )}
                            {isUpdating ? 'Atualizando...' : 'Instalar Atualização'}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleCheckUpdate}
                            disabled={isCheckingUpdate}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-muted-foreground/10 hover:bg-muted transition-all active:scale-[0.98]"
                        >
                            {isCheckingUpdate ? (
                                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-3" />
                            )}
                            {isCheckingUpdate ? 'Verificando...' : 'Verificar Atualizações'}
                        </Button>
                    )}

                    {/* Limpar Cache */}
                    <Button
                        variant="outline"
                        onClick={() => setShowClearCacheDialog(true)}
                        disabled={isClearing}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-muted-foreground/10 hover:bg-muted transition-all active:scale-[0.98]"
                    >
                        {isClearing ? (
                            <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-3" />
                        )}
                        {isClearing ? 'Limpando...' : 'Limpar Cache do App'}
                    </Button>

                    <div className="pt-4 border-t border-border/50 space-y-4">
                        {/* Sair de todas as sessões */}
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutAllDialog(true)}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50 transition-all active:scale-[0.98]"
                        >
                            <Shield className="h-4 w-4 mr-3" />
                            Sair de Todos os Dispositivos
                        </Button>

                        {/* Sair */}
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-[0.98]"
                        >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sair da Conta
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog: Limpar Cache */}
            <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Limpar Cache do Aplicativo
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso irá remover todos os dados em cache do aplicativo. Você continuará logado, mas precisará baixar os dados novamente. A página será recarregada após a limpeza.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearCache} className="bg-amber-600 hover:bg-amber-700">
                            Limpar Cache
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog: Sair de Todas as Sessões */}
            <AlertDialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-500" />
                            Sair de Todos os Dispositivos
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Isso irá encerrar todas as suas sessões ativas em todos os dispositivos, incluindo este. Você precisará fazer login novamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRevokingSessions}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevokeAllSessions}
                            disabled={isRevokingSessions}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isRevokingSessions ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Encerrando...
                                </>
                            ) : (
                                'Sair de Todos'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AvatarCropper
                image={tempAvatar}
                open={isCropOpen}
                onOpenChange={setIsCropOpen}
                onCropComplete={handleCropComplete}
            />

            {/* Image Preview Dialog */}
            <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {account.image && (
                            <img
                                src={account.image}
                                alt={account.name}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
