'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitcherItem() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Sun className="h-4 w-4 mr-2 dark:hidden" />
        <Moon className="h-4 w-4 mr-2 hidden dark:block" />
        <span>Tema</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer">
            <Monitor className="h-4 w-4 mr-2" />
            <span>Sistema</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
            <Sun className="h-4 w-4 mr-2" />
            <span>Claro</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
            <Moon className="h-4 w-4 mr-2" />
            <span>Escuro</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
