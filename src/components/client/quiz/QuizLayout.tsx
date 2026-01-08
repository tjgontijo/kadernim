'use client';

import { ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerPortal } from '@/components/ui/drawer';
import { QuizHeader } from './QuizHeader';

interface QuizLayoutProps {
    open: boolean;
    onClose: () => void;
    title: string;
    currentStep: number;
    totalSteps: number;
    onBack?: () => void;
    showBack?: boolean;
    children: ReactNode;
}

export function QuizLayout({
    open,
    onClose,
    title,
    currentStep,
    totalSteps,
    onBack,
    showBack,
    children
}: QuizLayoutProps) {
    return (
        <Drawer
            open={open}
            onOpenChange={(val) => {
                if (!val) onClose();
            }}
            shouldScaleBackground={false}
            direction="bottom"
            dismissible={false} // Evita fechar arrastando se estiver no meio do quiz
        >
            <DrawerPortal>
                <DrawerContent
                    className="!mt-0 !top-0 !bottom-0 !inset-0 !h-screen !max-h-screen rounded-none border-none bg-background flex flex-col overflow-hidden [&>div:first-child]:hidden"
                    onPointerDownOutside={(e) => e.preventDefault()} // Impede fechar ao clicar fora acidentalmente
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>Wizard em formato de quiz para criação de conteúdo.</DrawerDescription>
                    </DrawerHeader>

                    <QuizHeader
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        title={title}
                        onBack={onBack}
                        showBack={showBack}
                    />

                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </DrawerContent>
            </DrawerPortal>
        </Drawer>
    );
}
