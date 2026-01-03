'use client';

import { ReactNode } from 'react';

interface QuizQuestionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * QuizQuestion - Container para perguntas do wizard
 *
 * Layout consistente com título, descrição opcional e conteúdo
 */
export function QuizQuestion({ title, description, children }: QuizQuestionProps) {
  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto">
      {/* Título e descrição */}
      <div className="flex flex-col gap-2 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Conteúdo da pergunta */}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
