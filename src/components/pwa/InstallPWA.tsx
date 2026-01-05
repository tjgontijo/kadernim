'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, PlusSquare, X, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listener para Android/Desktop
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', promptHandler);

    // Para iOS, mostramos após alguns segundos se não estiver instalado
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsVisible(false);
    setDeferredPrompt(null);
  };

  if (isInstalled || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-8 sm:p-6"
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-[2.5rem] border border-border bg-background/80 p-1 shadow-2xl backdrop-blur-2xl">
          <div className="relative rounded-[2.2rem] bg-card p-6 shadow-sm">
            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-4 top-4 rounded-full bg-muted p-1 hover:bg-muted/80"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-foreground">
                  Instalar Kadernim
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <Sparkles className="h-3 w-3" />
                  Experiência Premium
                </div>
              </div>
            </div>

            {isIOS ? (
              /* iOS Steps */
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Adicione o app à sua tela de início para acessar instantaneamente, mesmo offline.
                </p>
                <div className="space-y-3 rounded-2xl bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm text-xs font-bold">1</div>
                    <p className="text-xs font-medium text-foreground">
                      Toque no ícone de <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white border border-border mx-1 shadow-sm"><Share2 className="h-3 w-3 text-blue-500" /></span> (Compartilhar)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm text-xs font-bold">2</div>
                    <p className="text-xs font-medium text-foreground">
                      Role para baixo e selecione <span className="font-bold underline decoration-primary/50 underline-offset-2">&quot;Adicionar à Tela de Início&quot;</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background border border-border shadow-sm text-xs font-bold">3</div>
                    <p className="text-xs font-medium text-foreground">
                      Pressione <span className="font-bold text-primary">Adicionar</span> no canto superior
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsVisible(false)}
                  className="w-full rounded-2xl h-12 font-black uppercase tracking-widest text-[11px]"
                >
                  Entendi
                </Button>
              </div>
            ) : (
              /* Android/Chrome Button */
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Instale o app para ter acesso rápido aos seus planos de aula e recursos educativos.
                </p>
                <Button
                  onClick={handleInstallClick}
                  className="w-full gap-2 rounded-2xl h-14 font-black uppercase tracking-widest text-[12px] shadow-lg shadow-primary/20"
                >
                  <Download className="h-4 w-4" />
                  Instalar Agora
                </Button>
                <button
                  onClick={() => setIsVisible(false)}
                  className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  Agora não, obrigado
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
