'use client';

import { Plus, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/30 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
                <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum plano criado ainda</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
                Comece a criar planos de aula personalizados seguindo a BNCC em segundos com nossa inteligência artificial.
            </p>
            <Button onClick={onCreateClick} size="lg" className="rounded-full px-8">
                <Plus className="h-5 w-5 mr-2" />
                Criar Meu Primeiro Plano
            </Button>
        </div>
    );
}
