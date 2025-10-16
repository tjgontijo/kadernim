'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Unlock, TrendingUp, Users, Award, Clock, Download, Star, ArrowRight } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { usePremiumStatus } from '@/hooks/use-premium-status'
import { useResourceStats } from '@/hooks/use-resource-stats'
import { usePlanOffers } from '@/hooks/use-plan-offers'

export default function PlansPage() {
  const { isPremium } = usePremiumStatus()
  const { stats, isLoading: statsLoading } = useResourceStats()
  const { plans, isLoading: plansLoading } = usePlanOffers()

  const totalResources = stats?.total ?? 0
  const premiumResources = stats?.premium ?? 0

  if (plansLoading || statsLoading) {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        {isPremium ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-300 dark:border-green-700 rounded-full mb-6 shadow-sm">
            <Unlock className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900 dark:text-green-100">
              ✨ Você já tem acesso Premium ativo!
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-full mb-6 shadow-sm">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
              🎓 Desbloqueie Todo o Potencial da Plataforma
            </span>
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {isPremium 
            ? 'Aproveite Seu Acesso Premium' 
            : 'Transforme Suas Aulas com Materiais Exclusivos'
          }
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {isPremium
            ? `Você tem acesso ilimitado a ${totalResources}+ recursos pedagógicos. Continue criando aulas incríveis!`
            : `Acesse ${premiumResources}+ recursos pedagógicos profissionais, planejamentos prontos e atividades diferenciadas. Economize horas de trabalho toda semana!`
          }
        </p>
      </div>

      {/* Social Proof Bar */}
      {!isPremium && (
        <div className="mb-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6 text-indigo-600" />
                <span className="text-3xl font-bold text-indigo-600">+2.500</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Professoras Ativas</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Download className="h-6 w-6 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">{totalResources}+</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Recursos Disponíveis</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-pink-600" />
                <span className="text-3xl font-bold text-pink-600">4.9/5.0</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Avaliação Média</p>
            </div>
          </div>
        </div>
      )}

      {/* Benefícios do Premium */}
      {!isPremium && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            ✨ Por Que Escolher o Premium?
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Unlock className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Acesso Ilimitado</h3>
              <p className="text-sm text-muted-foreground">
                {premiumResources}+ recursos pedagógicos sempre disponíveis
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Novos Materiais</h3>
              <p className="text-sm text-muted-foreground">
                Recursos novos adicionados toda semana
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Economize Tempo</h3>
              <p className="text-sm text-muted-foreground">
                Planejamentos prontos para usar imediatamente
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                  <Zap className="h-7 w-7 text-white" />
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">Sem Anúncios</h3>
              <p className="text-sm text-muted-foreground">
                Experiência limpa e focada no que importa
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Planos */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-4">
          Escolha Seu Plano Ideal
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Todos os planos incluem acesso completo a {premiumResources}+ recursos. 
          Escolha o período que melhor se encaixa no seu orçamento.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {plan.priceFormatted}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Apenas <strong className="text-indigo-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyPrice)}
                    </strong> por mês
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {months} meses de acesso completo
                  </p>
                  {isBestValue && savings > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      💰 Economize {savings}%
                    </Badge>
                  )}
                </div>

                {/* Benefícios */}
                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">
                      Acesso ilimitado a {premiumResources}+ recursos
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Planejamentos prontos para todas as disciplinas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Atividades diferenciadas e exclusivas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Novos materiais toda semana</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Sem anúncios</span>
                  </li>
                  {isBestValue && (
                    <>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Suporte prioritário via WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Acesso antecipado a novos recursos</span>
                      </li>
                    </>
                  )}
                </ul>

                {/* CTA */}
                {isPremium ? (
                  <Badge variant="secondary" className="w-full justify-center py-3 text-sm">
                    ✅ Você já tem acesso Premium
                  </Badge>
                ) : (
                  plan.linkCheckout ? (
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
                  )
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
      {!isPremium && (
        <div className="mt-16 text-center">
          <Card className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-0 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🚀 Pronta Para Transformar Suas Aulas?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Junte-se a +2.500 professoras que já estão economizando tempo e 
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
      )}
    </div>
  )
}
