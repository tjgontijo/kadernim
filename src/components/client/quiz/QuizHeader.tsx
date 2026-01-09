'use client';

import { ReactNode } from 'react';
import { ArrowLeft, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DrawerClose } from '@/components/ui/drawer';
import { QuizProgress } from './QuizProgress';
import { QuizMomentProgress } from './QuizMomentProgress';

interface QuizHeaderProps {
    title: string;
    onBack?: () => void;
    showBack?: boolean;
    // Para progresso tradicional (steps)
    currentStep?: number;
    totalSteps?: number;
    // Para progresso de momentos (3 bolhas)
    currentMoment?: 1 | 2 | 3;
    momentLabels?: [string, string, string];
    // Ou um componente customizado
    progressComponent?: ReactNode;
}

export function QuizHeader({
    title,
    onBack,
    showBack,
    currentStep,
    totalSteps,
    currentMoment,
    momentLabels,
    progressComponent
}: QuizHeaderProps) {
    // Determinar qual progresso mostrar
    const renderProgress = () => {
        if (progressComponent) {
            return progressComponent;
        }
        if (currentMoment) {
            return <QuizMomentProgress currentMoment={currentMoment} labels={momentLabels} />;
        }
        if (currentStep && totalSteps) {
            return <QuizProgress current={currentStep} total={totalSteps} />;
        }
        return null;
    };

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

                {renderProgress()}

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
