'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { PushSubscriptionCreate } from '@/lib/schemas/push-notification';

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

/**
 * PushNotificationSetup
 * 
 * Componente simples que:
 * 1. Detecta quando o app está em modo PWA (standalone)
 * 2. Solicita permissão de notificações uma única vez
 * 3. Registra o endpoint no servidor
 * 
 * Não depende de usuário logado - funciona por dispositivo.
 */
export function PushNotificationSetup() {
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Verificar se é PWA instalado
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as NavigatorWithStandalone).standalone === true;

    // Só mostrar se:
    // 1. É PWA instalado
    // 2. Suporta notificações
    // 3. Permissão ainda não foi decidida
    if (
      isStandalone &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      // Aguardar 3 segundos após o app carregar
      setTimeout(() => {
        setShowDialog(true);
      }, 3000);
    }
  }, []);

  const handleRequestPermission = async () => {
    setIsProcessing(true);

    try {
      // 1. Solicitar permissão do navegador
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('⏸️ Permissão de notificações negada');
        setShowDialog(false);
        setIsProcessing(false);
        return;
      }

      // 2. Registrar push subscription
      await registerPushSubscription();
      
      console.log('✅ Push notifications configuradas com sucesso');
      setShowDialog(false);
    } catch (error) {
      console.error('❌ Erro ao configurar push notifications:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const registerPushSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications não são suportadas');
    }

    try {
      // 1. Aguardar Service Worker estar pronto
      const registration = await navigator.serviceWorker.ready;
      
      // 2. Verificar se já existe subscription
      let subscription = await registration.pushManager.getSubscription();
      
      // 3. Se não existe, criar uma nova
      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          throw new Error('VAPID_PUBLIC_KEY não configurada');
        }
        
        // Converter VAPID key para Uint8Array
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

        // Criar subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // 4. Enviar para o servidor
      const subscriptionJSON = subscription.toJSON();
      
      const payload: PushSubscriptionCreate = {
        endpoint: subscriptionJSON.endpoint!,
        keys: {
          p256dh: subscriptionJSON.keys!.p256dh,
          auth: subscriptionJSON.keys!.auth,
        },
      };
      
      const response = await fetch('/api/v1/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao registrar subscription');
      }
      
      console.log('🔔 Push subscription registrada no servidor');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receba notificações importantes</DialogTitle>
          <DialogDescription>
            Permita notificações para receber atualizações sobre novos recursos, 
            atividades e novidades do Kadernim.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            disabled={isProcessing}
          >
            Agora não
          </Button>
          <Button 
            onClick={handleRequestPermission}
            disabled={isProcessing}
          >
            {isProcessing ? 'Configurando...' : 'Permitir notificações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
