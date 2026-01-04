'use client';

import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[32px] bg-muted/20 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Sparkles className="h-12 w-12 text-primary fill-current" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum pedido feito ainda</h3>
            <p className="text-muted-foreground max-w-sm mb-8 text-sm font-medium">
                Seja a primeira pessoa a sugerir um material novo para a comunidade este mês e ajude a crescer nossa biblioteca!
            </p>
            <Button
                onClick={onCreateClick}
                size="lg"
                className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1"
            >
                <Plus className="h-5 w-5 mr-2" />
                Sugerir Meu Primeiro Material
            </Button>
        </div>
    );
}
