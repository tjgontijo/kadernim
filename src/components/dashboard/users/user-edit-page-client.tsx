'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { fetchAdminUser, updateAdminUser } from '@/lib/users/api-client'
import { applyWhatsAppMask, denormalizeWhatsApp, normalizeWhatsApp, removeWhatsAppMask } from '@/lib/utils/phone'

type EditableUser = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'user' | 'subscriber' | 'admin'
  banned: boolean
}

/**
 * Sub-componente que gerencia o estado do formulário.
 * Ele inicializa o estado diretamente com os dados recebidos, eliminando a necessidade de useEffect.
 */
function UserEditForm({ user, onBack }: { user: EditableUser; onBack: () => void }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(applyWhatsAppMask(denormalizeWhatsApp(user.phone || '')))
  const [role, setRole] = useState<'user' | 'subscriber' | 'admin'>(user.role)
  const [banned, setBanned] = useState(user.banned)

  const updateMutation = useMutation({
    mutationFn: async () => {
      return updateAdminUser(user.id, {
        name,
        email,
        phone: phone ? normalizeWhatsApp(removeWhatsAppMask(phone)) : null,
        role,
        banned,
      })
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso')
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
    updateMutation.mutate()
  }

  return (
    <Card className="rounded-4 border-border/70 overflow-hidden bg-white shadow-sm">
      <CardHeader className="border-b border-line/70 bg-stone-50/50">
        <CardTitle className="text-base flex items-center gap-2 font-display">
          <UserCog className="h-4 w-4 text-terracotta" />
          Dados do Usuário
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
            <Select
              value={role}
              onValueChange={(value) => setRole(value as 'user' | 'subscriber' | 'admin')}
            >
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

          <div className="space-y-2.5">
            <Label className="text-[13px] font-semibold text-ink-mute ml-1">Status da Conta</Label>
            <div className="h-12 rounded-3 border border-line px-4 flex items-center justify-between bg-stone-50/30">
              <span className="text-[14px] font-medium text-ink">
                {banned ? 'Acesso bloqueado' : 'Acesso ativo'}
              </span>
              <Switch checked={banned} onCheckedChange={setBanned} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-8">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || !name.trim() || !email.trim()}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function UserEditPageClient({ userId }: { userId: string }) {
  const router = useRouter()

  const query = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => fetchAdminUser(userId) as Promise<EditableUser>,
  })

  return (
    <div className="bg-stone-50/50 min-h-full pb-20">
      <div className="dashboard-page-container py-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-2 text-ink-mute hover:text-ink"
                onClick={() => router.push('/admin/users')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para lista
              </Button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-2 text-terracotta text-[10px] font-bold uppercase tracking-widest">
                Administração
              </div>
              <h1 className="text-[42px] font-display font-medium leading-tight text-ink">
                Editar Usuário
              </h1>
            </div>
          </div>

          {query.isLoading ? (
            <Card className="rounded-4 border-border/70 overflow-hidden bg-white shadow-sm">
              <CardHeader className="border-b border-line/70 bg-stone-50/50">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-8 px-6 pb-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Skeleton className="h-20 md:col-span-2" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </CardContent>
            </Card>
          ) : query.data ? (
            <UserEditForm user={query.data} onBack={() => router.push('/admin/users')} />
          ) : (
            <div className="text-center py-20">
              <p className="text-ink-mute">Usuário não encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
