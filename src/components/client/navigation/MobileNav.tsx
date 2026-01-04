'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutGrid, User, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSessionQuery } from '@/hooks/useSessionQuery';
import { UserRole } from '@/types/user-role';

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
                <div className="flex items-center justify-around h-14 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 flex-1 py-2",
                                    "transition-all duration-200",
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-[10px] font-medium">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}