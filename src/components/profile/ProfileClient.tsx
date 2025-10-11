'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, Shield, Bell, Palette } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { useSession } from '@/lib/auth/auth-client';
import { ChangePasswordForm } from './ChangePasswordForm';

export function ProfileClient() {
  // Middleware já garantiu que há sessão
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  if (!user) return null;
  const getUserInitials = () => {
    if (!user.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    // TODO: Implementar atualização de perfil
    toast.success('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Meu Perfil" icon={<User className="h-5 w-5" />} />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Card de Avatar e Info Básica */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 sm:justify-start">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Shield className="h-3 w-3" />
                      {user.role || 'user'}
                    </span>
                    {user.emailVerified && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Email verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Informações Pessoais */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações pessoais
                </p>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>

            <div className="p-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar alterações</Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card de Informações da Conta */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <h3 className="text-lg font-semibold">Informações da Conta</h3>
              <p className="text-sm text-muted-foreground">
                Detalhes sobre sua conta
              </p>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Membro desde
                  </p>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>

                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Nível de acesso
                  </p>
                  <p className="text-sm capitalize">{user.role || 'Usuário'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">ID da conta</p>
                  <p className="font-mono text-xs">{user.id}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Última atualização
                  </p>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Preferências do Usuário */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <h3 className="text-lg font-semibold">Preferências</h3>
              <p className="text-sm text-muted-foreground">
                Personalize sua experiência no sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Aparência */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <Label>Tema</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      onClick={() => setTheme('light')}
                      className="flex-1"
                    >
                      Claro
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      onClick={() => setTheme('dark')}
                      className="flex-1"
                    >
                      Escuro
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      onClick={() => setTheme('system')}
                      className="flex-1"
                    >
                      Sistema
                    </Button>
                  </div>
                </div>

                {/* Notificações */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <div>
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações no navegador
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={notificationsEnabled ? 'default' : 'outline'}
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    >
                      {notificationsEnabled ? 'Ativado' : 'Desativado'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Alteração de Senha */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
