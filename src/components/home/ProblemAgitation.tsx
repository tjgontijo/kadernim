import React from 'react';
import { Frown, Smile, Check, X } from 'lucide-react';

export const ProblemAgitation: React.FC = () => {
  return (
    <section className="bg-card py-24 relative">
      <div className="container mx-auto px-4">

        {/* Bloco 1 - Identificação do Problema */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            Se você é professor, provavelmente já viveu isso:
          </h2>

          <div className="bg-muted/30 p-8 rounded-3xl border border-dashed border-destructive/30 relative">
            <div className="absolute -top-5 -left-5 bg-card p-2 rounded-full shadow-sm border border-destructive/20">
              <Frown className="h-10 w-10 text-destructive" />
            </div>

            <ul className="space-y-4">
              {[
                "Você precisa preparar uma aula.",
                "Abre vários sites, Pinterest e Google.",
                "Compra um material aqui, outro ali.",
                "Adapta tudo em cima da hora porque nada encaixa direito.",
                "E ainda sente que poderia estar melhor organizado."
              ].map((item, i) => (
                <li key={i} className="flex items-start text-lg text-muted-foreground">
                  <X className="h-6 w-6 text-destructive shrink-0 mr-3 mt-1" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-destructive/10 text-center font-bold text-destructive">
              No fim do mês, você gastou dinheiro com materiais soltos e tempo demais fora da sala de aula.
            </div>
          </div>
        </div>

        {/* Bloco 2 - A Nova Forma */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-secondary/5 rounded-3xl p-8 md:p-12 border-2 border-secondary/20 shadow-xl relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm mb-4">
                  <Smile className="h-5 w-5" />
                  A Solução
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Em vez de procurar materiais toda semana...
                </h2>
                <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                  Você passa a ter acesso a um <strong>único lugar com tudo organizado.</strong>
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Uma plataforma feita para professores que querem praticidade. Todo mês, em média, <strong className="text-secondary-foreground bg-secondary/20 px-1 rounded">20 novos materiais pedagógicos</strong> são adicionados.
                </p>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-secondary/10">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Check className="h-5 w-5 text-success" />
                    Simples assim:
                  </h3>
                  <p className="text-muted-foreground">Você entra, escolhe, imprime e usa. Sem complicação.</p>
                </div>
              </div>

              {/* Illustration Placeholder - Abstract Folder/Files */}
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="relative bg-card p-4 rounded-2xl shadow-lg rotate-3 border border-border">
                  <div className="w-40 h-52 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <span className="text-muted-foreground text-center text-sm px-2">Atividades<br />Prontas</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold shadow-lg text-sm">
                    Pronto para imprimir
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};