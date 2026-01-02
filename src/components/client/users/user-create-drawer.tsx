'use client'

import React, { useState } from 'react'
import {
    X,
    UserPlus,
    Loader2,
    Shield,
    User,
    Phone
} from 'lucide-react'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
    applyWhatsAppMask,
    removeWhatsAppMask,
    normalizeWhatsApp,
} from '@/lib/utils/phone'

interface UserCreateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UserCreateDrawer({ open, onOpenChange, onSuccess }: UserCreateDrawerProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState<string>('user')
    const [isSaving, setIsSaving] = useState(false)

    const resetForm = () => {
        setName('')
        setEmail('')
        setPhone('')
        setRole('user')
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setPhone(applyWhatsAppMask(val))
    }

    const handleCreate = async () => {
        if (!name || !email) {
            toast.error('Preencha nome e email')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/v1/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone: phone ? normalizeWhatsApp(removeWhatsAppMask(phone)) : null,
                    role
                })
            })

            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || 'Erro ao criar usuário')
            }

            toast.success('Usuário criado com sucesso!')
            resetForm()
            onOpenChange(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={(open) => {
            if (!open) resetForm()
            onOpenChange(open)
        }} shouldScaleBackground={false}>
            <DrawerContent className="h-[85dvh] max-h-none rounded-t-3xl border-none data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="mx-auto w-full max-w-lg flex flex-col h-full overflow-hidden">
                    <DrawerHeader className="border-b pb-4 shrink-0 px-6">
                        <div className="flex items-center justify-between">
                            <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UserPlus className="h-5 w-5 text-primary" />
                                </div>
                                Novo Usuário
                            </DrawerTitle>
                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                    <X className="h-4 w-4" />
                                </Button>
                            </DrawerClose>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            O usuário fará login via código OTP enviado por email/WhatsApp.
                        </p>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="create-name" className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
                                Nome Completo *
                            </Label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="create-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 pl-12 bg-muted/30 border-muted-foreground/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-xl font-medium"
                                    placeholder="Nome do usuário"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="create-email" className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
                                E-mail *
                            </Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-muted/30 border-muted-foreground/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-xl font-medium"
                                placeholder="email@exemplo.com"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="create-phone" className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
                                WhatsApp / Celular
                            </Label>
                            <div className="relative group/input">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    id="create-phone"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    className="h-12 pl-12 bg-muted/30 border-muted-foreground/10 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-xl font-medium"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-wide text-muted-foreground">
                                Cargo
                            </Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="h-12 bg-muted/30 border-muted-foreground/10 rounded-xl font-medium">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground/50" />
                                        <SelectValue />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="subscriber">Assinante</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DrawerFooter className="border-t pt-6 bg-background/80 backdrop-blur-md shrink-0 px-6 pb-10">
                        <div className="flex gap-4">
                            <DrawerClose asChild>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-bold"
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                            </DrawerClose>
                            <Button
                                className="flex-[2] h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                                onClick={handleCreate}
                                disabled={isSaving || !name || !email}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Criando...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Criar Usuário
                                    </>
                                )}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
