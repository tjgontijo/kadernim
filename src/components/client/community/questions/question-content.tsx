'use client';

import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';

interface QuestionContentProps {
    title: string;
    description: string;
    onChange: (updates: { title?: string; description?: string }) => void;
    onContinue: () => void;
}

export function QuestionContent({
    title,
    description,
    onChange,
    onContinue
}: QuestionContentProps) {
    const isValid = title.length >= 10 && description.length >= 20;

    return (
        <QuizStep
            title="Descreva o material que você precisa"
            description="Um título claro e uma descrição detalhada ajudam a comunidade a entender sua necessidade."
        >
            <div className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Título</label>
                    <input
                        type="text"
                        className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-4 font-medium focus:border-primary focus:ring-0 transition-all outline-none"
                        placeholder="Ex: Jogo de tabuleiro sobre frações"
                        value={title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">{title.length}/100 caracteres (mínimo 10)</p>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Descrição detalhada</label>
                    <textarea
                        className="w-full h-32 bg-muted/50 border-2 border-border/50 rounded-2xl p-4 font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-none"
                        placeholder="Descreva com detalhes o que você precisa, para qual contexto, e como pretende usar..."
                        value={description}
                        onChange={(e) => onChange({ description: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">{description.length} caracteres (mínimo 20)</p>
                </div>

                {/* Upload Placeholder (Fase 04) */}
                <div className="p-8 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 bg-muted/20">
                    <p className="text-sm font-bold text-muted-foreground">Upload de referências (Em breve)</p>
                    <p className="text-xs text-muted-foreground">Você poderá anexar imagens ou PDFs na próxima fase.</p>
                </div>

                <QuizAction
                    label="Revisar"
                    disabled={!isValid}
                    onClick={onContinue}
                />
            </div>
        </QuizStep>
    );
}
