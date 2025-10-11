'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Definição de tipos
type NotificationPermissionState = 'granted' | 'denied' | 'default';
type WindowWithStandalone = Window & {
  MSStream?: unknown;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function IOSNotificationHandler() {
  const [isIOSStandalone, setIsIOSStandalone] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  // Removido o uso da variável permissionState, mantendo apenas o setter
  const [, setPermissionState] = useState<NotificationPermissionState | null>(null);

  useEffect(() => {
    // Detectar se é iOS
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as WindowWithStandalone).MSStream;
    };

    // Detectar se está em modo standalone (adicionado à tela inicial)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true
      );
    };

    // Verificar se é iOS e está em modo standalone
    const checkIOSStandalone = () => {
      if (isIOS() && isInStandaloneMode()) {
        console.log('📱 Aplicativo sendo executado como PWA no iOS');
        setIsIOSStandalone(true);
        
        // No iOS, esperamos um pouco para mostrar o diálogo após o app ser carregado como PWA
        setTimeout(() => {
          checkNotificationPermission();
        }, 2000);
      }
    };

    // Verificar o estado atual da permissão de notificação
    const checkNotificationPermission = async () => {
      if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações desktop');
        return;
      }

      const permission = Notification.permission as NotificationPermissionState;
      setPermissionState(permission);
      
      // Se a permissão ainda não foi decidida, mostrar diálogo
      if (permission === 'default') {
        setShowPermissionDialog(true);
      }
    };

    // Executar verificação inicial
    checkIOSStandalone();

    // Adicionar listener para detectar quando o app é adicionado à tela inicial
    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches && isIOS()) {
        setIsIOSStandalone(true);
        checkNotificationPermission();
      }
    };

    // Adicionar listener para mudanças no modo de exibição
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador não suporta notificações desktop');
      return;
    }

    try {
      const permission = await Notification.requestPermission() as NotificationPermissionState;
      setPermissionState(permission);
      setShowPermissionDialog(false);
      
      // Se a permissão foi concedida, registrar para notificações push
      if (permission === 'granted') {
        registerForPushNotifications();
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
    }
  };

  // Registrar para notificações push
  const registerForPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Removida a atribuição à variável registration que não era utilizada
        await navigator.serviceWorker.ready;
        
        // Aqui você pode implementar a lógica para registrar o dispositivo no seu backend
        // para receber notificações push
        console.log('✅ Pronto para receber notificações push no iOS');
        
        // Exemplo de como registrar no backend (implementar conforme necessário)
        // const swRegistration = await navigator.serviceWorker.ready;
        // await fetch('/api/notifications/register-device', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ 
        //     token: await swRegistration.pushManager.getSubscription() 
        //   }),
        // });
      } catch (error) {
        console.error('❌ Erro ao registrar para notificações push:', error);
      }
    }
  };

  // Não renderizar nada se não for iOS em modo standalone
  if (!isIOSStandalone) {
    return null;
  }

  return (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receba notificações importantes</DialogTitle>
          <DialogDescription>
            Permita notificações para receber atualizações importantes sobre suas atividades e novidades no Kadernim.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
            Agora não
          </Button>
          <Button onClick={requestNotificationPermission}>
            Permitir notificações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
