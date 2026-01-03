'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, FileText, User, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: 'Planos',
            icon: FileText,
            href: '/lesson-plans',
            position: 'left'
        },
        {
            label: 'Recursos',
            icon: LayoutGrid,
            href: '/resources',
            position: 'center'
        },
        {
            label: 'Conta',
            icon: User,
            href: '/account',
            position: 'right'
        }
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-[100] px-6 sm:hidden pointer-events-none">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={cn(
                    "pointer-events-auto mx-auto max-w-[320px]",
                    "relative flex items-center justify-around h-[72px] px-2",
                    "bg-white/10 dark:bg-black/30 backdrop-blur-[40px]",
                    "border border-white/20 dark:border-white/5",
                    "shadow-[0_20px_50px_rgba(0,0,0,0.15)]",
                    "rounded-[32px] overflow-hidden",
                    // Glass shine effect
                    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
                    // Inner glow
                    "after:absolute after:inset-0 after:rounded-[32px] after:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] dark:after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] after:pointer-events-none"
                )}
            >
                {/* Background Liquid Effect for Active Item */}
                <div className="absolute inset-0 flex justify-around items-center px-4 pointer-events-none">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <div key={item.href} className="relative w-14 h-12 flex items-center justify-center">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute w-12 h-12 bg-primary/20 dark:bg-primary/40 rounded-full blur-xl"
                                        transition={{
                                            type: 'spring',
                                            damping: 25,
                                            stiffness: 150,
                                            mass: 0.8
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    const isCenter = item.position === 'center';

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-16 h-full group transition-all"
                        >
                            <div className={cn(
                                "relative flex items-center justify-center p-2 rounded-2xl transition-all duration-300",
                                isCenter ? "mb-1 scale-110 shadow-lg bg-primary/10 dark:bg-primary/20" : "",
                                isActive ? "text-primary transform -translate-y-1" : "text-muted-foreground/60"
                            )}>
                                {isCenter && isActive && (
                                    <motion.div
                                        animate={{
                                            rotate: [0, 90, 180, 270, 360],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent rounded-full blur-xl opacity-50"
                                    />
                                )}
                                <Icon className={cn(
                                    "h-6 w-6 transition-all duration-300",
                                    isActive ? "stroke-[2.5px]" : "stroke-[1.5px] group-hover:scale-110"
                                )} />

                                {isCenter && (
                                    <Sparkles className={cn(
                                        "absolute -top-1 -right-1 h-3 w-3 transition-opacity",
                                        isActive ? "opacity-100 text-primary animate-pulse" : "opacity-0"
                                    )} />
                                )}
                            </div>

                            <span className={cn(
                                "text-[10px] font-bold tracking-tight transition-all duration-300",
                                isActive ? "opacity-100 translate-y-0 text-primary" : "opacity-0 translate-y-2 text-muted-foreground"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </motion.nav>
        </div>
    );
}
