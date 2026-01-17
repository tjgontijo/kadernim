import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Os materiais são alinhados à BNCC?",
    answer: "Grande parte dos nossos materiais possui alinhamento à BNCC com a indicação das habilidades. Também oferecemos recursos criativos complementares para enriquecer sua aula. Para garantir 100% de alinhamento, você pode usar nosso Gerador de Planos de Aula, que utiliza a base oficial para criar seus planejamentos."
  },
  {
    question: "Como funciona a garantia e o cancelamento?",
    answer: "Oferecemos uma garantia incondicional de 7 dias conforme a lei. Experimente tudo e, se não gostar, devolvemos seu dinheiro integralmente. Como o plano Pro é anual, você garante um ano inteiro de acesso a todas as atualizações e novos materiais que lançamos toda semana."
  },
  {
    question: "Como funciona o Gerador de Planos de Aula?",
    answer: "Nosso gerador utiliza Inteligência Artificial treinada para criar planos de aula completos, estruturados e alinhados às suas necessidades pedagógicas. Você informa o tema, a série e as habilidades (opcional), e em segundos tem um planejamento pronto para baixar em Word ou PDF."
  },
  {
    question: "Posso solicitar materiais que não encontrei?",
    answer: "Sim! Como assinante Pro, você faz parte da nossa comunidade colaborativa. Se precisar de um material específico que ainda não temos, você pode abrir um pedido. Os temas mais votados pelos outros professores entram para a nossa fila de produção semanal."
  },
  {
    question: "Para quais séries são os materiais?",
    answer: "Focamos na Educação Infantil e Fundamental I (1º ao 5º ano). Nossa biblioteca cobre alfabetização, matemática, ciências, história, geografia e temas sazonais/datas comemorativas."
  },
  {
    question: "Posso baixar os materiais para imprimir?",
    answer: "Sim! Todos os materiais e planos gerados podem ser baixados em formato PDF ou Word (DOCX), prontos para impressão ou para você fazer seus próprios ajustes finais."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Dúvidas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-background border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                {openIndex === idx ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
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