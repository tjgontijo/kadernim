"use client"

import { RefreshCw, ArrowDown } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  className
}: PullToRefreshProps) {
  const {
    isRefreshing,
    pullDistance,
    isPulling,
    containerRef,
    pullProgress
  } = usePullToRefresh({
    onRefresh,
    disabled
  })

  const showIndicator = isPulling && pullDistance > 20

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn("relative overflow-hidden", className)}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance * 0.3, 60)}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Indicador de Pull to Refresh */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: Math.min(pullDistance * 0.8, 80),
          transform: `translateY(-${Math.max(0, 80 - pullDistance * 0.8)}px)`
        }}
      >
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          {isRefreshing ? (
            <>
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-medium">Atualizando...</span>
            </>
          ) : pullProgress >= 1 ? (
            <>
              <RefreshCw className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Solte para atualizar</span>
            </>
          ) : (
            <>
              <ArrowDown 
                className="h-6 w-6 transition-transform duration-200" 
                style={{ 
                  transform: `rotate(${pullProgress * 180}deg)`,
                  color: `hsl(var(--primary) / ${pullProgress})`
                }}
              />
              <span className="text-sm">Puxe para atualizar</span>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="pull-to-refresh">
        {children}
      </div>
    </div>
  )
}