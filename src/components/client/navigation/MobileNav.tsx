'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutGrid, User, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSessionQuery } from '@/hooks/useSessionQuery';
import { UserRole } from '@/types/user-role';

export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSessionQuery();
    const isAdmin = session?.data?.user?.role === UserRole.admin;

    const navItems = [
        { label: 'Planos', icon: FileText, href: '/lesson-plans' },
        { label: 'Recursos', icon: LayoutGrid, href: '/resources' },
        { label: 'Pedidos', icon: Sparkles, href: '/community' },
        ...(isAdmin ? [{ label: 'Admin', icon: ShieldCheck, href: '/admin' }] : []),
        { label: 'Conta', icon: User, href: '/account' }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] sm:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-1px_10px_rgba(0,0,0,0.05)] h-[72px] pb-safe">
            <div className="flex items-center justify-around h-full max-w-lg mx-auto px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 flex-1 relative transition-all duration-300",
                                isActive ? "text-primary" : "text-muted-foreground/60"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                                />
                            )}
                            <div className={cn(
                                "transition-transform duration-300",
                                isActive ? "scale-110 -translate-y-0.5" : "hover:scale-105"
                            )}>
                                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-black tracking-wider uppercase leading-none transition-all duration-300",
                                isActive ? "opacity-100" : "opacity-60"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
