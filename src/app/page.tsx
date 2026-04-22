import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getFeaturedResources } from '@/lib/marketing/product-data'
import { getBillingCheckoutCatalog } from '@/lib/billing/queries'
import { formatCheckoutCurrency, type CheckoutPlanCatalog } from '@/lib/billing/checkout-offer'
import { ProductCarousel } from '@/components/marketing/sections/product-carousel'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  GraduationCap,
  Heart,
  CalendarDays,
  Search,
  Download,
  Sparkles,
  Star,
  Users,
  ShieldCheck,
  Layers,
  RefreshCw,
  Clock,
  FileText,
  LayoutList,
  ClipboardCheck,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'

/* ─────────────────────────────────────────────
   LAYOUT WRAPPER
───────────────────────────────────────────── */
const W = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12 ${className}`}>
    {children}
  </div>
)

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-surface-card/80 backdrop-blur-md border-b border-line/60">
      <W className="h-16 flex items-center justify-between">
        <Logo href="/" />

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <a href="#biblioteca" className="hover:text-ink transition-colors">O que você recebe</a>
          <a href="#como-funciona" className="hover:text-ink transition-colors">Como Funciona</a>
          <a href="#planos" className="hover:text-ink transition-colors">Planos</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink transition-colors">
            Entrar
          </Link>
            <Link
              href="/#planos"
              className="bg-terracotta text-white text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              Começar
            </Link>
        </div>
      </W>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   1. HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-16 pb-20 lg:pt-24 lg:pb-28 bg-gradient-to-b from-paper to-paper">
      <W>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-mustard-2 border border-mustard-2 px-4 py-1.5 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-mustard" />
            <span className="text-mustard text-xs font-semibold">Novos materiais toda semana</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-ink leading-[1.1] tracking-tight mb-6">
            Pare de gastar o fim de semana{' '}
            <br className="hidden sm:block" />
            <span className="text-terracotta">preparando aula do zero.</span>
          </h1>

          <p className="text-ink-soft text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Uma biblioteca feita por professoras que estão em sala de aula todos os dias.
            Organizada por série e disciplina, pronta para baixar e usar.
            Sem horas desperdiçadas, sem material que não funciona.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/#planos"
              className="group h-13 px-8 rounded-full bg-terracotta text-white font-semibold text-base transition-all flex items-center gap-2 shadow-lg shadow-terracotta/20"
            >
              Quero Acesso Agora
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="h-13 px-8 rounded-full border border-line hover:border-line-soft text-ink font-semibold text-base transition-all flex items-center justify-center hover:bg-paper"
            >
              Já sou assinante
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-mute">
            {[
              { icon: ShieldCheck, text: 'Garantia de 7 dias' },
              { icon: Download, text: 'PDF pronto pra imprimir' },
              { icon: RefreshCw, text: 'Atualização semanal' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-ink-mute" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   2. COMO FUNCIONA
───────────────────────────────────────────── */
function ComoFunciona() {
  const steps = [
    {
      num: '1',
      icon: Search,
      title: 'Encontre',
      desc: 'Busque por série, disciplina ou tema. A organização da biblioteca faz o trabalho por você.',
    },
    {
      num: '2',
      icon: Download,
      title: 'Baixe o PDF',
      desc: 'Todo material já está formatado e pronto para imprimir. Sem precisar editar nada.',
    },
    {
      num: '3',
      icon: GraduationCap,
      title: 'Leve para a sala',
      desc: 'Use com confiança. Cada atividade foi testada e validada por professoras como você.',
    },
  ]

  return (
    <section id="como-funciona" className="py-16 lg:py-20 bg-surface-card border-y border-line/40">
      <W>
        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="text-center">
              <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-mustard-2 border border-mustard-2 mb-5">
                <Icon className="h-7 w-7 text-terracotta" />
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center border-2 border-surface-card">
                  {num}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
              <p className="text-sm text-ink-mute leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   3. CONTRASTE: Não é mais um pack genérico
───────────────────────────────────────────── */
function Contraste() {
  return (
    <section className="py-20 lg:py-28 bg-surface-card">
      <W>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
            Não é mais um pack com milhares de arquivos.
          </h2>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
            Você já conhece: compra um pacote enorme, não encontra nada, metade não serve
            para a sua turma. No Kadernim é diferente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* O que NÃO somos */}
          <div className="rounded-2xl border border-berry-2 bg-berry-2 p-7">
            <p className="text-xs font-bold text-berry uppercase tracking-widest mb-5">Packs genéricos</p>
            <ul className="space-y-3.5">
              {[
                '20 mil arquivos sem curadoria',
                'Ninguém sabe se funciona em sala',
                'Impossível encontrar o que precisa',
                'Comprou uma vez, nunca mais atualiza',
                'Formatação inconsistente, muitos com erros',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-berry">
                  <span className="mt-0.5 text-berry text-lg leading-none">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* O que SOMOS */}
          <div className="rounded-2xl border border-sage-2 bg-sage-2 p-7">
            <p className="text-xs font-bold text-sage uppercase tracking-widest mb-5">Kadernim</p>
            <ul className="space-y-3.5">
              {[
                'Biblioteca curada e organizada por série',
                'Cada material testado em sala de aula',
                'Busca rápida por disciplina e tema',
                'Novos materiais adicionados toda semana',
                'PDF formatado e pronto para imprimir',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-sage/90">
                  <CheckCircle2 className="h-4 w-4 text-sage shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   4. A BIBLIOTECA
───────────────────────────────────────────── */
function Biblioteca() {
  const categorias = [
    { icon: '🔤', label: 'Alfabetização', qtd: '45+ materiais' },
    { icon: '🔢', label: 'Matemática', qtd: '38+ materiais' },
    { icon: '🌎', label: 'Ciências e Geografia', qtd: '30+ materiais' },
    { icon: '📖', label: 'Língua Portuguesa', qtd: '42+ materiais' },
    { icon: '🎨', label: 'Artes e Projetos', qtd: '25+ materiais' },
    { icon: '📅', label: 'Datas Comemorativas', qtd: '35+ materiais' },
    { icon: '🏫', label: 'Ed. Infantil', qtd: '40+ materiais' },
    { icon: '📝', label: 'Avaliações', qtd: '20+ materiais' },
  ]

  return (
    <section id="biblioteca" className="py-20 lg:py-28 bg-paper/50">
      <W>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
            Tudo o que você precisa em um só lugar.
          </h2>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
            Tudo organizado por série, disciplina e tema. Você encontra o que precisa
            em segundos, não em horas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categorias.map(({ icon, label, qtd }) => (
            <div
              key={label}
              className="group bg-surface-card rounded-2xl border border-line/60 p-5 hover:border-mustard hover:shadow-md hover:shadow-mustard/20 transition-all cursor-default"
            >
              <span className="text-2xl mb-3 block">{icon}</span>
              <p className="text-sm font-semibold text-ink mb-1">{label}</p>
              <p className="text-xs text-ink-mute">{qtd}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-ink-mute">
            <span className="font-semibold text-ink">248+ materiais</span> disponíveis hoje,
            com novos adicionados toda semana.
          </p>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   6. PLANEJADOR IA
───────────────────────────────────────────── */
function PlanejadorIA() {
  return (
    <section className="py-20 lg:py-28 bg-paper/60 border-y border-line/50">
      <W>
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-terracotta-2 border border-terracotta/20 px-4 py-1.5 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-terracotta" />
              <span className="text-terracotta text-xs font-semibold">Planejador com IA</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
              Em minutos, um plano de aula completo — pronto para aplicar.
            </h2>
            <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
              Escolha um material da biblioteca. A IA gera o planejamento com objetivo,
              sequência didática, avaliação e adaptações — tudo alinhado ao recurso e à BNCC.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: FileText,
                title: 'Objetivo claro',
                desc: 'Derivado da BNCC e do material. Sem vagueza, sem copiar e colar.',
              },
              {
                icon: LayoutList,
                title: 'Sequência com tempo',
                desc: 'Abertura, desenvolvimento e fechamento com duração definida para cada etapa.',
              },
              {
                icon: ClipboardCheck,
                title: 'Avaliação formativa',
                desc: 'O que observar durante a aula e uma verificação rápida para o final.',
              },
              {
                icon: Clock,
                title: 'Adaptações práticas',
                desc: 'Para menos tempo, alunos avançados e trabalho em grupo — tudo no mesmo plano.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-line bg-surface-card p-5">
                <div className="h-10 w-10 rounded-xl bg-mustard-2 border border-mustard-2 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-terracotta" />
                </div>
                <p className="text-sm font-semibold text-ink mb-2">{title}</p>
                <p className="text-sm text-ink-mute leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   7. FEITO POR PROFESSORAS
───────────────────────────────────────────── */
function FeitoPorProfessoras() {
  return (
    <section className="py-20 lg:py-28 bg-surface-card">
      <W>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-mustard/10 border border-mustard/20 px-4 py-1.5 mb-6">
              <Heart className="h-3.5 w-3.5 text-terracotta" />
              <span className="text-terracotta text-xs font-semibold">Feito por quem vive a sala de aula</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-5 leading-tight">
              Material validado por quem ensina de verdade.
            </h2>

            <p className="text-ink-soft text-base lg:text-lg leading-relaxed mb-8">
              Todo material do Kadernim é criado e revisado por professoras que estão em sala
              de aula todos os dias. Não é conteúdo genérico gerado em massa. É experiência
              real transformada em recurso pedagógico.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: GraduationCap,
                  title: 'Criado por educadoras atuantes',
                  desc: 'Professoras do Infantil e Fundamental I que conhecem a realidade da sala.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Testado antes de publicar',
                  desc: 'Cada material passa por uso real em sala antes de entrar na biblioteca.',
                },
                {
                  icon: Layers,
                  title: 'Alinhado ao currículo',
                  desc: `Conteúdos organizados de acordo com as diretrizes da BNCC ${new Date().getFullYear()}.`,
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-mustard-2 border border-mustard-2 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{title}</p>
                    <p className="text-sm text-ink-mute mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ilustração / Card visual */}
          <div className="bg-gradient-to-br from-mustard/10 to-terracotta/5 rounded-3xl border border-line/40 p-8 lg:p-10">
            <div className="space-y-4">
              {[
                {
                  name: 'Profª Ana Paula',
                  role: 'Ed. Infantil. 12 anos de experiência',
                  text: '"Eu levava horas para montar uma sequência didática. Hoje, baixo o que preciso no Kadernim e adapto em minutos. Me sobrou tempo para focar nas crianças."',
                  image: '/images/testimonials/ana.png',
                },
                {
                  name: 'Profª Cláudia',
                  role: 'Fundamental I. 8 anos de experiência',
                  text: '"Antes de publicar qualquer material, eu testo com a minha turma. Se não funciona na prática, não entra."',
                  image: '/images/testimonials/claudia.png',
                },
                {
                  name: 'Profª Juliana',
                  role: 'Alfabetização. 15 anos de experiência',
                  text: '"O diferencial é que a gente sabe o que funciona porque vive isso todo dia. Não é teoria."',
                  image: '/images/testimonials/juliana.png',
                },
              ].map((item) => (
                <div key={item.name} className="bg-surface-card rounded-2xl border border-line-soft p-5 shadow-sm">
                  <p className="text-sm text-ink-soft italic leading-relaxed mb-3">{item.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-mustard-2 overflow-hidden shrink-0 border border-mustard-2">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">{item.name}</p>
                      <p className="text-[11px] text-ink-mute">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   8. PLANOS
───────────────────────────────────────────── */
function PlanosSection({ catalog }: { catalog: CheckoutPlanCatalog }) {
  const monthly = catalog.monthly
  const annual = catalog.annual
  const annualSavings = Math.max(0, monthly.creditCardAmount * 12 - annual.creditCardAmount)
  const annualEquivalent = annual.creditCardAmount / 12
  const planIncludes = [
    'Biblioteca completa de materiais pedagógicos',
    'Novos materiais adicionados toda semana',
    'Busca por série, disciplina e tema',
    'PDFs prontos para imprimir',
    'Planejador de aula com IA',
  ]

  return (
    <section id="planos" className="py-20 lg:py-28 bg-paper/60 border-y border-line/40">
      <W>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
            Escolha como quer acessar o Kadernim.
          </h2>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed">
            O acesso é completo nos dois ciclos. O anual é para quem quer garantir o ano letivo com o melhor valor.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_0.9fr] max-w-5xl mx-auto items-stretch">
          <article className="rounded-4 border border-line bg-surface-card p-6 shadow-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-mute">Mensal</p>
            <p className="mt-4 text-4xl font-black tracking-tight text-ink">{formatCheckoutCurrency(monthly.creditCardAmount)}</p>
            <p className="mt-1 text-sm text-ink-soft">por mês</p>
            <p className="mt-4 text-sm text-ink-mute">
              Ideal para experimentar o Kadernim com acesso completo à biblioteca e ao planejador.
            </p>
            <Link
              href={`/checkout?plan=${monthly.id}`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold text-ink hover:bg-paper-2"
            >
              Assinar mensal
            </Link>
          </article>

          <article className="rounded-4 border-2 border-terracotta bg-surface-card p-6 shadow-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-terracotta">Anual</p>
              {annualSavings > 0 && (
                <span className="rounded-full bg-sage-2 px-2.5 py-1 text-[11px] font-bold text-sage">
                  Economize {formatCheckoutCurrency(annualSavings)}
                </span>
              )}
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-ink">{formatCheckoutCurrency(annual.creditCardAmount)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              equivalente a {formatCheckoutCurrency(annualEquivalent)}/mês
            </p>
            <p className="mt-4 text-sm text-ink-mute">
              A melhor escolha para professoras que querem usar o Kadernim durante todo o ano letivo pagando menos.
            </p>
            <Link
              href={`/checkout?plan=${annual.id}`}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-terracotta px-5 text-sm font-semibold text-white hover:bg-terracotta-hover"
            >
              Assinar anual
            </Link>
          </article>

          <aside className="rounded-4 border border-line bg-surface-card p-6 shadow-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-mute">Inclui no plano</p>
            <ul className="mt-4 space-y-3">
              {planIncludes.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-ink-soft">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   9. CTA FINAL
───────────────────────────────────────────── */
function CTAFinal() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-mustard/10 to-paper">
      <W>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-5 leading-tight">
            Sua próxima aula pode ser preparada <br className="hidden sm:block" />
            em minutos, não em horas.
          </h2>
          <p className="text-ink-soft text-base lg:text-lg mb-10 leading-relaxed">
            Material testado em sala, organizado por série e disciplina, com planejador de aula incluído.
            Sem achismo, sem desperdício de tempo.
          </p>
          <Link
            href="/#planos"
            className="group inline-flex items-center gap-2 h-14 px-10 rounded-full bg-terracotta text-white font-semibold text-lg transition-all shadow-lg shadow-terracotta/20"
          >
            Ver Planos e Preços
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="mt-5 text-sm text-ink-mute">
            Garantia de 7 dias. Cancele quando quiser.
          </p>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="py-10 border-t border-line/40 bg-surface-card">
      <W className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo href="/" showText={false} />
        <p className="text-xs text-ink-mute text-center">
          Materiais pedagógicos feitos por quem vive a sala de aula.
        </p>
        <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Kadernim. Todos os direitos reservados</p>
      </W>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default async function HomePage() {
  const products = await getFeaturedResources()
  const catalog = await getBillingCheckoutCatalog()

  return (
    <div className="min-h-screen bg-paper antialiased paper-grain">
      <Navbar />
      <main>
        <Hero />
        <ComoFunciona />
        <Contraste />
        <Biblioteca />
        <ProductCarousel products={products} dark={false} />
        <PlanejadorIA />
        <FeitoPorProfessoras />
        <PlanosSection catalog={catalog} />
        <CTAFinal />
      </main>
      <Footer />
    </div>
  )
}
