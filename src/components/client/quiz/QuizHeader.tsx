'use client';

import { ArrowLeft, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerClose } from '@/components/ui/drawer';
import { QuizProgress } from './QuizProgress';

interface QuizHeaderProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    onBack?: () => void;
    showBack?: boolean;
}

export function QuizHeader({
    currentStep,
    totalSteps,
    title,
    onBack,
    showBack
}: QuizHeaderProps) {
    return (
        <div className="border-b pb-4 pt-6 px-6 shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center justify-between mb-6">
                <div className="w-12">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-muted"
                            onClick={onBack}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                <QuizProgress current={currentStep} total={totalSteps} />

                <div className="w-12 flex justify-end">
                    <DrawerClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <X className="h-5 w-5" />
                        </Button>
                    </DrawerClose>
                </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Sparkles className="h-5 w-5 text-primary fill-current" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            </div>
        </div>
    );
}
