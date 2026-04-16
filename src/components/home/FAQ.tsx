'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como funciona a garantia e o cancelamento?",
    answer: "Oferecemos uma garantia incondicional de 7 dias conforme a lei. Experimente tudo e, se não gostar, devolvemos seu dinheiro integralmente. Você garante acesso a todas as atualizações e novos materiais que lançamos toda semana."
  },
  {
    question: "Para quais séries são os materiais?",
    answer: "Focamos na Educação Infantil e Fundamental I (1º ao 5º ano). Nossa biblioteca cobre alfabetização, matemática, ciências, história, geografia e temas sazonais/datas comemorativas."
  },
  {
    question: "Como recebo as novidades?",
    answer: "Toda semana novos materiais são adicionados diretamente na plataforma. Você pode acessar de qualquer lugar e baixar os arquivos que precisar para suas aulas."
  },
  {
    question: "Posso baixar os materiais para imprimir?",
    answer: "Sim! Todos os materiais podem ser baixados em formato PDF, prontos para impressão ou para você usar em seus planejamentos."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-muted/30 dark:bg-slate-900/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground dark:text-slate-50">Dúvidas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-background border border-border rounded-lg overflow-hidden dark:border-slate-700">
              <button
                id={`faq-${idx}`}
                className="w-full flex items-center justify-between p-5 text-left focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none transition-colors hover:bg-muted/50 dark:hover:bg-slate-800"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-content-${idx}`}
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                )}
              </button>
              {openIndex === idx && (
                <div
                  id={`faq-content-${idx}`}
                  className="px-5 pb-5 text-muted-foreground dark:text-slate-300 leading-relaxed motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200"
                  role="region"
                  aria-labelledby={`faq-${idx}`}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};