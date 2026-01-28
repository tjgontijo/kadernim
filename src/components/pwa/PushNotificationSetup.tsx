'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Sparkles } from 'lucide-react';
import type { PushSubscriptionCreate } from '@/lib/schemas/push-notification';
import { useSession } from '@/lib/auth';

/**
 * PushNotificationSetup
 *
 * Componente que solicita permissão de notificações push quando:
 * 1. O usuário está autenticado (logged in)
 * 2. O navegador suporta Push Notifications
 * 3. O usuário ainda não decidiu sobre notificações (permission === 'default')
 *
 * IMPORTANTE iOS:
 * - No Safari/iOS, Notification.requestPermission() DEVE ser chamado
 *   diretamente em resposta a uma ação do usuário (user gesture)
 */
export function PushNotificationSetup() {
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // Se as notificações não forem suportadas, não faz nada
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    // Só solicitar se usuário estiver logado
    if (!session?.user) return;

    // CASO 1: Permissão ainda não foi decidida -> Mostrar diálogo
    if (Notification.permission === 'default') {
      // Aguardar 3 segundos após o app carregar
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // CASO 2: Permissão já concedida -> Garantir que o registro está atualizado no servidor
    if (Notification.permission === 'granted') {
      registerPushSubscription()
        .catch(err => console.error('❌ Erro no sync de push:', err));
    }
  }, [session]);

  const handleRequestPermission = async () => {
    setIsProcessing(true);

    try {
      // IMPORTANTE: No iOS, Notification.requestPermission() DEVE ser chamado
      // diretamente em resposta a um user gesture (clique do botão)
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        // Fechar o dialog imediatamente quando negado/descartado
        setShowDialog(false);
        setIsProcessing(false);
        return;
      }

      // 2. Registrar push subscription em background
      registerPushSubscription()
        .then(() => {
          // Registro concluído com sucesso
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar subscription:', error);
        });

      // Fechar o dialog IMEDIATAMENTE após a permissão ser concedida
      setShowDialog(false);
    } catch (error) {
      console.error('❌ Erro ao configurar push notifications:', error);
      setShowDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const registerPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications não são suportadas neste navegador');
    }

    try {
      // 1. Aguardar Service Worker estar pronto
      const registration = await navigator.serviceWorker.ready;

      // 2. Verificar se já existe subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {

        // 3. Se não existe, criar uma nova
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error('VAPID_PUBLIC_KEY não configurada no ambiente');
        }

        // Converter VAPID key para Uint8Array
        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // 4. Enviar para o servidor
      const subscriptionJSON = subscription.toJSON();

      if (!subscriptionJSON.endpoint || !subscriptionJSON.keys) {
        throw new Error('Subscription inválida - sem endpoint ou keys');
      }

      const payload: PushSubscriptionCreate = {
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys.p256dh,
          auth: subscriptionJSON.keys.auth,
        },
      };

      await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('❌ Erro ao registrar subscription:', error);
      throw error;
    }
  };

  const handleDismiss = () => {
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-4 pb-2">
          {/* Ícone visual */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-amber-500" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <DialogTitle className="text-xl font-semibold">
              Fique por dentro de tudo!
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Ative as notificações e seja a primeira a saber sobre novos recursos,
              atualizações importantes e conteúdos exclusivos do Kadernim.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:flex-col pt-4">
          {/* Botão primário - Destaque */}
          <Button
            onClick={handleRequestPermission}
            disabled={isProcessing}
            size="lg"
            className="w-full text-base font-semibold shadow-lg shadow-primary/20"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Configurando...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-5 w-5" />
                Ativar Notificações
              </>
            )}
          </Button>

          {/* Botão secundário - Menos destaque */}
          <Button
            variant="ghost"
            onClick={handleDismiss}
            disabled={isProcessing}
            size="lg"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Talvez mais tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
