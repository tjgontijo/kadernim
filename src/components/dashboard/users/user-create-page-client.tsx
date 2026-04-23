'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { createAdminUser } from '@/lib/users/api-client'
import { applyWhatsAppMask, normalizeWhatsApp, removeWhatsAppMask } from '@/lib/utils/phone'

export function UserCreatePageClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'user' | 'subscriber' | 'admin'>('user')

  const createMutation = useMutation({
    mutationFn: async () => {
      return createAdminUser({
        name,
        email,
        phone: phone ? normalizeWhatsApp(removeWhatsAppMask(phone)) : null,
        role,
      })
    },
    onSuccess: () => {
      toast.success('Usuário criado com sucesso')
      router.push('/admin/users')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Preencha nome e e-mail')
      return
    }
    createMutation.mutate()
  }

  return (
    <div className="bg-stone-50/50 min-h-full">
      <div className="dashboard-page-container py-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-2 text-terracotta text-[10px] font-bold uppercase tracking-widest">
                Administração
              </div>
              <h1 className="text-[42px] font-display font-medium leading-tight text-ink">
                Novo Usuário
              </h1>
            </div>
          </div>

          <Card className="rounded-4 border-border/70 overflow-hidden bg-white shadow-sm">
            <CardHeader className="border-b border-line/70 bg-stone-50/50">
              <CardTitle className="text-base flex items-center gap-2 font-display">
                <UserPlus className="h-4 w-4 text-terracotta" />
                Identificação do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-6 pb-8">
              <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-2.5 md:col-span-2">
                  <Label htmlFor="name" className="text-[13px] font-semibold text-ink-mute ml-1">Nome Completo</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex: João Silva" 
                    className="h-12 bg-stone-50/30" 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-[13px] font-semibold text-ink-mute ml-1">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="joao@exemplo.com" 
                    className="h-12 bg-stone-50/30" 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-[13px] font-semibold text-ink-mute ml-1">WhatsApp</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(applyWhatsAppMask(e.target.value))} 
                    placeholder="(00) 00000-0000" 
                    className="h-12 bg-stone-50/30" 
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-[13px] font-semibold text-ink-mute ml-1">Cargo / Nível de Acesso</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as 'user' | 'subscriber' | 'admin')}>
                    <SelectTrigger className="h-12 bg-stone-50/30">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário Comum</SelectItem>
                      <SelectItem value="subscriber">Assinante Premium</SelectItem>
                      <SelectItem value="admin">Administrador do Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => router.push('/admin/users')} disabled={createMutation.isPending}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || !name.trim() || !email.trim()}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Usuário
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
