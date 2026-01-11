'use client';

import { QuizStep } from '@/components/client/quiz/QuizStep';
import { QuizAction } from '@/components/client/quiz/QuizAction';
import { FileUploadArea } from './file-upload-area';

interface QuestionContentProps {
    title: string;
    description: string;
    attachments: File[];
    maxFiles: number;
    maxSizeMB: number;
    onChange: (updates: { title?: string; description?: string; attachments?: File[] }) => void;
    onContinue: () => void;
}

export function QuestionContent({
    title,
    description,
    attachments,
    maxFiles,
    maxSizeMB,
    onChange,
    onContinue
}: QuestionContentProps) {
    const isValid = title.length >= 5 && description.length >= 20;

    return (
        <QuizStep
            title="Descreva o material que você precisa"
            description="Um título claro e uma descrição detalhada ajudam a comunidade a entender sua necessidade."
        >
            <div className="space-y-8">
                <div className="space-y-6">
                    {/* Título */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Título do Pedido</label>
                        <input
                            type="text"
                            className="w-full h-14 bg-muted/50 border-2 border-border/50 rounded-2xl px-5 font-bold text-lg focus:border-primary focus:bg-background transition-all outline-none"
                            placeholder="Ex: Jogo de tabuleiro sobre frações"
                            value={title}
                            onChange={(e) => onChange({ title: e.target.value })}
                            maxLength={100}
                        />
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Mínimo 5 caracteres</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{title.length}/100</p>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Descrição Detalhada</label>
                        <textarea
                            className="w-full h-40 bg-muted/50 border-2 border-border/50 rounded-[24px] p-5 font-medium focus:border-primary focus:bg-background transition-all outline-none resize-none"
                            placeholder="Descreva com detalhes o que você precisa, para qual contexto, e como pretende usar..."
                            value={description}
                            onChange={(e) => onChange({ description: e.target.value })}
                        />
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Mínimo 20 caracteres</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{description.length} caracteres</p>
                        </div>
                    </div>
                </div>

                {/* Upload de Arquivos */}
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Referências (Opcional)</label>
                    <FileUploadArea
                        files={attachments}
                        onFilesChange={(files) => onChange({ attachments: files })}
                        maxFiles={maxFiles}
                        maxSizeMB={maxSizeMB}
                    />
                </div>

                <div className="pt-4">
                    <QuizAction
                        label="Revisar Pedido"
                        disabled={!isValid}
                        onClick={onContinue}
                    />
                </div>
            </div>
        </QuizStep>
    );
}
