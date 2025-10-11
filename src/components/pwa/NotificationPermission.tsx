'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Definição de tipos
type NotificationPermissionState = 'granted' | 'denied' | 'default';
type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function NotificationPermission() {
  // Removida a variável isStandalone que não era utilizada
  const [, setIsStandalone] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  // Removida a variável permissionState que não era utilizada
  const [, setPermissionState] = useState<NotificationPermissionState | null>(null);

  useEffect(() => {
    // Verificar se o app está sendo executado como PWA (modo standalone)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true
      );
    };

    // Verificar o estado atual da permissão de notificação
    const checkNotificationPermission = async () => {
      if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações desktop');
        return;
      }

      const permission = await Notification.permission as NotificationPermissionState;
      setPermissionState(permission);
      
      // Se estiver em modo standalone e a permissão ainda não foi decidida, mostrar diálogo
      if (isInStandaloneMode() && permission === 'default') {
        // No iOS, esperamos um pouco para mostrar o diálogo após o app ser carregado como PWA
        setTimeout(() => {
          setShowPermissionDialog(true);
        }, 2000);
      }
    };

    // Verificar se é standalone e o estado da permissão
    setIsStandalone(isInStandaloneMode());
    checkNotificationPermission();

    // Adicionar listener para detectar quando o app é adicionado à tela inicial
    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsStandalone(true);
        checkNotificationPermission();
      }
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

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

  const registerForPushNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Removida a atribuição à variável registration que não era utilizada
        await navigator.serviceWorker.ready;
        
        // Aqui você pode implementar a lógica para registrar o dispositivo no seu backend
        // para receber notificações push
        console.log('Pronto para receber notificações push');
      } catch (error) {
        console.error('Erro ao registrar para notificações push:', error);
      }
    }
  };

  return (
    <>
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
    </>
  );
}
