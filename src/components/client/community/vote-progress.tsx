'use client'

import { motion } from 'framer-motion'
import { Sparkles, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteProgressProps {
    used: number
    total: number
    className?: string
    lean?: boolean
}

export function VoteProgress({ used, total, className, lean }: VoteProgressProps) {
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
                    {remaining} {remaining === 1 ? 'Voto' : 'Votos'}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("bg-card border border-border/50 rounded-[28px] p-5 sm:p-6 shadow-sm overflow-hidden group relative transition-all hover:shadow-md", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <Heart className={cn("h-5 w-5 sm:h-6 sm:w-6 fill-current pulse-subtle")} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 leading-none mb-1">
                            Seus Votos
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums leading-none">{remaining}</span>
                            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">disponíveis</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2.5 flex-1 max-w-sm w-full">
                    <div className="flex gap-1.5 w-full h-2">
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
                                            className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_100%] animate-shimmer shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                                            initial={false}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                            <Sparkles className="h-3 w-3" />
                            Novos votos em {diffDays} {diffDays === 1 ? 'dia' : 'dias'}
                        </div>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <div className="text-[9px] font-black uppercase tracking-widest text-primary/50">
                            Votos Totais: {total}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
