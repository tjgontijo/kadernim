'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValue, useTransform, animate } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/index'

interface PullToRefreshProps {
    children: React.ReactNode
    onRefresh?: () => Promise<void> | void
    disabled?: boolean
}

const PULL_THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({ children, onRefresh, disabled }: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullProgress, setPullProgress] = useState(0)
    const { scrollY } = useScroll()

    const y = useMotionValue(0)
    const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 360])
    const opacity = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0, 0.5, 1])
    const scale = useTransform(y, [0, PULL_THRESHOLD], [0.8, 1.1])

    // Previne scroll do corpo quando estamos puxando
    useEffect(() => {
        if (pullProgress > 0 && !isRefreshing) {
            document.body.style.overflow = 'hidden'
            document.body.style.userSelect = 'none'
        } else {
            document.body.style.overflow = ''
            document.body.style.userSelect = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.body.style.userSelect = ''
        }
    }, [pullProgress, isRefreshing])

    const handlePan = (_: any, info: any) => {
        if (disabled || isRefreshing || scrollY.get() > 0) return

        const deltaY = info.offset.y
        if (deltaY > 0) {
            // Aplicar resistência (damping)
            const resistance = 0.4
            const newY = Math.min(deltaY * resistance, MAX_PULL)
            y.set(newY)
            setPullProgress(newY / PULL_THRESHOLD)
        } else {
            y.set(0)
            setPullProgress(0)
        }
    }

    const handlePanEnd = async () => {
        if (disabled || isRefreshing) return

        if (y.get() >= PULL_THRESHOLD) {
            setIsRefreshing(true)

            // Anima para a posição de "loading"
            animate(y, PULL_THRESHOLD / 1.5, { type: 'spring', stiffness: 300, damping: 30 })

            try {
                if (onRefresh) {
                    await onRefresh()
                } else {
                    // Default action: reload
                    window.location.reload()
                    // O reload vai interromper a execução, então não precisamos resetar o estado aqui
                    return
                }
            } catch (error) {
                console.error('[PTR] Refresh failed:', error)
            } finally {
                // Reset state if it didn't reload or failed
                setIsRefreshing(false)
                setPullProgress(0)
                animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
            }
        } else {
            setPullProgress(0)
            animate(y, 0, { type: 'spring', stiffness: 300, damping: 30 })
        }
    }

    return (
        <motion.div
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            className="relative w-full"
        >
            {/* Indicador de Refresh */}
            <motion.div
                style={{ y, opacity, scale }}
                className="absolute top-0 left-0 right-0 flex justify-center pt-4 pointer-events-none z-50"
            >
                <div className={cn(
                    "bg-background border border-border/50 shadow-xl rounded-full p-2.5 flex items-center justify-center",
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

            {/* Conteúdo */}
            <motion.div style={{ y: isRefreshing ? PULL_THRESHOLD / 2 : y }}>
                {children}
            </motion.div>
        </motion.div>
    )
}
