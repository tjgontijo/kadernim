"use client"

import { useEffect, useRef, useState } from "react"

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  disabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  
  const startY = useRef(0)
  const currentY = useRef(0)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return

    const container = containerRef.current || document.body

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop > 0) return
      
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || container.scrollTop > 0) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)
      
      if (distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance * 0.5, threshold * 1.5))
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      setIsPulling(false)

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }

        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }

      setPullDistance(0)
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [disabled, isPulling, pullDistance, threshold, onRefresh, isRefreshing])

  return {
    isRefreshing,
    pullDistance,
    isPulling,
    containerRef,
    pullProgress: Math.min(pullDistance / threshold, 1)
  }
}