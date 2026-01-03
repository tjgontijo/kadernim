'use client'

import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

interface CrudEditDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    subtitle?: string
    icon?: React.ElementType
    children: React.ReactNode
    onSave?: () => void
    isSaving?: boolean
    saveLabel?: string
    maxWidth?: 'max-w-4xl' | 'max-w-5xl' | 'max-w-7xl' | 'max-w-none'
    showFooter?: boolean
}

export function CrudEditDrawer({
    open,
    onOpenChange,
    title,
    subtitle,
    icon: Icon,
    children,
    onSave,
    isSaving = false,
    saveLabel = 'Salvar Alterações',
    maxWidth = 'max-w-7xl',
    showFooter = true
}: CrudEditDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
            <DrawerContent className="h-[100dvh] max-h-none rounded-none border-none bg-background data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className={cn("mx-auto w-full flex flex-col h-full overflow-hidden", maxWidth)}>
                    <DrawerHeader className="border-b pb-4 shrink-0 px-6 pt-6 text-left">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                                {Icon && (
                                    <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <DrawerTitle className="text-xl font-bold tracking-tight truncate">
                                        {title}
                                    </DrawerTitle>
                                    {subtitle ? (
                                        <DrawerDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">
                                            {subtitle}
                                        </DrawerDescription>
                                    ) : (
                                        <DrawerDescription className="sr-only">Formulário de edição do sistema.</DrawerDescription>
                                    )}
                                </div>
                            </div>

                            <DrawerClose asChild>
                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/80">
                                    <X className="h-5 w-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin focus:outline-none">
                        <div className="w-full pb-20">
                            {children}
                        </div>
                    </div>

                    {showFooter && (
                        <DrawerFooter className="border-t pt-6 bg-background/80 backdrop-blur-md shrink-0 px-6 pb-10">
                            <div className="flex gap-4">
                                <DrawerClose asChild>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted transition-all"
                                        disabled={isSaving}
                                    >
                                        Descartar
                                    </Button>
                                </DrawerClose>
                                {onSave && (
                                    <Button
                                        className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        onClick={onSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-3" />
                                                Processando...
                                            </>
                                        ) : (
                                            saveLabel
                                        )}
                                    </Button>
                                )}
                            </div>
                        </DrawerFooter>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
