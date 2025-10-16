'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Bell, Check, X, AlertCircle } from 'lucide-react';

interface NotificationsCardProps {
  emailEnabled?: boolean;
  onUpdate?: (data: { emailEnabled: boolean }) => void;
}

/**
 * NotificationsCard - Versão Simplificada
 * 
 * Push notifications são gerenciadas automaticamente pelo PushNotificationSetup
 * Aqui apenas mostramos o status e permitimos configurar email
 */
export function NotificationsCard({ 
  emailEnabled = true,
  onUpdate 
}: NotificationsCardProps) {
  const [emailNotifications, setEmailNotifications] = useState(emailEnabled);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function checkPushStatus() {
      // Verificar permissão do navegador
      if ('Notification' in window) {
        setPushPermission(Notification.permission);
      }

      // Verificar se tem subscription ativa
      if (
        'serviceWorker' in navigator && 
        'PushManager' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setHasSubscription(!!subscription);
        } catch (error) {
          console.error('Erro ao verificar subscription:', error);
        }
      }
    }

    checkPushStatus();
  }, []);

  const handleEmailToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    if (onUpdate) {
      onUpdate({ emailEnabled: checked });
    }
  };

  const getPushStatusIcon = () => {
    if (pushPermission === 'granted' && hasSubscription) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    if (pushPermission === 'denied') {
      return <X className="h-4 w-4 text-red-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  const getPushStatusText = () => {
    if (pushPermission === 'granted' && hasSubscription) {
      return 'Ativadas';
    }
    if (pushPermission === 'denied') {
      return 'Bloqueadas';
    }
    if (pushPermission === 'default') {
      return 'Não configuradas';
    }
    return 'Permitidas (não registradas)';
  };

  return (
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
        <div className="space-y-6">
          {/* Status de Push Notifications (somente leitura) */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Configuradas automaticamente ao instalar o app
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getPushStatusIcon()}
              <span className="text-sm font-medium">
                {getPushStatusText()}
              </span>
            </div>
          </div>

          {/* Mensagem informativa se push não estiver configurado */}
          {pushPermission !== 'granted' && (
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {pushPermission === 'denied' ? (
                <>
                  <strong>Notificações bloqueadas.</strong> Para habilitar, acesse as 
                  configurações do seu navegador.
                </>
              ) : (
                <>
                  <strong>Instale o app</strong> para receber notificações push. 
                  A permissão será solicitada automaticamente.
                </>
              )}
            </div>
          )}

          <Separator />

          {/* Notificações por Email (controlável) */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receba atualizações por email
              </p>
            </div>
            <Switch
              className='cursor-pointer'
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={handleEmailToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
