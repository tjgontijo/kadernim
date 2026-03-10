'use client'

import React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Column {
  id: string
  label: string
  visible: boolean
}

interface ColumnToggleProps {
  columns: Column[]
  onChange: (columnId: string, visible: boolean) => void
}

export function ColumnToggle({ columns, onChange }: ColumnToggleProps) {
  const visibleCount = columns.filter((c) => c.visible).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs rounded-lg">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Colunas</span>
          <span className="ml-auto flex h-4 w-4 items-center justify-center rounded-sm bg-primary/10 text-[10px] font-bold text-primary">
            {visibleCount}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">Mostrar colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.visible}
            onCheckedChange={(checked) => onChange(column.id, checked)}
            className="text-xs"
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
