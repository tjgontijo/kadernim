'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, SquareArrowUp, PlusSquare, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
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

    const promptHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
      setDeferredPrompt(null);
    }
  };

  // Não mostrar se já estiver instalado ou não for dispositivo móvel
  if (isInstalled || !isMobile) return null;

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="bg-background px-3 text-muted-foreground/60 backdrop-blur-sm">
            Experiência App
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 backdrop-blur-sm relative group text-center">
        {/* Subtle Decorative Background Sparkle */}
        <div className="absolute -right-4 -top-4 text-primary/5 group-hover:text-primary/10 transition-colors">
          <Sparkles className="h-20 w-20" />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-foreground flex items-center justify-center gap-2">
              Instale o Kadernim
              <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            </h4>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed mx-auto max-w-[240px]">
              {isIOS
                ? "Adicione à sua tela de início para uma experiência completa."
                : "Instale para acesso rápido e melhor performance."
              }
            </p>
          </div>

          {isIOS ? (
            <div className="space-y-2.5 rounded-2xl bg-background/40 p-3.5 border border-primary/5 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">1</div>
                <p className="text-[10px] font-medium text-foreground leading-tight">
                  Toque em <span className="inline-flex items-center p-1 rounded-md bg-muted border border-border/50 mx-1 shadow-sm"><SquareArrowUp className="h-3 w-3 text-info" /></span> (Compartilhar)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">2</div>
                <p className="text-[10px] font-medium text-foreground leading-tight">
                  Selecione <span className="font-bold underline decoration-primary/30 underline-offset-2">&quot;Adicionar à Tela de Início&quot;</span>
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              disabled={!deferredPrompt}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 py-3 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              <Download className="h-3.5 w-3.5" />
              Instalar Agora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
