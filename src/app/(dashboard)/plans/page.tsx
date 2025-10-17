'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Users, Award, Download, Star, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { usePlanOffers } from '@/hooks/use-plan-offers'

export default function PlansPage() {
  const { plans, isLoading: plansLoading } = usePlanOffers()

  // Valores fixos (stats mudam raramente)
  const totalResources = 200
  const totalSubjects = 7

  if (plansLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex h-60 items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </div>
    )
  }

  // Ordenar planos por preço
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Hero Section - Primeira Dobra */}
      <div className="min-h-[85vh] flex flex-col justify-center py-6 md:py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-full mb-8 shadow-sm">
             <span className="text-xs text-indigo-900 dark:text-indigo-100">
              Desbloqueie Todos os Recursos da Plataforma
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight uppercase">
            Economize horas de preparo e tenha aulas prontas na palma da sua mão
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            Acesse imediatamente mais de {totalResources} recursos pedagógicos do infantil até o fundamental II, usados e aprovados por mais de 8 mil professoras.
          </p>

          {/* Social Proof Bar */}
          <div className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-xl p-4 md:p-6 border border-indigo-200 dark:border-indigo-800 shadow-lg">
            <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  <span className="text-2xl md:text-3xl font-bold text-indigo-600">+8k</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Professoras</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Download className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  <span className="text-2xl md:text-3xl font-bold text-purple-600">{totalResources}+</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Recursos</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-pink-600" />
                  <span className="text-2xl md:text-3xl font-bold text-pink-600">4.8</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">Avaliação</p>
              </div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild
              size="lg" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold text-lg px-8 py-6 shadow-xl"
            >
              <Link href="#planos">
                Conhecer Planos                
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Benefícios do Premium */}
      <div className="mb-16 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            O jeito mais fácil de ter aulas incríveis toda semana
          </h2>
          
          <div className="prose prose-lg max-w-none text-left">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
              Você não precisa mais passar horas procurando ideias ou adaptando atividades. No Kadernim, tudo já está pronto e pensado por quem vive a mesma rotina que você. São recursos criativos, alinhados à BNCC e testados por milhares de professoras que também buscam aulas leves, bonitas e eficazes.
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
              Toda semana, novos materiais chegam para deixar suas aulas sempre diferentes e cheias de novidades. Tudo pronto para usar, sem complicação.
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-4">
              E o melhor: dentro do Kadernim, você pode pedir o material que quiser. As sugestões são votadas por outras professoras, e os mais votados viram os próximos lançamentos. É a comunidade decidindo juntas o que vai facilitar o trabalho de todo mundo.
            </p>
            
            <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
              O Kadernim é o apoio que toda professora precisa para ensinar com mais leveza, criatividade e tempo livre.
            </p>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div id="planos" className="mb-16 scroll-mt-8">
        <h2 className="text-3xl font-bold text-center mb-4">
          Escolha o plano que combina com sua rotina
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Todos os planos incluem acesso completo a {totalResources}+ recursos de {totalSubjects}+ categorias distintas.
        </p>

        <div className="grid gap-16 md:gap-14 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {sortedPlans.map((plan, index) => {
            const isPopular = index === 1 // Plano do meio é o mais popular
            const isBestValue = index === 2 // Plano anual é melhor valor
            const monthlyPrice = plan.priceMonthly ?? (plan.durationDays ? plan.price / (plan.durationDays / 30) : plan.price)
            const months = plan.durationDays ? Math.floor(plan.durationDays / 30) : 0
            const savings = index === 2 ? Math.round(((sortedPlans[0].price * 4) - plan.price) / (sortedPlans[0].price * 4) * 100) : 0

            return (
              <Card 
                key={plan.id} 
                className={`relative p-8 flex flex-col ${
                  isPopular ? 'border-4 border-indigo-500 shadow-2xl scale-105' : 
                  isBestValue ? 'border-2 border-purple-300 shadow-xl' : 
                  'border-2'
                }`}
              >
                {/* Badge de destaque */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                      <Sparkles className="h-4 w-4 mr-1" />
                      MAIS ESCOLHIDO
                    </Badge>
                  </div>
                )}
                {isBestValue && !isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                      <Award className="h-4 w-4 mr-1" />
                      MELHOR VALOR
                    </Badge>
                  </div>
                )}

                {/* Cabeçalho do Plano */}
                <div className="mb-2">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {plan.priceFormatted}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    (Apenas <strong className="text-indigo-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyPrice)}
                    </strong> por mês)
                  </p>
                  
                  {/* Descrição do plano */}
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {index === 0 && 'Ideal para quem quer conhecer o Kadernim e testar todos os recursos.'}
                    {index === 1 && 'Feito para quem quer transformar a rotina de aulas e fazer parte da comunidade ativa de professoras.'}
                    {index === 2 && 'Para quem quer ter o Kadernim como aliado o ano inteiro.'}
                  </p>
                  
                  {isBestValue && savings > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      💰 Economize {savings}%
                    </Badge>
                  )}
                </div>

                {/* Benefícios */}
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Acesso completo por {months} {months === 1 ? 'mês' : 'meses'}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      Mais de {totalResources}+ materiais prontos para usar
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Novos conteúdos adicionados toda semana</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Experiência sem anúncios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      {index === 0 ? 'Suporte por e-mail' : 'Suporte via WhatsApp'}
                    </span>
                  </li>
                  {(index === 1 || index === 2) && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Pode solicitar novos materiais e votar nas próximas criações</span>
                    </li>
                  )}
                  {index === 2 && (
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Conteúdos exclusivos para assinantes anuais</span>
                    </li>
                  )}
                </ul>
                
                {/* Texto de fechamento */}
                <p className="text-xs text-muted-foreground italic mb-6 text-center">
                  {index === 0 && 'Perfeito para experimentar o Kadernim e entender como ele facilita sua rotina.'}
                  {index === 1 && 'A escolha inteligente para quem quer praticidade e voz dentro do Kadernim.'}
                  {index === 2 && 'Para quem já sabe o valor de ter tudo pronto o ano inteiro.'}
                </p>

                {/* CTA */}
                {plan.linkCheckout ? (
                  <Link href={plan.linkCheckout} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button 
                      className={`w-full py-6 text-base font-bold ${
                        isPopular 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg' 
                          : isBestValue
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
                      }`}
                      size="lg"
                    >
                      Desbloquear Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full py-6 text-base font-bold"
                    size="lg"
                    disabled
                  >
                    Em Breve
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      </div>


      {/* Depoimentos */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          ⭐ O Que Nossas Professoras Dizem
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 italic">
              &ldquo;Economizo pelo menos 5 horas por semana com os planejamentos prontos. 
              Minha vida mudou completamente!&rdquo;
            </p>
            <p className="text-sm font-semibold">— Profª Ana Paula</p>
            <p className="text-xs text-muted-foreground">Educação Infantil</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 italic">
              &ldquo;Os materiais são de altíssima qualidade. Meus alunos adoram as atividades 
              e eu tenho mais tempo para focar no que realmente importa.&rdquo;
            </p>
            <p className="text-sm font-semibold">— Profª Carla Santos</p>
            <p className="text-xs text-muted-foreground">1º Ano Fundamental</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 italic">
              &ldquo;Melhor investimento que fiz na minha carreira. Vale cada centavo! 
              Recomendo de olhos fechados.&rdquo;
            </p>
            <p className="text-sm font-semibold">— Profª Maria Oliveira</p>
            <p className="text-xs text-muted-foreground">2º Ano Fundamental</p>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          ❓ Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Posso cancelar quando quiser?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Você pode cancelar sua assinatura a qualquer momento. 
              Seu acesso continuará até o fim do período pago.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Os materiais são atualizados?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Adicionamos novos recursos pedagógicos toda semana. 
              Assinantes Premium têm acesso prioritário aos novos materiais.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Posso usar em múltiplos dispositivos?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Sua conta funciona em qualquer dispositivo. 
              Basta fazer login e aproveitar.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Como funciona o pagamento?</h3>
            <p className="text-sm text-muted-foreground">
              Aceitamos cartão de crédito, PIX e boleto. O acesso é liberado 
              automaticamente após a confirmação do pagamento.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-lg mb-2">Os recursos são alinhados com a BNCC?</h3>
            <p className="text-sm text-muted-foreground">
              Sim! Todos os nossos materiais são desenvolvidos seguindo as diretrizes 
              da Base Nacional Comum Curricular (BNCC).
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Final */}
      <div className="mt-16 mb-8 text-center">
        <Card className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🚀 Pronta Para Transformar Suas Aulas?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a +8.000 professoras que já estão economizando tempo e 
            criando aulas incríveis com nossos materiais exclusivos.
          </p>
          <Button 
            asChild
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-50 font-bold text-lg px-12 py-6 shadow-xl"
          >
            <Link href="#planos">
              Escolher Meu Plano Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
