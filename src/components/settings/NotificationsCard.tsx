'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsCardProps {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  onUpdate?: (data: { pushEnabled: boolean; emailEnabled: boolean }) => void;
}

export function NotificationsCard({ 
  pushEnabled = true, 
  emailEnabled = true,
  onUpdate 
}: NotificationsCardProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(pushEnabled);
  const [emailNotifications, setEmailNotifications] = useState(emailEnabled);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    // Verificar permissão atual
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const handlePushToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    if (onUpdate) {
      onUpdate({ pushEnabled: checked, emailEnabled: emailNotifications });
    }
  };

  const handleEnablePushNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'denied') {
      toast.error('Permissão negada. Habilite nas configurações do navegador.');
      return;
    }

    setIsEnabling(true);

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        // Registrar subscription
        await registerPushSubscription();
        toast.success('Notificações habilitadas com sucesso!');
      } else {
        toast.error('Permissão de notificações negada');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao habilitar notificações');
    } finally {
      setIsEnabling(false);
    }
  };

  const registerPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID key não configurada');
          return;
        }

        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      const subscriptionJSON = subscription.toJSON();
      const userAgent = navigator.userAgent;
      let deviceName = 'Dispositivo';
      
      if (/iPhone/.test(userAgent)) deviceName = 'iPhone';
      else if (/iPad/.test(userAgent)) deviceName = 'iPad';
      else if (/Android/.test(userAgent)) deviceName = 'Android';

      await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscriptionJSON.endpoint,
          keys: subscriptionJSON.keys,
          userAgent,
          deviceName
        })
      });
    } catch (error) {
      console.error('Erro ao registrar subscription:', error);
      throw error;
    }
  };

  const handleEmailToggle = (checked: boolean) => {
    setEmailNotifications(checked);
    if (onUpdate) {
      onUpdate({ pushEnabled: notificationsEnabled, emailEnabled: checked });
    }
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações no navegador
              </p>
            </div>
            <Switch
              className='cursor-pointer'
              id="push-notifications"
              checked={notificationsEnabled}
              onCheckedChange={handlePushToggle}
            />
          </div>

          {/* Botão para habilitar permissão de push */}
          {pushPermission !== 'granted' && (
            <div className="rounded-lg border border-dashed p-4">
              <div className="flex items-start gap-3">
                <BellOff className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium">
                    {pushPermission === 'denied' 
                      ? 'Notificações bloqueadas' 
                      : 'Habilite as notificações push'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pushPermission === 'denied'
                      ? 'Você bloqueou as notificações. Habilite nas configurações do navegador.'
                      : 'Permita notificações para receber atualizações importantes.'}
                  </p>
                  {pushPermission !== 'denied' && (
                    <Button 
                      size="sm" 
                      onClick={handleEnablePushNotifications}
                      disabled={isEnabling}
                    >
                      {isEnabling ? 'Habilitando...' : 'Habilitar Notificações'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

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
