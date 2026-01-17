'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutGrid, User, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import { useSessionQuery } from '@/hooks/auth/use-session';
import { UserRole } from '@/types/user-role';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSessionQuery();
    const isAdmin = session?.data?.user?.role === UserRole.admin;

    const navItems = [
        { label: 'Planos', icon: FileText, href: '/lesson-plans' },
        { label: 'Pedidos', icon: Sparkles, href: '/community' },
        { label: 'Recursos', icon: LayoutGrid, href: '/resources' },
        ...(isAdmin ? [{ label: 'Admin', icon: ShieldCheck, href: '/admin' }] : []),
        { label: 'Conta', icon: User, href: '/account' }
    ];

    return (
        <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
            <div className={cn(
                "mx-auto max-w-sm",
                "bg-background/80 backdrop-blur-xl",
                "border border-border/50 rounded-2xl",
                "shadow-lg shadow-black/5"
            )}>
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative",
                                    "transition-colors duration-200",
                                    isActive
                                        ? "text-primary pointer-events-none outline-none" // Previne múltiplos cliques se já estiver ativo
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <motion.div
                                    whileTap={isActive ? {} : { scale: 0.85 }} // Restaurado efeito original
                                    className="flex flex-col items-center justify-center w-full"
                                >
                                    <div className="relative">
                                        <Icon className={cn(
                                            "h-6 w-6 mb-0.5 transition-transform duration-300",
                                            isActive && "scale-110"
                                        )} />

                                        {/* Indicador de item ativo (bolinha ou background suave) */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-glow"
                                                className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold tracking-tight transition-all",
                                        isActive ? "opacity-100 scale-100" : "opacity-80 scale-95"
                                    )}>
                                        {item.label}
                                    </span>
                                </motion.div>

                                {/* Barrinha inferior para o item ativo */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 h-1 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}