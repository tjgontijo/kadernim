'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Lock, Unlock } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  priceMonthly: number | null
  durationDays: number | null
  linkCheckout: string | null
  isActive: boolean
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasActivePlan, setHasActivePlan] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar planos
        const plansResponse = await fetch('/api/plans')
        const plansData = await plansResponse.json()
        setPlans(plansData)

        // Verificar se tem plano ativo (simulado - você pode criar uma API específica)
        const resourcesResponse = await fetch('/api/resources')
        const resourcesData = await resourcesResponse.json()
        if (resourcesData.length > 0) {
          setHasActivePlan(resourcesData[0].hasActivePlan || false)
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12">
          <div className="flex h-60 items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        </div>
    )
  }

  // Separar planos
  const freePlan = plans.find(p => p.price === 0)
  const paidPlans = plans.filter(p => p.price > 0).sort((a, b) => a.price - b.price)

  return (
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {hasActivePlan ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-full mb-4">
              <Unlock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Você tem acesso Premium ativo
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-full mb-4">
              <Lock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Desbloqueie todos os recursos
              </span>
            </div>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {hasActivePlan 
              ? 'Gerencie Sua Assinatura' 
              : 'Desbloqueie Todo o Potencial da Plataforma'
            }
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {hasActivePlan
              ? 'Aproveite seu acesso ilimitado a todos os recursos pedagógicos'
              : 'Tenha acesso ilimitado a +200 recursos pedagógicos, planejamentos prontos e materiais exclusivos'
            }
          </p>
        </div>

        {/* Benefícios do Premium */}
        {!hasActivePlan && (
          <div className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <h2 className="text-xl font-bold mb-4 text-center">
              ✨ O que você ganha com o Premium
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Unlock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Acesso Total</h3>
                  <p className="text-xs text-muted-foreground">Desbloqueie todos os recursos da plataforma</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Materiais Exclusivos</h3>
                  <p className="text-xs text-muted-foreground">Novos recursos toda semana</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Sem Anúncios</h3>
                  <p className="text-xs text-muted-foreground">Experiência limpa e focada</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Planos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {/* Plano Free */}
          {freePlan && (
            <Card className="p-6 flex flex-col relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{freePlan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">Grátis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para sempre
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Recursos gratuitos selecionados</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Materiais básicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Suporte por email</span>
                </li>
              </ul>

              {!hasActivePlan && (
                <Badge variant="outline" className="w-full justify-center py-2">
                  Plano Atual
                </Badge>
              )}
            </Card>
          )}

          {/* Planos Pagos */}
          {paidPlans.map((plan) => {
            const isAnnual = plan.slug === 'premium-anual'
            const monthlyPrice = plan.durationDays ? (plan.price / (plan.durationDays / 30)).toFixed(2) : null
            const months = plan.durationDays ? Math.floor(plan.durationDays / 30) : 0
            
            return (
              <Card 
                key={plan.id} 
                className={`p-6 flex flex-col relative ${
                  isAnnual ? 'border-2 border-primary shadow-lg' : ''
                }`}
              >
                {isAnnual && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Mais Escolhido
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {monthlyPrice && (
                    <p className="text-sm text-muted-foreground">
                      Apenas R$ {monthlyPrice.replace('.', ',')} por mês
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {months} meses de acesso completo
                  </p>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Acesso ilimitado a todos os recursos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">+200 materiais pedagógicos</span>
                  </li>
                  {isAnnual ? (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Materiais exclusivos semanais</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">Suporte prioritário via WhatsApp</span>
                      </li>
                    </>
                  ) : (
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Suporte por email</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Atualizações constantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Sem anúncios</span>
                  </li>
                </ul>

                {hasActivePlan ? (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Você já tem acesso Premium
                  </Badge>
                ) : (
                  plan.linkCheckout ? (
                    <Link href={plan.linkCheckout} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button 
                        className={`w-full ${
                          isAnnual 
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                            : ''
                        }`}
                        size="lg"
                      >
                        Desbloquear Agora
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className={`w-full ${
                        isAnnual 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                          : ''
                      }`}
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

        {/* Garantia */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              ✅ 7 dias de garantia incondicional
            </p>
            <p className="text-xs text-muted-foreground">
              Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas
            </p>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Posso cancelar quando quiser?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso continuará até o fim do período pago.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Os materiais são atualizados?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Adicionamos novos recursos pedagógicos toda semana. Assinantes Premium têm acesso prioritário aos novos materiais.
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Posso usar em múltiplos dispositivos?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Sua conta funciona em qualquer dispositivo. Basta fazer login e aproveitar.
              </p>
            </Card>
          </div>
        </div>
      </div>
  )
}
