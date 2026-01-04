'use client';

import { ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
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
    // Hide header for special steps like loading/success if needed, 
    // but usually they stay for consistency.

    return (
        <Drawer open={open} onOpenChange={onClose} shouldScaleBackground={false} direction="bottom">
            <DrawerContent className="!mt-0 !top-0 !bottom-0 !inset-0 !h-screen !max-h-screen rounded-none border-none bg-background flex flex-col overflow-hidden [&>div:first-child]:hidden">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>Wizard em formato de quiz.</DrawerDescription>
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
        </Drawer>
    );
}
