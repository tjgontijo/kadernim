'use client'

import { Library, Target, Gift, Sparkles, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ResourceTab = 'mine' | 'free' | 'all' | 'new' | 'featured'

interface TabConfig<T extends ResourceTab = ResourceTab> {
  value: T
  label: string
  mobileLabel?: string // Label curto para mobile
  icon: LucideIcon
  color?: string // Cor de destaque (opcional)
}

const DEFAULT_TABS = ['all', 'mine', 'free'] as const
type DefaultTab = (typeof DEFAULT_TABS)[number]

interface ResourceTabsProps<T extends ResourceTab = DefaultTab> {
  value: T
  onValueChange: (value: T) => void
  counts?: Partial<Record<ResourceTab, number>>
  enabledTabs?: readonly T[] // Quais tabs mostrar (default: all, mine, free)
}

// Configuração centralizada de tabs - fácil adicionar novas
const TABS_CONFIG: TabConfig[] = [
  {
    value: 'all',
    label: 'Todos',
    icon: Library,
  },
  {
    value: 'mine',
    label: 'Meus Recursos',
    mobileLabel: 'Meus',
    icon: Target,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    value: 'free',
    label: 'Gratuitos',
    mobileLabel: 'Grátis',
    icon: Gift,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    value: 'new',
    label: 'Novos (14 dias)',
    mobileLabel: 'Novos',
    icon: Sparkles,
    color: 'text-amber-600 dark:text-amber-400',
  },
  // Exemplo futuro:
  // {
  //   value: 'featured',
  //   label: 'Em Destaque',
  //   mobileLabel: 'Destaque',
  //   icon: Star,
  //   color: 'text-purple-600 dark:text-purple-400',
  // },
]

export function ResourceTabs<T extends ResourceTab = DefaultTab>({
  value,
  onValueChange,
  counts,
  enabledTabs = DEFAULT_TABS as unknown as readonly T[],
}: ResourceTabsProps<T>) {
  // Filtra apenas as tabs habilitadas
  const visibleTabs = TABS_CONFIG.filter((tab) =>
    enabledTabs.includes(tab.value as T)
  ) as TabConfig<T>[]

  const activeIndex = visibleTabs.findIndex((tab) => tab.value === value)

  return (
    <div
      className="relative w-full bg-muted/50 rounded-2xl p-1 backdrop-blur-sm border border-border/50"
      role="tablist"
      aria-label="Filtrar por tipo de recurso"
    >
      {/* Slider animado - segue a tab ativa */}
      <div
        className={cn(
          'absolute top-1 bottom-1 bg-background rounded-xl shadow-lg',
          'transition-all duration-300 ease-out',
          'border border-border'
        )}
        style={{
          left: `calc(${(activeIndex / visibleTabs.length) * 100}% + 0.25rem)`,
          width: `calc(${100 / visibleTabs.length}% - 0.5rem)`,
        }}
        aria-hidden="true"
      />

      {/* Tabs */}
      <div
        className={cn(
          'relative grid gap-1',
          // Grid responsivo baseado no número de tabs
          visibleTabs.length === 3 && 'grid-cols-3',
          visibleTabs.length === 4 && 'grid-cols-2 md:grid-cols-4',
          visibleTabs.length === 5 && 'grid-cols-2 md:grid-cols-5',
          visibleTabs.length > 5 && 'flex overflow-x-auto scrollbar-hide'
        )}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon
          const count = counts?.[tab.value]
          const hasCount = typeof count === 'number'
          const isActive = value === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onValueChange(tab.value)}
              className={cn(
                // Base
                'relative z-10 flex flex-col items-center justify-center',
                'min-h-[60px] md:min-h-[56px] px-3 py-2 min-w-[90px]',
                'rounded-xl transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',

                // Estados
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {/* Ícone + Label */}
              <div className="flex items-center gap-1.5 mb-1">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive && tab.color
                  )}
                />
                <span className="text-xs md:text-sm font-medium">
                  {tab.mobileLabel || tab.label}
                </span>
              </div>

              {/* Badge de contagem - integrado */}
              {hasCount && (
                <span
                  className={cn(
                    'text-xs font-bold tabular-nums',
                    isActive ? 'text-primary' : 'text-muted-foreground/70'
                  )}
                  aria-label={`${count} recursos`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
