'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  Bell,
  Palette,
  User,
  Lock,
  Globe,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from '@/lib/auth/auth-client';

type UserWithSubscription = {
  subscriptionTier?: string | null;
  role?: string | null;
  name?: string;
  email?: string;
  image?: string | null;
}

export function SettingsClient() {
  // Middleware já garantiu que há sessão
  const { data: session } = useSession();
  const user = session?.user as UserWithSubscription;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveSettings = () => {
    // TODO: Implementar salvamento de configurações
  };

  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Configurações" 
        icon={<SettingsIcon className="h-5 w-5" />}
        backHref="/resources"
        description="Personalize sua experiência no app"
      />

      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Perfil do Usuário */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Perfil</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Informações da sua conta
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" defaultValue={user?.name || ''} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input 
                    id="whatsapp" 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
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
                  {!mounted ? (
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" className="flex-1" disabled>
                        Claro
                      </Button>
                      <Button variant="outline" className="flex-1" disabled>
                        Escuro
                      </Button>
                      <Button variant="outline" className="flex-1" disabled>
                        Sistema
                      </Button>
                    </div>
                  ) : (
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
                  )}
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
                Gerencie como você recebe notificações
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
                    size="sm"
                  >
                    {notificationsEnabled ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações por email
                    </p>
                  </div>
                  <Button
                    variant={emailNotifications ? 'default' : 'outline'}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    size="sm"
                  >
                    {emailNotifications ? 'Ativado' : 'Desativado'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Segurança e Privacidade */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Segurança e Privacidade</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Proteja sua conta e dados pessoais
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alterar senha</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualize sua senha regularmente
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sessões ativas</Label>
                    <p className="text-sm text-muted-foreground">
                      Dispositivos conectados à sua conta
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Ver sessões</Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Privacidade de dados</Label>
                    <p className="text-sm text-muted-foreground">
                      Gerencie suas preferências de privacidade
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferências */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Preferências</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Personalize como você usa o app
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Input id="language" defaultValue="Português (Brasil)" disabled className="bg-muted" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="timezone">Fuso horário</Label>
                  <Input id="timezone" defaultValue="America/Sao_Paulo" disabled className="bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
