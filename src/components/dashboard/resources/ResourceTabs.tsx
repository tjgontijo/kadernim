'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type ResourceTab = 'mine' | 'free' | 'all'

interface ResourceTabsProps {
  value: ResourceTab
  onValueChange: (value: ResourceTab) => void
  counts?: Partial<Record<ResourceTab, number>>
}

export function ResourceTabs({ value, onValueChange, counts }: ResourceTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as ResourceTab)}>
      <TabsList
        className="
          w-full grid grid-cols-3
          rounded-lg bg-muted
          overflow-hidden
          h-10
        "
        aria-label="Filtrar por tipo de recurso"
      >
        <TabsTrigger
          value="all"
          className="
            relative flex items-center justify-center
            text-sm font-medium leading-none
            text-muted-foreground
            cursor-pointer
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            transition-colors
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            rounded-none first:rounded-l-lg last:rounded-r-lg
          "
        >
          Todos
          {typeof counts?.all === 'number' && (
            <span className="absolute right-1 top-0 rounded-full bg-muted-foreground/15 px-2 py-[2px] text-[10px] font-medium text-muted-foreground">
              {counts.all}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="mine"
          className="
            relative flex items-center justify-center
            text-sm font-medium leading-none
            text-muted-foreground
            cursor-pointer
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            transition-colors
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            rounded-none first:rounded-l-lg last:rounded-r-lg
          "
        >
          Meus Recursos
          {typeof counts?.mine === 'number' && (
            <span className="absolute right-1 top-0 rounded-full bg-muted-foreground/15 px-2 py-[2px] text-[10px] font-medium text-muted-foreground">
              {counts.mine}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="free"
          className="
            relative flex items-center justify-center
            text-sm font-medium leading-none
            text-muted-foreground
            cursor-pointer
            data-[state=active]:bg-background
            data-[state=active]:text-foreground
            data-[state=active]:shadow-sm
            transition-colors
            focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
            rounded-none first:rounded-l-lg last:rounded-r-lg
          "
        >
          Gratuitos
          {typeof counts?.free === 'number' && (
            <span className="absolute right-1 top-0 rounded-full bg-muted-foreground/15 px-2 py-[2px] text-[10px] font-medium text-muted-foreground">
              {counts.free}
            </span>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
