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
          <h2 className="text-3xl font-bold mb-4">Escolha o melhor plano para sua rotina</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hoje, muitas professoras pagam R$ 10 por um único material. Aqui, por um valor acessível, você tem acesso a tudo.
          </p>
        </div>

        {/* Toggle Mensal/Anual - Visual Friendly */}
        <div className="flex justify-center items-center gap-4 mb-16">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>Mensal</span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-16 h-9 bg-muted rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Alternar entre mensal e anual"
          >
            <div className={`w-7 h-7 bg-card rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isAnnual ? 'translate-x-7' : 'translate-x-0'}`}>
              {isAnnual && <Sparkles className="w-4 h-4 text-secondary" />}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>Anual</span>
            <span className="bg-secondary/10 text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full border border-secondary/20 animate-pulse">
              Melhor Opção
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto">

          {/* Plano Essencial */}
          <div className="flex-1 bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col hover:border-primary/30 transition-colors">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">Plano Essencial</h3>
              <p className="text-sm text-muted-foreground mt-2">Para quem quer praticidade e rapidez.</p>
            </div>

            <div className="mb-8 min-h-[100px] flex flex-col justify-center">
              {isAnnual ? (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">12x</span>
                    <span className="text-4xl font-extrabold text-foreground">R$ 19,90</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-1">
                    <CreditCard className="w-3 h-3" />
                    no cartão de crédito
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ou R$ 199,00 à vista
                  </p>
                </div>
              ) : (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">R$ 27,90</span>
                    <span className="text-muted-foreground text-sm">/ mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 opacity-0 select-none">placeholder</p>
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full mb-8" onClick={() => alert("Checkout Link Essencial")}>
              Quero o Essencial
            </Button>
            <ul className="space-y-4 flex-1">
              {[
                "Acesso à biblioteca completa",
                "Novos recursos todo mês",
                "Download imediato",
                "Uso liberado em sala de aula"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm text-foreground/80">
                  <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Plano Completo - Featured */}
          <div className="flex-1 bg-card rounded-3xl p-8 border-2 border-primary shadow-xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground text-center text-xs font-bold uppercase py-2 rounded-t-2xl tracking-wide">
              Mais Escolhido pelas Professoras
            </div>
            <div className="mt-6 mb-6">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                Plano Completo
                <Star className="h-5 w-5 fill-primary text-primary" />
              </h3>
              <p className="text-sm text-muted-foreground mt-2">Para quem quer planejar melhor o ano inteiro.</p>
            </div>

            <div className="mb-8 min-h-[100px] flex flex-col justify-center">
              {isAnnual ? (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">12x</span>
                    <span className="text-5xl font-extrabold text-foreground">R$ 29,90</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium mt-1">
                    <CreditCard className="w-3 h-3" />
                    no cartão de crédito
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ou R$ 299,00 à vista
                  </p>
                </div>
              ) : (
                <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-foreground">R$ 37,90</span>
                    <span className="text-muted-foreground text-sm">/ mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 opacity-0 select-none">placeholder</p>
                </div>
              )}
            </div>

            <Button size="lg" className="w-full mb-8 shadow-primary/25 shadow-lg" onClick={() => alert("Checkout Link Completo")}>
              Quero o Plano Completo
            </Button>
            <ul className="space-y-4 flex-1">
              {[
                "Tudo do plano Essencial",
                "Gerador de plano de aula (BNCC)",
                "Salvar, editar e reutilizar planos",
                "Participação na comunidade",
                "Votar e solicitar novos materiais"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm font-medium text-foreground">
                  <div className="bg-primary/10 rounded-full p-0.5 mr-3">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bloco 7 - Garantia */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-muted/50 rounded-2xl p-6 border border-border">
            <h4 className="font-bold text-foreground mb-2">Garantia de simplicidade</h4>
            <p className="text-muted-foreground text-sm">
              Sem fidelidade. Você pode cancelar quando quiser.<br />
              Se não fizer sentido para você, basta um clique.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};