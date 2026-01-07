import React from 'react';
import { BookOpen, RefreshCw, Users, CheckCircle } from 'lucide-react';

export const SolutionFeatures: React.FC = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">

        {/* Bloco 3 - O que você encontra */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">O que você encontra na plataforma</h2>
          <p className="text-muted-foreground text-lg">Tudo que você precisa para dar uma aula incrível sem perder o fim de semana.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">

          {/* Feature 1 */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Uma biblioteca viva</h3>
            <p className="text-muted-foreground leading-relaxed">
              Centenas de atividades prontas para usar em sala de aula e novos materiais adicionados todos os meses. Nada de conteúdo parado. A plataforma está sempre crescendo.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
              <RefreshCw className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Gerador de planos BNCC</h3>
            <p className="text-muted-foreground leading-relaxed">
              Transforme os materiais em planos de aula organizados em poucos minutos. Ideal para quem quer planejar melhor, economizar tempo e manter tudo alinhado à BNCC sem esforço.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Comunidade que decide</h3>
            <p className="text-muted-foreground leading-relaxed">
              Todo mês, os recursos mais votados pelas professoras entram na plataforma. Você não só usa. Você ajuda a decidir o que será criado.
            </p>
          </div>
        </div>

        {/* Bloco 5 - Para quem é */}
        <div className="max-w-4xl mx-auto bg-card rounded-[2.5rem] p-8 md:p-12 border-2 border-primary/10">
          <h3 className="text-2xl font-bold text-center mb-10 text-foreground">Essa plataforma é para professoras que:</h3>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Querem praticidade no dia a dia",
              "Usam materiais prontos em sala de aula",
              "Cansaram de procurar atividades em vários lugares",
              "Querem planejar aulas com mais organização",
              "Valorizam o próprio tempo e descanso"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl">
                <div className="bg-success/10 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <span className="font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};