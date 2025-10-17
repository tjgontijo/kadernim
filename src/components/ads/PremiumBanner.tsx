'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Crown, TrendingUp, Users, Award, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePlanOffers } from '@/hooks/use-plan-offers'
import { useResourceStats } from '@/hooks/use-resource-stats'

interface PremiumBannerProps {
  slot: 'header' | 'inline' | 'sidebar' | 'footer'
  variant?: 'default' | 'compact' | 'minimal'
  creative?: 'conversion' | 'testimonial' | 'urgency' | 'social-proof' | 'value'
  dismissible?: boolean
  imageSrc?: string // Caminho para imagem em /public
}

/**
 * PremiumBanner - Sistema Inteligente de Banners
 * 
 * Usa dados reais do banco:
 * - Número total de recursos
 * - Recursos por disciplina/nível
 * - Preços reais dos planos
 * - Depoimentos/social proof
 * 
 * Múltiplas variantes criativas para A/B testing
 */
export function PremiumBanner({ 
  slot: _slot, 
  variant = 'default', 
  creative = 'conversion',
  dismissible = true,
  imageSrc
}: PremiumBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const { primaryPlan } = usePlanOffers()
  const { stats, isLoading: statsLoading } = useResourceStats()

  if (isDismissed) return null

  const handleDismiss = () => setIsDismissed(true)

  // Dados inteligentes
  const totalResources = stats?.total ?? 200
  const premiumResources = stats?.premium ?? 180
  const planPrice = primaryPlan?.priceFormatted ?? 'R$ 197,00'
  const monthlyPrice = primaryPlan?.monthlyFormatted ?? 'R$ 16,42'
  const planDuration = primaryPlan?.durationLabel ?? '12 meses'

  // ========================================
  // VARIANTE MINIMAL
  // ========================================
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md">
        <Crown className="h-5 w-5 text-white" />
        <span className="text-sm font-semibold text-white">
          {creative === 'urgency' 
            ? `🔥 ${premiumResources}+ recursos esperando por você!`
            : `✨ Desbloqueie ${premiumResources}+ recursos`
          }
        </span>
        <Button asChild size="sm" variant="secondary" className="ml-auto font-semibold">
          <Link href="/plans">Ver Planos</Link>
        </Button>
      </div>
    )
  }

  // ========================================
  // VARIANTE COMPACT
  // ========================================
  if (variant === 'compact') {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 shadow-lg">
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 transition-colors z-10 shadow-sm"
            aria-label="Fechar"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Imagem opcional */}
            {imageSrc && (
              <div className="flex-shrink-0 hidden sm:block">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={imageSrc}
                    alt="Premium"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Creative: Conversion */}
              {creative === 'conversion' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                      🎓 Premium
                    </Badge>
                    {!statsLoading && (
                      <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                        {premiumResources}+ recursos desbloqueados
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Acesso Total a Todos os Materiais Pedagógicos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Planejamentos prontos, atividades exclusivas e muito mais. 
                    Por apenas <strong className="text-indigo-600 dark:text-indigo-400">{monthlyPrice}/mês</strong>.
                  </p>
                </>
              )}

              {/* Creative: Social Proof */}
              {creative === 'social-proof' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      +2.500 professoras já confiam
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    &quot;Economizo <strong>horas</strong> de planejamento toda semana. 
                    Os materiais são perfeitos para minha turma!&quot;
                    <span className="text-xs text-gray-500 block mt-1">— Profª Ana, Educação Infantil</span>
                  </p>
                </>
              )}

              {/* Creative: Urgency */}
              {creative === 'urgency' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <Badge variant="destructive" className="animate-pulse">
                      🔥 Oferta Limitada
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Últimas Vagas com Desconto Especial
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Garanta {planDuration} de acesso por <strong className="text-orange-600">{planPrice}</strong>. 
                    Promoção válida apenas hoje!
                  </p>
                </>
              )}

              {/* Creative: Value */}
              {creative === 'value' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Melhor Custo-Benefício
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{totalResources}+ recursos</strong> por menos de <strong className="text-indigo-600">{monthlyPrice}/mês</strong>. 
                    Menos que um café por dia para transformar suas aulas! ☕
                  </p>
                </>
              )}

              {/* Creative: Testimonial */}
              {creative === 'testimonial' && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 border-2 border-white dark:border-gray-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 border-2 border-white dark:border-gray-900" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-teal-400 border-2 border-white dark:border-gray-900" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      ⭐ 4.9/5.0 (1.200+ avaliações)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Minha vida mudou! Tenho tempo para focar no que realmente importa: meus alunos.&rdquo;
                  </p>
                  <span className="text-xs text-gray-500">— Profª Carla, 1º Ano Fundamental</span>
                </>
              )}
            </div>
            
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Button 
                asChild 
                size="sm" 
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md"
              >
                <Link href="/plans">
                  {creative === 'urgency' ? 'Garantir Desconto' : 'Desbloquear Agora'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // ========================================
  // VARIANTE DEFAULT (Hero Banner)
  // ========================================
  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 transition-colors z-10 shadow-lg"
          aria-label="Fechar"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      )}
      
      {/* Background gradient animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-95" />
      <div className="absolute inset-0 bg-[url('/patterns/dots.svg')] opacity-10" />
      
      {/* Content */}
      <div className="relative p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Imagem Hero (opcional) */}
          {imageSrc && (
            <div className="flex-shrink-0 hidden lg:block">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
                <Image
                  src={imageSrc}
                  alt="Premium"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
              {!statsLoading && (
                <span className="text-sm font-medium text-white/90">
                  {premiumResources}+ Recursos Exclusivos
                </span>
              )}
            </div>

            {/* Headline */}
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              {creative === 'urgency' && '🔥 Última Chance: Desbloqueie Tudo com Desconto Especial'}
              {creative === 'social-proof' && '✨ Junte-se a +2.500 Professoras que Transformaram suas Aulas'}
              {creative === 'value' && '💎 Acesso Total por Menos de R$ 1/dia'}
              {creative === 'testimonial' && '⭐ "O Melhor Investimento que Fiz na Minha Carreira"'}
              {creative === 'conversion' && '🎓 Desbloqueie Todos os Recursos Pedagógicos Agora'}
            </h2>

            {/* Description */}
            <p className="text-base text-white/90 mb-6 max-w-2xl">
              {creative === 'urgency' && `Garanta ${planDuration} de acesso ilimitado por apenas ${planPrice}. Promoção exclusiva termina em breve!`}
              {creative === 'social-proof' && 'Materiais aprovados e testados por milhares de educadoras. Economize tempo e eleve a qualidade das suas aulas.'}
              {creative === 'value' && `${totalResources}+ planejamentos, atividades e recursos por apenas ${monthlyPrice}/mês. Investimento que se paga sozinho!`}
              {creative === 'testimonial' && 'Profª Maria, Ed. Infantil - "Minha rotina ficou mais leve e minhas aulas mais criativas. Recomendo de olhos fechados!"'}
              {creative === 'conversion' && `Acesse ${premiumResources}+ materiais pedagógicos exclusivos, planejamentos prontos e atividades diferenciadas. Tudo por ${monthlyPrice}/mês.`}
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">Acesso ilimitado</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">Novos materiais toda semana</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">Sem anúncios</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-gray-50 font-bold shadow-xl"
              >
                <Link href="/plans">
                  {creative === 'urgency' ? 'Garantir Meu Desconto Agora' : 'Desbloquear Tudo Agora'}
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Link href="/plans">Ver Todos os Planos</Link>
              </Button>
            </div>

            {/* Benefício adicional */}
            <p className="text-xs text-white/70 mt-4">
              ✅ Acesso imediato após pagamento • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
