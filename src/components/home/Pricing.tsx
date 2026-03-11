'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star, Sparkles, CreditCard } from 'lucide-react';

export const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section id="oferta" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-pattern opacity-50 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-4 text-foreground dark:text-slate-50">Acesso Total ao Kadernim</h2>
          <p className="text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">
            Hoje, muitos professores pagam R$ 10 por um único material. Aqui, por um valor acessível, você tem acesso a tudo.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center max-w-xl mx-auto">
          {/* Plano Pro - Single Focus */}
          <div className="w-full bg-card dark:bg-slate-800 rounded-3xl p-8 border-2 border-primary dark:border-blue-500 shadow-xl dark:shadow-blue-500/20 flex flex-col relative focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
            <div className="absolute top-0 right-0 left-0 bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white text-center text-xs font-bold uppercase py-2 rounded-t-2xl tracking-wide">
              Oferta de Lançamento
            </div>
            <div className="mt-6 mb-6">
              <h3 className="text-2xl font-bold text-primary dark:text-blue-400 flex items-center gap-2">
                Plano Pro
                <Sparkles className="h-6 w-6 fill-primary dark:fill-blue-400 text-primary dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
              </h3>
              <p className="text-sm text-muted-foreground dark:text-slate-300 mt-2 font-medium">
                Acesso completo a todas as ferramentas e materiais do Kadernim.
              </p>
            </div>

            <div className="mb-8 min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-foreground">12x de</span>
                  <span className="text-5xl font-extrabold text-foreground dark:text-primary tracking-tighter">R$ 20,37</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-1">
                  <CreditCard className="w-3 h-3" aria-hidden="true" />
                  <span>no cartão de crédito</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 dark:border-border">
                  <p className="text-sm text-muted-foreground dark:text-slate-300">
                    ou <span className="font-bold text-foreground dark:text-primary">R$ 197,00</span> à vista no PIX
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mb-8 h-14 text-lg font-bold shadow-primary/25 shadow-lg group focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => window.open("https://seguro.profdidatica.com.br/r/TMNDJH4WEN?utm_source=app&utm_medium=pricing_page&utm_campaign=launch", "_blank")}
              aria-label="Quero ser Assinante Pro - Clique para ir para checkout"
            >
              Quero ser Assinante Pro
              <Sparkles className="ml-2 h-5 w-5 group-hover:motion-safe:rotate-12 transition-transform" />
            </Button>

            <ul className="space-y-4 flex-1" aria-label="Benefícios do Plano Pro">
              {[
                "Acesso ilimitado à biblioteca de recursos",
                "Gerador de Planos de Aula (IA/BNCC)",
                "Download ilimitado de materiais pedagógicos",
                "Participação na comunidade colaborativa",
                "Votar e sugerir novos materiais mensalmente",
                "Novos materiais exclusivos toda semana"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm font-semibold text-foreground dark:text-slate-100">
                  <div className="bg-primary/10 dark:bg-blue-500/20 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                    <Check className="h-4 w-4 text-primary dark:text-blue-400 shrink-0" aria-hidden="true" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-muted/50 dark:bg-slate-800/50 rounded-2xl p-6 border border-border dark:border-slate-700">
            <h4 className="font-bold text-foreground dark:text-slate-100 mb-2">Garantia Incondicional de 7 dias</h4>
            <p className="text-muted-foreground dark:text-slate-300 text-sm">
              Experimente a plataforma sem risco. Se em até 7 dias você sentir que o Kadernim<br />
              não é para você, devolvemos 100% do seu investimento. Sem perguntas.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
