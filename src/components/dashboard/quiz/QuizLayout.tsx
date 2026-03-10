'use client';

import { ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerPortal } from '@/components/ui/drawer';
import { QuizHeader } from './QuizHeader';

interface QuizLayoutProps {
    open: boolean;
    onClose: () => void;
    title: string;
    onBack?: () => void;
    showBack?: boolean;
    children: ReactNode;
    // Para progresso tradicional (steps)
    currentStep?: number;
    totalSteps?: number;
    // Para progresso de momentos (3 bolhas)
    currentMoment?: 1 | 2 | 3;
    momentLabels?: [string, string, string];
}

export function QuizLayout({
    open,
    onClose,
    title,
    onBack,
    showBack,
    children,
    currentStep,
    totalSteps,
    currentMoment,
    momentLabels
}: QuizLayoutProps) {
    return (
        <Drawer
            open={open}
            onOpenChange={(val) => {
                if (!val) onClose();
            }}
            shouldScaleBackground={false}
            direction="bottom"
            dismissible={true}
        >
            <DrawerPortal>
                <DrawerContent
                    className="!mt-0 !top-0 !bottom-0 !inset-0 !h-screen !max-h-screen rounded-none border-none bg-background flex flex-col overflow-hidden [&>div:first-child]:hidden"
                >
                    <DrawerHeader className="sr-only">
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>Wizard em formato de quiz para criação de conteúdo.</DrawerDescription>
                    </DrawerHeader>

                    <QuizHeader
                        title={title}
                        onBack={onBack}
                        showBack={showBack}
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        currentMoment={currentMoment}
                        momentLabels={momentLabels}
                    />

                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </DrawerContent>
            </DrawerPortal>
        </Drawer>
    );
}
