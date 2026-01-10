'use client'

import React from 'react'
import { LucideIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FilterOption {
  value: string
  label: string
}

interface FilterButtonProps {
  label: string
  icon: LucideIcon
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

export function FilterButton({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: FilterButtonProps) {
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-dashed text-xs">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}:</span>
          <Badge variant="secondary" className="px-1 font-normal rounded-sm text-[10px]">
            {selectedOption?.label || 'Todos'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value === option.value}
            onCheckedChange={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
