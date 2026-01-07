import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Heart } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-pattern py-20 lg:py-32">
      {/* Friendly, organic background decorations */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-secondary/20 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl opacity-60"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 bg-card border border-secondary/30 rounded-full px-4 py-1.5 text-sm font-bold text-secondary-foreground mb-8 shadow-sm">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>Todo mês tem novidade na plataforma</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-8 leading-tight">
            Pare de perder horas procurando materiais <br className="hidden md:block" />
            <span className="text-primary relative inline-block">
              para suas aulas.
              {/* Underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            Uma biblioteca viva com atividades prontas, plano de aula alinhado à BNCC e uma comunidade de professoras que decide o que entra na plataforma.
          </p>

          <div className="mt-6 font-handwriting text-primary/80 rotate-1">
            ~ Todo mês, novos recursos pedagógicos prontos chegam até você.
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto group">
              Quero simplificar minha rotina
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-semibold text-muted-foreground">
            <span className="flex items-center gap-2 bg-card/50 px-3 py-1 rounded-full border border-border">
              <Heart className="h-4 w-4 text-destructive fill-destructive" />
              Feito por quem entende de sala de aula
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};