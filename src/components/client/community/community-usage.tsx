'use client'

import { motion } from 'framer-motion'
import { Sparkles, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils/index'

interface CommunityUsageProps {
    used: number
    total: number
    className?: string
    lean?: boolean
}

export function CommunityUsage({ used, total, className, lean }: CommunityUsageProps) {
    const remaining = Math.max(0, total - used)

    // Calculate days until next month
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const diffTime = Math.abs(nextMonth.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (lean) {
        return (
            <div className={cn("bg-card border border-border/50 rounded-2xl px-4 py-2.5 flex items-center gap-4 transition-all hover:bg-muted/5", className)}>
                <div className="flex gap-1 shrink-0">
                    {Array.from({ length: total }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-4 w-1.5 rounded-full transition-colors",
                                i < used ? "bg-muted-foreground/20" : "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
                            )}
                        />
                    ))}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                    {remaining} {remaining === 1 ? 'Pedido' : 'Pedidos'}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("bg-card border border-border/50 rounded-2xl p-3 sm:py-4 sm:px-6 shadow-sm overflow-hidden group relative transition-all hover:shadow-md", className)}>
            <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <Lightbulb className={cn("h-4 w-4 sm:h-5 sm:w-5 fill-current pulse-subtle")} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 leading-none mb-0.5">
                            Pedidos
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums leading-none">{remaining}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tight">livres</span>
                        </div>
                    </div>
                </div>

                <div className="hidden sm:flex flex-col gap-1.5 flex-1 max-w-[200px] w-full">
                    <div className="flex gap-1 w-full h-1.5">
                        {Array.from({ length: total }).map((_, i) => {
                            const isUsed = i < used
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-1 rounded-full overflow-hidden relative transition-all duration-500",
                                        isUsed ? "bg-muted/40" : "bg-primary/20"
                                    )}
                                >
                                    {!isUsed && (
                                        <motion.div
                                            layoutId={`energy-bar-${i}`}
                                            className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_100%] animate-shimmer"
                                            initial={false}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">
                            Renova em {diffDays}d
                        </div>
                    </div>
                </div>

                <div className="sm:hidden flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                        {Array.from({ length: total }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-colors",
                                    i < used ? "bg-muted/40" : "bg-primary shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">{diffDays}d</span>
                </div>
            </div>
        </div>
    )
}
