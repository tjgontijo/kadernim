'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useMotionValue, useTransform, animate, useMotionValueEvent } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/index'

interface PullToRefreshProps {
    children: React.ReactNode
    onRefresh?: () => Promise<void> | void
    disabled?: boolean
}

const PULL_THRESHOLD = 80
const MAX_PULL = 130

export function PullToRefresh({ children, onRefresh, disabled }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isAtTop, setIsAtTop] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()

    // Detectar se estamos no topo para habilitar o arrasto
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsAtTop(latest <= 5)
    })

    const y = useMotionValue(0)
    const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360])
    const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1])
    const scale = useTransform(y, [0, PULL_THRESHOLD], [0.8, 1.1])

    const handleDragEnd = async () => {
        if (disabled || isRefreshing || !isAtTop) return

        if (y.get() >= PULL_THRESHOLD) {
            setIsRefreshing(true)

            // Anima para a posição de "loading"
            animate(y, PULL_THRESHOLD / 1.5, { type: 'spring', stiffness: 400, damping: 40 })

            try {
                if (onRefresh) {
                    await onRefresh()
                } else {
                    window.location.reload()
                    return
                }
            } catch (error) {
                console.error('[PTR] Refresh failed:', error)
            } finally {
                setIsRefreshing(false)
                animate(y, 0, { type: 'spring', stiffness: 400, damping: 40 })
            }
        } else {
            animate(y, 0, { type: 'spring', stiffness: 400, damping: 40 })
        }
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-full overflow-x-hidden"
            style={{
                touchAction: isAtTop && !isRefreshing ? 'pan-x' : 'auto',
                overscrollBehaviorY: 'contain'
            }}
        >
            {/* Indicador de Refresh */}
            <motion.div
                style={{ y, opacity, scale }}
                className="absolute top-0 left-0 right-0 flex justify-center pt-6 pointer-events-none z-50"
            >
                <div className={cn(
                    "bg-background border border-border/50 shadow-2xl rounded-full p-3 flex items-center justify-center",
                    isRefreshing && "animate-spin"
                )}>
                    <motion.div style={{ rotate: isRefreshing ? 0 : rotate }}>
                        <RefreshCw className={cn(
                            "h-5 w-5",
                            y.get() >= PULL_THRESHOLD ? "text-primary" : "text-muted-foreground"
                        )} />
                    </motion.div>
                </div>
            </motion.div>

            {/* Conteúdo Arrastável */}
            <motion.div
                drag={isAtTop && !disabled && !isRefreshing ? "y" : false}
                dragConstraints={{ top: 0, bottom: MAX_PULL }}
                dragElastic={0.2}
                dragDirectionLock
                onDragEnd={handleDragEnd}
                style={{ y }}
                className="relative w-full h-full"
            >
                {children}
            </motion.div>
        </div>
    )
}
