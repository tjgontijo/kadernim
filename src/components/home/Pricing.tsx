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
          <h2 className="text-display-m mb-4">Acesso Total ao Kadernim</h2>
          <p className="text-ink-soft max-w-2xl mx-auto">
            Hoje, muitos professores pagam R$ 10 por um único material. Aqui, por um valor acessível, você tem acesso a tudo.
          </p>
        </div>

        <div className="flex flex-col justify-center items-center max-w-xl mx-auto">
          {/* Plano Pro - Single Focus */}
          <div className="w-full bg-surface-card rounded-r-5 p-8 border-2 border-terracotta shadow-3 flex flex-col relative focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-terracotta paper-grain">
            <div className="absolute top-0 right-0 left-0 bg-terracotta text-white text-center text-[11px] font-bold uppercase py-2 rounded-t-[22px] tracking-widest">
              Oferta de Lançamento
            </div>
            <div className="mt-6 mb-6">
              <h3 className="text-display-m text-terracotta flex items-center gap-3">
                Plano Pro
                <Sparkles className="h-7 w-7 text-mustard fill-mustard animate-pulse" aria-hidden="true" />
              </h3>
              <p className="text-ink-soft mt-2 font-medium">
                Acesso completo a todas as ferramentas e materiais do Kadernim.
              </p>
            </div>

            <div className="mb-8 min-h-[120px] flex flex-col justify-center">
              <div className="flex flex-col motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 items-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-ink-mute mr-1">R$</span>
                  <span className="text-6xl font-black text-ink tracking-tighter font-display">197</span>
                  <span className="text-sm font-bold text-ink-mute">,00</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-ink-soft uppercase tracking-widest mt-3 px-4 py-1.5 bg-paper-2 rounded-full border border-line">
                  <CreditCard className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  <span>ou 12x de R$ 20,37 no cartão</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mb-8 h-14 text-lg font-bold bg-terracotta text-white shadow-lg shadow-terracotta/20 group"
              onClick={() => window.open("https://seguro.profdidatica.com.br/r/TMNDJH4WEN?utm_source=app&utm_medium=pricing_page&utm_campaign=launch", "_blank")}
              aria-label="Quero ser Assinante Pro - Clique para ir para checkout"
            >
              Quero ser Assinante Pro
              <Sparkles className="ml-2 h-5 w-5 group-hover:motion-safe:rotate-12 transition-transform" />
            </Button>

            <ul className="space-y-4 flex-1" aria-label="Benefícios do Plano Pro">
              {[
                "Acesso ilimitado à biblioteca de recursos",
                "Download ilimitado de materiais pedagógicos",
                "Materiais organizados por série e disciplina",
                "Novos materiais exclusivos toda semana",
                "Suporte via WhatsApp",
                "Formatos prontos para impressão"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm font-semibold text-ink-soft">
                  <div className="bg-sage-2 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0 border border-sage/20">
                    <Check className="h-3 w-3 text-sage shrink-0" strokeWidth={3} aria-hidden="true" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-paper-2 rounded-r-4 p-6 border border-line shadow-1">
            <h4 className="font-bold text-ink mb-2">Garantia Incondicional de 7 dias</h4>
            <p className="text-ink-soft text-sm">
              Experimente a plataforma sem risco. Se em até 7 dias você sentir que o Kadernim<br />
              não é para você, devolvemos 100% do seu investimento. Sem perguntas.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
