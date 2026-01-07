import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Os materiais são alinhados à BNCC?",
    answer: "Sim! Todos os materiais possuem indicação das habilidades da BNCC trabalhadas. Além disso, nosso Gerador de Planos de Aula cria o planejamento completo com os códigos da base automaticamente para você."
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Com certeza. Não acreditamos em prender ninguém. Se em algum mês você sentir que não precisa, pode cancelar a renovação com um clique no seu painel. Sem multas, sem letras miúdas."
  },
  {
    question: "Para quais séries são os materiais?",
    answer: "Atualmente, focamos na Educação Infantil e Fundamental I (1º ao 5º ano). Cobrimos alfabetização, matemática, ciências, história, geografia e datas comemorativas."
  },
  {
    question: "Como recebo os materiais?",
    answer: "O acesso é 100% online. Assim que sua assinatura é confirmada, você recebe login e senha para entrar na nossa plataforma. Lá você pode pesquisar, visualizar e baixar tudo na hora."
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