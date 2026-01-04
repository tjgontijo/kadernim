'use client'

import { motion } from 'framer-motion'
import { Sparkles, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoteProgressProps {
    used: number
    total: number
    className?: string
}

export function VoteProgress({ used, total, className }: VoteProgressProps) {
    const remaining = Math.max(0, total - used)

    // Calculate days until next month
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const diffTime = Math.abs(nextMonth.getTime() - now.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return (
        <div className={cn("bg-card border border-border/50 rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden group", className)}>
            {/* Background patterns */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="h-16 w-16 rotate-12" />
            </div>

            <div className="relative flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Seus Votos do Mês
                    </h3>
                    <p className="text-2xl font-black text-foreground">
                        {remaining} <span className="text-sm text-muted-foreground">disponíveis</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    {Array.from({ length: total }).map((_, i) => {
                        const isUsed = i < used
                        return (
                            <motion.div
                                key={i}
                                initial={false}
                                animate={{
                                    scale: isUsed ? 1 : [1, 1.15, 1],
                                    opacity: isUsed ? 0.3 : 1,
                                    rotate: isUsed ? 0 : [0, -5, 5, 0]
                                }}
                                transition={isUsed ? { duration: 0.2 } : {
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "easeInOut",
                                    delay: i * 0.2
                                }}
                                className={cn(
                                    "h-10 w-6 sm:h-12 sm:w-8 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    isUsed
                                        ? "bg-muted text-muted-foreground grayscale"
                                        : "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/30"
                                )}
                            >
                                <motion.div
                                    animate={!isUsed ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
                                >
                                    <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5 fill-current", !isUsed && "drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")} />
                                </motion.div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                    Votos resetam dia 1º
                </div>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {diffDays} {diffDays === 1 ? 'dia' : 'dias'} para a próxima seleção
                </div>
            </div>
        </div>
    )
}
