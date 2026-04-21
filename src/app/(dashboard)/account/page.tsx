'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Mail,
    Phone,
    Calendar,
    Crown,
    Loader2,
    Check,
    Sparkles,
    Camera,
    Pencil,
    LogOut,
    Shield,
    CreditCard,
    Receipt,
    History
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
    applyWhatsAppMask,
    removeWhatsAppMask,
    normalizeWhatsApp,
    denormalizeWhatsApp
} from '@/lib/utils/phone'
import { AvatarCropper } from '@/components/shared/avatar-cropper'
import { ProfileSkeleton } from '@/components/dashboard/shared/skeletons/profile-skeleton'

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
    latestVersion?: {
        version: string
        buildAt: string
    } | null
}

interface BillingOverviewData {
    subscription: {
        id: string
        status: string
        isActive: boolean
        createdAt: string
        expiresAt: string | null
        paymentMethod: 'CREDIT_CARD' | 'PIX' | 'PIX_AUTOMATIC' | null
        failureReason: string | null
        failureCount: number
        nextRetryAt: string | null
        lastFailureMessage: string | null
    } | null
    invoices: Array<{
        id: string
        status: string
        value: number
        dueDate: string
        description: string | null
        invoiceUrl: string | null
        createdAt: string
    }>
}

type BillingPaymentMethod = NonNullable<BillingOverviewData['subscription']>['paymentMethod']

function formatPaymentMethod(method: BillingPaymentMethod) {
    if (method === 'CREDIT_CARD') return 'Cartão de crédito'
    if (method === 'PIX_AUTOMATIC') return 'PIX automático'
    if (method === 'PIX') return 'PIX mensal'
    return 'Não informado'
}

function formatInvoiceStatus(status: string) {
    if (status === 'RECEIVED' || status === 'CONFIRMED') return 'Pago'
    if (status === 'PENDING') return 'Pendente'
    if (status === 'OVERDUE') return 'Atrasado'
    if (status === 'FAILED') return 'Falhou'
    if (status === 'CANCELED') return 'Cancelado'
    return status
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
    const [isRevokingSessions, setIsRevokingSessions] = useState(false)
    const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false)
    const [showBillingDetailsDialog, setShowBillingDetailsDialog] = useState(false)


    const { data: account, isLoading } = useQuery<AccountData>({
        queryKey: ['account'],
        queryFn: async () => {
            const res = await fetch('/api/v1/account')
            if (!res.ok) throw new Error('Erro ao carregar conta')
            return res.json()
        },
    })

    const { data: billingOverview, isLoading: isBillingLoading } = useQuery<BillingOverviewData>({
        queryKey: ['billing-overview'],
        enabled: showBillingDetailsDialog,
        queryFn: async () => {
            const res = await fetch('/api/v1/billing/overview')
            if (!res.ok) throw new Error('Erro ao carregar assinatura')
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
        window.location.href = '/checkout'
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

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 px-4 sm:px-0 pt-8 pb-16">
            {/* Unified Card: Profile + Details */}
            <Card className="relative overflow-hidden rounded-4 border border-line bg-card shadow-1 paper-grain pt-10">
                {/* Edit Button - Top Right */}
                {!isEditingProfile && (
                    <button
                        onClick={handleEditStart}
                        className="absolute top-6 right-6 rounded-full border border-line bg-paper-2 p-2.5 text-ink-soft shadow-1 transition-all hover:text-terracotta z-10"
                        title="Editar Perfil"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                )}

                <CardContent className="p-8 pt-0">
                    {/* Header: Avatar & Name */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <Avatar
                                className="data-[size=default]:size-40 h-40 w-40 !rounded-full border-[6px] border-line shadow-2 relative transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
                                onClick={() => account.image && setIsImagePreviewOpen(true)}
                            >
                                <AvatarImage src={account.image || ''} className="object-cover !rounded-full" />
                                <AvatarFallback className="text-4xl font-black bg-paper-2 text-ink-mute !rounded-full">
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
                                className="absolute bottom-2 right-2 rounded-full border border-line bg-paper p-2.5 text-ink-mute shadow-1 transition-all hover:text-terracotta opacity-100 md:opacity-0 md:group-hover:opacity-100"
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
                            <h1 className="text-center font-display text-4xl font-semibold tracking-tight text-ink">
                                {account.name}
                            </h1>

                            <div className="flex items-center gap-2">
                                {account.role === 'admin' && (
                                    <Badge className="bg-paper-2 text-ink border-line font-bold px-3 py-0.5 rounded-full">
                                        <Crown className="h-3.5 w-3.5 mr-1.5" />
                                        Admin
                                    </Badge>
                                )}
                                {account.role === 'subscriber' && (
                                    <Badge className="bg-sage-2 text-sage border-sage/20 font-bold px-3 py-0.5 rounded-full">
                                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                        Assinante
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs font-medium text-ink-mute mt-1">
                                Clique na foto para visualizar ou atualizar
                            </p>
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
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-3 border border-line bg-paper-2 flex items-center justify-center text-terracotta">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-mute">E-mail</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-ink">{account.email}</span>
                                            {account.emailVerified && (
                                                <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center" title="E-mail Verificado">
                                                    <Check className="h-2.5 w-2.5 text-emerald-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-3 border border-line bg-paper-2 flex items-center justify-center text-terracotta">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-mute">WhatsApp</span>
                                        <span className="font-bold text-ink">
                                            {account.phone
                                                ? applyWhatsAppMask(denormalizeWhatsApp(account.phone))
                                                : <span className="text-ink-faint italic font-medium">Não informado</span>}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-3 border border-line bg-paper-2 flex items-center justify-center text-terracotta">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Membro desde</span>
                                        <span className="font-bold text-ink">
                                            {format(new Date(account.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card: Assinatura (resumo) */}
            <Card className="overflow-hidden rounded-4 border border-line bg-card shadow-1">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-mustard-2 rounded-3 border border-line">
                            <Crown className="h-6 w-6 text-ink" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-display font-semibold tracking-tight">Assinatura</CardTitle>
                            <CardDescription className="font-medium text-ink-mute">Resumo do seu plano atual</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-5">
                    {account.role === 'admin' ? (
                        <div className="p-4 rounded-3 bg-paper-2 border border-line">
                            <p className="font-black text-ink">Acesso administrativo</p>
                            <p className="text-sm text-ink-mute mt-1">Conta com privilégios de administração.</p>
                        </div>
                    ) : subscription?.isActive ? (
                        <div className="space-y-3">
                            <Badge className="bg-sage-2 text-sage border-sage/20 font-black px-3 py-0.5 rounded-full uppercase text-[10px] tracking-widest">
                                Assinatura ativa
                            </Badge>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Plano</p>
                                    <p className="font-bold text-ink mt-1">Kadernim Pro</p>
                                </div>
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Próxima renovação</p>
                                    <p className="font-bold text-ink mt-1">
                                        {subscription.expiresAt
                                            ? format(new Date(subscription.expiresAt), "d 'de' MMMM", { locale: ptBR })
                                            : 'Sem expiração'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-3 border border-dashed border-line bg-paper-2 px-4 py-5 text-center">
                                <p className="font-display text-2xl font-semibold text-ink">
                                    {subscription ? 'Assinatura expirada' : 'Você ainda não é premium'}
                                </p>
                                <p className="text-sm text-ink-mute mt-1">
                                    {subscription
                                        ? 'Renove para voltar a ter acesso completo.'
                                        : 'Desbloqueie todos os recursos com o plano Kadernim Pro.'}
                                </p>
                            </div>
                            <Button
                                className="w-full h-14 rounded-3 font-black uppercase tracking-[0.12em] text-xs shadow-2"
                                onClick={handleSubscribe}
                            >
                                <Crown className="h-4 w-4 mr-3" />
                                {subscription ? 'Renovar assinatura' : 'Assinar agora'}
                            </Button>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full h-12 rounded-3 font-black uppercase tracking-widest text-[11px] border-line hover:bg-paper-2"
                        onClick={() => setShowBillingDetailsDialog(true)}
                    >
                        <History className="h-4 w-4 mr-2" />
                        Ver detalhes da assinatura
                    </Button>
                </CardContent>
            </Card>
            {/* Card: Segurança */}
            <Card className="overflow-hidden rounded-4 border border-line bg-card shadow-1">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-berry-2 rounded-3 border border-line">
                                <Shield className="h-6 w-6 text-berry" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-display font-semibold tracking-tight">Segurança</CardTitle>
                                <CardDescription className="font-medium text-ink-mute">Gerenciamento de acesso e sessões</CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 space-y-4">
                    <div className="pt-4 space-y-4">
                        {/* Sair de todas as sessões */}
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutAllDialog(true)}
                            className="w-full h-14 rounded-3 font-black uppercase tracking-widest text-xs border-berry/30 text-berry hover:bg-berry-2/60 transition-all active:scale-[0.98]"
                        >
                            <Shield className="h-4 w-4 mr-3" />
                            Sair de Todos os Dispositivos
                        </Button>

                        {/* Sair */}
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full h-14 rounded-3 font-black uppercase tracking-widest text-xs text-ink-mute hover:text-ink hover:bg-paper-2 transition-all active:scale-[0.98]"
                        >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sair da Conta
                        </Button>
                    </div>
                </CardContent>
            </Card>


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

            <Dialog open={showBillingDetailsDialog} onOpenChange={setShowBillingDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-terracotta" />
                            Detalhes da assinatura
                        </DialogTitle>
                        <DialogDescription>
                            Status do plano e histórico recente de cobrança.
                        </DialogDescription>
                    </DialogHeader>

                    {isBillingLoading ? (
                        <div className="py-10 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-ink-mute" />
                        </div>
                    ) : !billingOverview?.subscription ? (
                        <div className="space-y-4">
                            <div className="rounded-3 border border-dashed border-line bg-paper-2 px-4 py-6 text-center">
                                <p className="font-display text-2xl font-semibold text-ink">Sem assinatura ativa</p>
                                <p className="text-sm text-ink-mute mt-1">Assine o Kadernim Pro para desbloquear todos os materiais.</p>
                            </div>
                            <Button className="w-full" onClick={handleSubscribe}>
                                <Crown className="h-4 w-4 mr-2" />
                                Assinar Kadernim Pro
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Status</p>
                                    <p className="font-bold text-ink mt-1">
                                        {billingOverview.subscription.isActive ? 'Ativa' : formatInvoiceStatus(billingOverview.subscription.status)}
                                    </p>
                                </div>
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Pagamento</p>
                                    <p className="font-bold text-ink mt-1">{formatPaymentMethod(billingOverview.subscription.paymentMethod)}</p>
                                </div>
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Membro desde</p>
                                    <p className="font-bold text-ink mt-1">
                                        {format(new Date(billingOverview.subscription.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </p>
                                </div>
                                <div className="rounded-3 border border-line bg-paper-2 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-mute">Próxima renovação</p>
                                    <p className="font-bold text-ink mt-1">
                                        {billingOverview.subscription.expiresAt
                                            ? format(new Date(billingOverview.subscription.expiresAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                                            : 'Sem expiração'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-black uppercase tracking-wider text-ink-mute">Histórico recente</h4>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {billingOverview.invoices.length === 0 ? (
                                        <div className="rounded-3 border border-line bg-paper-2 px-4 py-4 text-sm text-ink-mute">
                                            Nenhuma cobrança registrada até o momento.
                                        </div>
                                    ) : (
                                        billingOverview.invoices.map((invoice) => (
                                            <div key={invoice.id} className="rounded-3 border border-line bg-paper-2 px-4 py-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-ink truncate">{invoice.description || 'Cobrança mensal'}</p>
                                                    <p className="text-xs text-ink-mute mt-0.5">
                                                        Vencimento: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')} • {formatInvoiceStatus(invoice.status)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-sm font-black text-ink">
                                                        R$ {Number(invoice.value).toFixed(2).replace('.', ',')}
                                                    </span>
                                                    {invoice.invoiceUrl && (
                                                        <Button variant="outline" size="sm" asChild className="h-8">
                                                            <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                                                                <Receipt className="h-3.5 w-3.5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

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
