'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function AppSplashScreen() {
    const [isVisible, setIsVisible] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Se veio de um clique em notificação push, não mostra splash
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('from') === 'push') {
            // Limpar o parâmetro da URL sem recarregar a página
            urlParams.delete('from');
            const newUrl = urlParams.toString()
                ? `${window.location.pathname}?${urlParams.toString()}`
                : window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            setIsVisible(false);
            return;
        }

        // Verificar se já foi mostrado nesta sessão para evitar repetir em navegação
        const hasShown = sessionStorage.getItem('splash-shown');
        if (hasShown) {
            setIsVisible(false);
            return;
        }

        // Verificar se está em modo standalone (PWA instalado)
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsStandalone(standalone);

        // Se não for standalone, não mostramos o splash (especialmente em desktop)
        if (!standalone) {
            setIsVisible(false);
            return;
        }

        // Se chegamos aqui, mostramos o splash
        setIsVisible(true);

        const timer = setTimeout(() => {
            setIsVisible(false);
            sessionStorage.setItem('splash-shown', 'true');
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.5, ease: 'easeInOut' }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                >
                    <div className="relative flex flex-col items-center">
                        {/* Logo Animation as H1 */}
                        <motion.h1
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: {
                                    duration: 0.8,
                                    ease: [0, 0.71, 0.2, 1.01],
                                    scale: {
                                        type: "spring",
                                        damping: 12,
                                        stiffness: 100,
                                        restDelta: 0.001
                                    }
                                }
                            }}
                            className="relative h-32 w-48"
                        >
                            <Image
                                src="/images/system/logo_transparent.png"
                                alt="Kadernim"
                                fill
                                sizes="(max-width: 768px) 100vw, 224px"
                                className="object-contain"
                                priority
                            />
                        </motion.h1>

                        {/* Glowing effect background */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1],
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }}
                            className="absolute -inset-10 -z-10 bg-primary/20 blur-3xl rounded-full"
                        />

                        {/* Tagline Animation */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{
                                y: 0,
                                opacity: 1,
                                transition: { delay: 0.4, duration: 0.6 }
                            }}
                            className="mt-6 flex flex-col items-center"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-primary" />
                                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                                    Transformando a Educação
                                </p>
                                <div className="h-1 w-1 rounded-full bg-primary" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Progress bar at bottom for PWA feel */}
                    {isStandalone && (
                        <div className="absolute bottom-12 left-1/2 w-32 -translate-x-1/2">
                            <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{
                                        x: '0%',
                                        transition: { duration: 1.8, ease: "easeInOut" }
                                    }}
                                    className="h-full w-full bg-primary"
                                />
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
