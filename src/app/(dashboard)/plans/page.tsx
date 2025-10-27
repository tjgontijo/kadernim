'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {  
  Check,
  ChevronDown,
  ChevronUp,  
  CreditCard,
  Heart,  
  Moon,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Users  
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { usePlanOffers } from '@/hooks/use-plan-offers'

type PainPoint = {
  title: string
  description: string
  icon: LucideIcon
}

type FeatureItem = {
  title: string
  description: string
  icon: LucideIcon
}

type Testimonial = {
  quote: string
  highlight: string
  author: string
  role: string
}

type FaqItem = {
  question: string
  answer: string
}

type PlanPresentation = {
  label: string
  cadence: string
  idealFor: string
  ctaLabel: string
  ctaVariant: 'primary' | 'secondary' | 'accent'
  supportHighlights: string[]
  hasWhatsappSupport: boolean
  canSuggestMaterials: boolean
  hasExclusiveContent: boolean
  economyHighlight?: string
  isPopular?: boolean
}

const painPoints: PainPoint[] = [
  {
    title: 'Noites em claro',
    description: 'Buscando referências no Pinterest, adaptando atividades genéricas e lutando contra o relógio para preparar a aula de amanhã.',
    icon: Moon,
  },
  {
    title: 'Gastos e Decepção',
    description: 'Comprando materiais avulsos em diversos sites, gastando mais do que o planejado e que quando recebe, muitas vezes, se frustrando com conteúdos que não entregam a qualidade prometida.',
    icon: CreditCard,
  },
  {
    title: 'Insegurança criativa',
    description: 'A sensação de que suas aulas poderiam ser mais criativas e engajadoras, mas falta tempo e energia para criar algo do zero.',
    icon: Palette,
  },
  {
    title: 'Isolamento profissional',
    description: 'A dificuldade de trocar experiências e materiais de qualidade com outras colegas que entendem os seus desafios diários.',
    icon: Users,
  },
]

const features: FeatureItem[] = [
  {
    title: 'Biblioteca Premium com centenas de Recursos',
    description: 'Encontre em minutos atividades, planos de aula e projetos completos, do Infantil ao Fundamental, para que você possa parar de criar tudo do zero.',
    icon: Sparkles,
  },
  {
    title: 'Curadoria Feita por Professoras',
    description: 'Tenha a segurança de usar materiais testados e aprovados em sala de aula, para que você possa ensinar com total confiança no conteúdo.',
    icon: ShieldCheck,
  },
  {
    title: 'Votação de Novos Materiais',
    description: 'Sugira e vote nos próximos recursos a serem criados. Sua voz molda a plataforma, para que o Kadernim evolua com as suas necessidades reais.',
    icon: Heart,
  },
]

const testimonials: Testimonial[] = [
  {
    quote: 'com os planejamentos prontos. Minha vida mudou completamente! Agora tenho tempo para estar presente com minha família e ainda assim minhas aulas são incríveis.',
    highlight: 'Economizo pelo menos 5 horas por semana',
    author: 'Profª Ana Paula',
    role: 'Educação Infantil',
  },
  {
    quote: 'que eu estava procurando. Os materiais são de qualidade excepcional e meus alunos adoram as atividades. Recomendo para todas as colegas!',
    highlight: 'Encontrei exatamente o que precisava',
    author: 'Profª Mariana',
    role: '3º ano do Fundamental',
  },
  {
    quote: 'para preparar minhas aulas. O Kadernim me devolveu a paixão por ensinar e ainda me deu tempo para cuidar de mim mesma.',
    highlight: 'Reduzi drasticamente o tempo',
    author: 'Profª Juliana',
    role: '1º ano do Fundamental',
  },
]

const faqItems: FaqItem[] = [
  {
    question: 'Qual a diferença do Kadernim para outros sites de atividades?',
    answer: 'O Kadernim é focado na curadoria humana feita por professoras experientes. Todos os materiais são testados em sala de aula e possuem qualidade pedagógica comprovada. Além disso, nossa comunidade colaborativa permite que você participe ativamente na criação de novos conteúdos.',
  },
  {
    question: 'E se eu não gostar? Existe alguma garantia?',
    answer: 'Sim! Oferecemos garantia de satisfação de 7 dias com reembolso total. Se por qualquer motivo você não ficar satisfeita, devolvemos 100% do seu investimento, sem perguntas.',
  },
  {
    question: 'Os materiais servem para a minha turma específica?',
    answer: 'Nossos materiais abrangem da Educação Infantil ao Fundamental II, organizados por ano e disciplina. Você pode filtrar facilmente para encontrar exatamente o que precisa para sua turma.',
  },
  {
    question: 'Como funciona o suporte via WhatsApp?',
    answer: 'Assinantes dos planos Colaborador e Parceiro Anual têm acesso direto ao nosso suporte via WhatsApp para tirar dúvidas, sugerir materiais e receber orientações pedagógicas.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. Não há fidelidade e você continuará tendo acesso até o final do período já pago.',
  },
]

const planPresentations: PlanPresentation[] = [
  {
    label: 'Plano Essencial',
    cadence: 'Trimestral',
    idealFor: 'Experimentar a leveza de ter tudo pronto.',
    ctaLabel: 'Começar a Experimentar',
    ctaVariant: 'secondary',
    supportHighlights: ['Suporte por e-mail', 'Atualizações semanais'],
    hasWhatsappSupport: false,
    canSuggestMaterials: false,
    hasExclusiveContent: false,
  },
  {
    label: 'Plano Colaborador',
    cadence: 'Semestral',
    idealFor: 'Participar ativamente da comunidade.',
    ctaLabel: 'Fazer Parte da Comunidade',
    ctaVariant: 'primary',
    supportHighlights: ['Suporte por e-mail', 'Atualizações semanais', 'Suporte via WhatsApp'],
    hasWhatsappSupport: true,
    canSuggestMaterials: true,
    hasExclusiveContent: false,
    isPopular: true,
  },
  {
    label: 'Plano Parceiro Anual',
    cadence: 'Anual',
    idealFor: 'Ter um aliado pedagógico o ano todo.',
    ctaLabel: 'Quero o Melhor Custo-Benefício',
    ctaVariant: 'accent',
    supportHighlights: ['Suporte via WhatsApp', 'Atualizações semanais'],
    hasWhatsappSupport: true,
    canSuggestMaterials: true,
    hasExclusiveContent: true,
    economyHighlight: 'Economize 36%',
  },
]

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={index} className="border border-slate-200">
          <button
            className="flex w-full items-center justify-between p-6 text-left"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h3 className="font-semibold text-gray-900">{item.question}</h3>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {openIndex === index && (
            <div className="border-t border-slate-100 px-6 pb-6 pt-4">
              <p className="text-gray-600">{item.answer}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

export default function Plans3Page() {
  const { plans, isLoading, error } = usePlanOffers()

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => a.price - b.price)
  }, [plans])

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold text-destructive">
          Não conseguimos carregar os planos agora.
        </h2>
        <p className="mt-2 text-muted-foreground">Tente novamente em alguns instantes.</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-white via-purple-50/30 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
        <div className="container relative mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-indigo-100 text-indigo-900 px-4 py-2">
              Plataforma criada por professoras para professoras
            </Badge>
            
            <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              Aulas que encantam e inspiram,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                sem gastar suas noites e fins de semana planejando.
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 md:text-xl">
              Junte-se a milhares de professoras e tenha acesso a centenas de materiais prontos, criados por educadoras.{' '}
              <strong>Recupere seu tempo e sua paixão por ensinar.</strong>
            </p>
            
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8 py-6 text-lg font-semibold shadow-xl">
                <Link href="#planos">Ver os planos e começar agora</Link>
              </Button>
              
              <div className="flex items-center gap-3 rounded-full border border-indigo-200 bg-white/80 px-6 py-3 text-sm text-indigo-900 backdrop-blur-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium">Mais de 1.847 professoras confiam no Kadernim</span>
              </div>
            </div>
            

          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-purple-300 text-purple-700 px-4 py-2">
              Você se reconhece neste ciclo?
            </Badge>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point, index) => (
              <Card key={index} className="border-2 border-red-100 bg-red-50/50 p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-red-100 p-4">
                    <point.icon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-bold text-red-900">{point.title}</h3>
                <p className="text-red-700">{point.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white lg:py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Existe um jeito mais leve de ser professora.
          </h2>
          <p className="text-lg leading-relaxed text-indigo-100 md:text-xl">
            O Kadernim não é apenas um banco de atividades. É o seu novo fluxo de trabalho. Uma plataforma onde a preparação de aulas deixa de ser um fardo solitário e se torna um ato de colaboração e criatividade. Aqui, você encontra o material perfeito em minutos, confia na qualidade porque foi criado por outra professora, e volta a ter tempo para o que realmente importa: estar presente para sua família e seus alunos.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Tudo o que você precisa para aulas memoráveis está aqui.
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-green-100 bg-green-50/50 p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-green-100 p-4">
                    <feature.icon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-4 text-xl font-bold text-green-900">{feature.title}</h3>
                <p className="text-green-700">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              O que mais de 1.000 professoras estão dizendo.
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white p-8 shadow-lg">
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="mb-6 text-gray-700">
                  &quot;<strong className="text-gray-900">{testimonial.highlight}</strong> {testimonial.quote}&quot;
                </blockquote>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-16 lg:py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Um investimento na sua carreira e no seu bem-estar.
            </h2>
            <p className="text-lg text-gray-600">
              Escolha o plano que te devolve tempo e tranquilidade.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {planPresentations.map((presentation, index) => {
              const plan = sortedPlans[index]
              if (!plan) return null

              const monthlyValue = plan.priceMonthly 
                ? `R$ ${plan.priceMonthly.toFixed(2).replace('.', ',')}/mês`
                : `R$ ${(plan.price / (plan.durationDays || 30) * 30).toFixed(2).replace('.', ',')}/mês`

              return (
                <Card
                  key={presentation.label}
                  className={`relative flex h-full flex-col p-8 ${
                    presentation.isPopular
                      ? 'border-2 border-indigo-300 bg-indigo-50/50 shadow-2xl scale-105'
                      : presentation.ctaVariant === 'accent'
                      ? 'border-2 border-purple-300 bg-purple-50/50 shadow-xl'
                      : 'border border-slate-200 bg-white shadow-lg'
                  }`}
                >
                  {presentation.isPopular && (
                    <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  )}
                  
                  {presentation.economyHighlight && (
                    <Badge className="absolute -top-4 right-4 bg-green-600 text-white px-3 py-1">
                      {presentation.economyHighlight}
                    </Badge>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{presentation.label}</h3>
                    <p className="text-sm text-gray-600 mb-4">{presentation.cadence}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">R$ {plan.price.toFixed(0)}</span>
                      <p className="text-sm text-gray-600 mt-1">Equivalente a apenas {monthlyValue}</p>
                    </div>
                    <p className="text-gray-700 italic">{presentation.idealFor}</p>
                  </div>
                  
                  <div className="flex-1 space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Acesso Total à Biblioteca</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Atualizações Semanais</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Suporte por E-mail</span>
                    </div>
                    {presentation.hasWhatsappSupport && (
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Suporte via WhatsApp</span>
                      </div>
                    )}
                    {presentation.canSuggestMaterials && (
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Sugerir e Votar em Materiais</span>
                      </div>
                    )}
                    {presentation.hasExclusiveContent && (
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600" />
                        <span>Conteúdos Exclusivos</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    asChild
                    size="lg"
                    className={`w-full font-semibold ${
                      presentation.ctaVariant === 'primary'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                        : presentation.ctaVariant === 'accent'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Link href={plan.linkCheckout || '#'} target="_blank">
                      {presentation.ctaLabel}
                    </Link>
                  </Button>
                </Card>
              )
            })}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              ✅ Acesso imediato após pagamento • Garantia de 7 dias • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas antes de começar sua jornada.
            </p>
          </div>
          
          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white lg:py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Sua próxima aula incrível está a um clique de distância.
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-indigo-100 md:text-xl">
            Chega de sacrificar seu tempo pessoal. Junte-se a milhares de professoras que redescobriram a alegria de ensinar com criatividade, confiança e leveza. O Kadernim é mais que uma plataforma, é um movimento.
          </p>
          
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-6 text-lg font-bold shadow-xl">
            <Link href="#planos">Escolher meu plano e transformar minha rotina</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}