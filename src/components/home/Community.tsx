import React from 'react';
import { MessageCircle, HeartHandshake } from 'lucide-react';

export const Community: React.FC = () => {
  return (
    <section className="py-16 bg-secondary/10 border-y border-secondary/20">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-card rounded-full shadow-md mb-6 animate-bounce">
          <HeartHandshake className="h-8 w-8 text-secondary" />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-foreground">Feito com você, não apenas para você</h2>
        <p className="max-w-2xl mx-auto text-lg text-foreground/80 leading-relaxed">
          Cansada de comprar pacotes onde metade das atividades não serve para sua turma?
          Aqui, todo mês abrimos uma votação. Você diz o que precisa (ex: "Jogos sobre Folclore para 2º ano") e nós criamos.
        </p>
      </div>
    </section>
  );
};