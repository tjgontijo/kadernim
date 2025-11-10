'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar dispositivos móveis
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidMobile = /android/.test(userAgent) && /mobile/.test(userAgent);
    const isMobileDevice = isIOSDevice || isAndroidMobile;
    
    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para o evento beforeinstallprompt (Android/Desktop)
    // Não usamos preventDefault() para permitir que o banner nativo seja exibido automaticamente
    const promptHandler = (e: Event) => {
      // Armazenamos a referência para uso posterior caso o usuário queira instalar via nosso botão
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
      setIsInstallable(false);
    }

    setDeferredPrompt(null);
  };

  // Não mostrar se já estiver instalado ou não for dispositivo móvel
  if (isInstalled || !isMobile) return null;

  // Mostrar instruções para iOS
  if (isIOS) {
    return (
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Instale o app
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-md border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/30">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-800 dark:text-indigo-200">
              <p className="font-medium mb-1">Para instalar no iOS:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Toque no ícone de compartilhar</li>
                <li>Role para baixo e toque em &quot;Adicionar à Tela de Início&quot;</li>
                <li>Toque em &quot;Adicionar&quot;</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar botão de instalação para Android/Desktop
  if (isInstallable && deferredPrompt) {
    return (
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Instale o app
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleInstallClick}
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border-2 border-indigo-300 bg-indigo-50 px-4 py-3 text-indigo-700 shadow-sm transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/50"
          >
            <Download className="h-5 w-5" />
            <span className="font-medium">Instalar Aplicativo</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}
