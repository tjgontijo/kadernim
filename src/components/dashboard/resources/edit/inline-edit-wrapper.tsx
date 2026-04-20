'use client'

import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils/index'

interface InlineEditWrapperProps {
  canEdit: boolean
  title: string
  children: React.ReactNode
  editor: (props: { onClose: () => void }) => React.ReactNode
  dialogClassName?: string
}

export function InlineEditWrapper({ 
  canEdit, 
  title, 
  children, 
  editor,
  dialogClassName = 'sm:max-w-3xl' 
}: InlineEditWrapperProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => setIsOpen(false)

  if (!canEdit) return <>{children}</>

  return (
    <div className="group relative">
      {/* Absolute Edit Button */}
      <div className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
        <Button
          size="icon-sm"
          className="rounded-full shadow-tape bg-mustard text-ink hover:bg-[#d6a524] border border-[#d6a524]/20 font-bold"
          onClick={() => setIsOpen(true)}
          title={`Editar ${title}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* The actual content */}
      <div className="rounded-[24px] transition-all duration-300 group-hover:bg-[#fcfaf7] group-hover:shadow-1 group-hover:-translate-y-0.5 group-hover:ring-1 group-hover:ring-line/60">
        {children}
      </div>

      {/* The Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={cn("max-h-[85vh] !flex !flex-col !gap-0 overflow-hidden p-0 border-line shadow-3 rounded-[24px] bg-card", dialogClassName)}>
          <DialogHeader className="p-6 pb-5 bg-[#f5f1eb] border-b border-dashed border-line shrink-0 relative">
            <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 -rotate-1 w-[80px] h-[20px] bg-[#dfd6cd] shadow-[0_2px_6px_oklch(0.3_0.02_60/0.15)] border-x border-dashed border-x-[#c2b6ab] z-10 opacity-90" />
            <DialogTitle className="font-display text-[22px] font-semibold text-ink flex items-center gap-2">
              <Pencil className="h-5 w-5 text-mustard" />
              Editar {title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-card">
            {editor({ onClose: handleClose })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
