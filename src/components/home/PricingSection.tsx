'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'

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

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        const data = await response.json()
        setPlans(data)
      } catch (error) {
        console.error('Erro ao carregar planos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (isLoading) {
    return (
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando planos...</div>
        </div>
      </section>
    )
  }

  // Separar planos
  const freePlan = plans.find(p => p.price === 0)
  const paidPlans = plans.filter(p => p.price > 0).sort((a, b) => a.price - b.price)

  return (
    <section id="pricing" className="border-t py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">
            Escolha o Plano Ideal para Você
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece grátis e faça upgrade quando precisar de mais recursos
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Plano Free */}
          {freePlan && (
            <Card className="p-6 flex flex-col">
              <div className="mb-6">
                <h4 className="text-2xl font-bold mb-2">{freePlan.name}</h4>
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

              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full">
                  Começar Grátis
                </Button>
              </Link>
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
                  isAnnual ? 'border-2 border-primary shadow-lg scale-105' : ''
                }`}
              >
                {isAnnual && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Mais Escolhido
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
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

                {plan.linkCheckout ? (
                  <Link href={plan.linkCheckout} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button 
                      className={`w-full ${
                        isAnnual 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                          : ''
                      }`}
                      size="lg"
                    >
                      Assinar Agora
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register" className="w-full">
                    <Button 
                      className={`w-full ${
                        isAnnual 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg' 
                          : ''
                      }`}
                      size="lg"
                    >
                      Assinar Agora
                    </Button>
                  </Link>
                )}
              </Card>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Todos os planos incluem 7 dias de garantia. Cancele quando quiser.
        </p>
      </div>
    </section>
  )
}
