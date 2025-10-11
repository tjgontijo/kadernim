'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Database,
  Users,
  Lock,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from '@/lib/auth/auth-client';

export function SettingsClient() {
  // Middleware já garantiu que há sessão
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveSettings = () => {
    // TODO: Implementar salvamento de configurações
  };

  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Configurações" icon={<SettingsIcon className="h-5 w-5" />} />

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Acesso Restrito</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Configurações do Sistema" icon={<SettingsIcon className="h-5 w-5" />} />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Aparência */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Aparência</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Personalize a aparência do sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Tema</Label>
                  <div className="mt-2 flex gap-2">
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
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Notificações</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Gerencie as notificações do sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
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

          {/* Gerenciamento de Usuários */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Configurações relacionadas aos usuários
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total de usuários</Label>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Usuários ativos</Label>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Button>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Segurança</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Configurações de segurança do sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de dois fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sessões ativas</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerencie dispositivos conectados
                    </p>
                  </div>
                  <Button variant="outline">Ver sessões</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações Gerais */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Configurações Gerais</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Configurações gerais do sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="app-name">Nome do aplicativo</Label>
                  <Input id="app-name" defaultValue="Kadernim" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="support-email">Email de suporte</Label>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="suporte@kadernim.com"
                  />
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>

          {/* Banco de Dados */}
          <div className="rounded-lg border border-destructive/50 bg-card text-card-foreground shadow-sm">
            <div className="border-b border-destructive/50 p-6">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-destructive" />
                <h3 className="text-lg font-semibold">Zona de Perigo</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Ações irreversíveis do sistema
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-destructive">Limpar cache</Label>
                    <p className="text-sm text-muted-foreground">
                      Remove todos os dados em cache
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Limpar
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-destructive">Backup do banco de dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Faça backup dos dados do sistema
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Fazer Backup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
