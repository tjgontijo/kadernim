'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  ShieldCheck,
  Clock,
  Zap,
  Download,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
} from 'lucide-react'
import { type CheckoutPlanCatalog } from '@/lib/billing/checkout-offer'

/* ─────────────────────────────────────────────
   LAYOUT
───────────────────────────────────────────── */
const W = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-12 ${className}`}>
    {children}
  </div>
)

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
      <W className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/20">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-stone-800 font-bold text-lg tracking-tight">Kadernim</span>
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors"
        >
          Entrar →
        </Link>
      </W>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   BILLING TOGGLE
───────────────────────────────────────────── */
type Period = 'monthly' | 'annual'

function BillingToggle({ period, onChange }: { period: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container Principal */}
      <div className="relative flex items-center bg-stone-100 rounded-[18px] p-1.5 w-[280px] h-[52px] shadow-inner border border-stone-200/20">
        
        {/* Active Pill (Fundo Branco) */}
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[12px] bg-white shadow-sm border border-stone-300/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            period === 'monthly' ? 'translate-x-0' : 'translate-x-full'
          }`}
        />

        {/* Botão Mensal */}
        <button
          onClick={() => onChange('monthly')}
          className={`flex-1 relative z-10 h-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
            period === 'monthly' ? 'text-violet-700' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Mensal
        </button>

        {/* Botão Anual */}
        <button
          onClick={() => onChange('annual')}
          className={`flex-1 relative z-10 h-full flex items-center justify-center gap-2 text-sm font-bold transition-colors duration-200 ${
            period === 'annual' ? 'text-violet-700' : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          Anual
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md transition-colors ${
            period === 'annual' ? 'bg-violet-100 text-violet-700' : 'bg-stone-200 text-stone-500'
          }`}>
            −20%
          </span>
        </button>
      </div>
      
      {period === 'annual' && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-1 duration-300">
          <Sparkles className="h-3 w-3 text-green-600" />
          <span className="text-green-700 text-[11px] font-bold">
            Assine 12 meses, pague apenas 10
          </span>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   PRICING CARD
───────────────────────────────────────────── */
const includes = [
  'Biblioteca completa (+248 materiais)',
  'Novos materiais toda semana',
  'Organizados por série e disciplina',
  'PDF pronto para imprimir',
  'Validado por professoras atuantes',
  `Alinhado à BNCC ${new Date().getFullYear()}`,
]

function fmtAmount(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function PricingCard({ period, catalog }: { period: Period; catalog: CheckoutPlanCatalog }) {
  const plan = catalog[period === 'monthly' ? 'monthly' : 'annual']
  
  // No anual, o preço principal que mostramos é o equivalente mensal arredondado
  const displayPrice = period === 'monthly' 
    ? plan.creditCardAmount 
    : plan.creditCardAmount / 12

  const detailLabel = period === 'monthly' 
    ? 'Cobrado mensalmente' 
    : `Pagamento único de R$ ${fmtAmount(plan.creditCardAmount)}/ano`

  return (
    <div className="max-w-md mx-auto w-full group">
      <div className="relative rounded-[2.5rem] bg-white border border-stone-200 shadow-2xl shadow-stone-200/50 p-1.5 transition-all duration-300 group-hover:shadow-violet-200/50">
        <div className="absolute -top-px left-10 right-10 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        
        <div className="bg-stone-50/40 rounded-[2rem] border border-stone-100/50 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-8 text-center">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-violet-100/50 rounded-full border border-violet-200/50 mb-6">
              <Sparkles className="h-3 w-3 text-violet-600" />
              <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
                Acesso Ilimitado
              </span>
            </div>

            <h3 className="text-2xl font-black text-stone-800 mb-2 leading-none tracking-tight">
              Kadernim Pro
            </h3>
            
            <div className="flex flex-col items-center mt-6">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-stone-400 mr-0.5">R$</span>
                <span className="text-6xl font-black text-stone-800 tracking-tighter">
                  {fmtAmount(displayPrice)}
                </span>
                <span className="text-stone-400 text-sm font-medium tracking-tight">/mês</span>
              </div>
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mt-2 px-4 py-1 bg-stone-100 rounded-full">
                {detailLabel}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="px-8 py-2">
            <div className="h-px bg-stone-200/60" />
            <div className="py-8">
              <ul className="space-y-4">
                {includes.map((item) => (
                  <li key={item} className="flex items-center gap-3.5 text-sm font-medium text-stone-600">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 border border-green-200/50">
                      <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 pb-10 pt-4">
            <Link
              href={`/checkout?plan=${plan.id}`}
              className="group relative flex items-center justify-center h-14 w-full rounded-2xl bg-stone-900 border border-stone-800 text-white font-bold text-base transition-all hover:bg-violet-600 hover:border-violet-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Começar Agora
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 bg-green-50/50 border border-green-100/50 px-4 py-2 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="text-xs font-bold text-stone-700">7 dias de garantia total</span>
              </div>
              <p className="text-[10px] text-stone-400 font-medium">CANCELE QUANDO QUISER · SEM MULTA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   COMPARISON
───────────────────────────────────────────── */
function Comparison() {
  return (
    <section className="py-24">
      <W>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-stone-800 mb-4 tracking-tight uppercase">
            Por que o Kadernim é diferente?
          </h2>
          <p className="text-stone-500 font-medium">Qualidade curada vs volume aleatório</p>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-stone-200 rounded-3xl overflow-hidden border border-stone-200">
          <div className="bg-white p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-stone-100 rounded-xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-stone-400" />
              </div>
              <h3 className="text-xl font-black text-stone-400 uppercase tracking-tight">Packs de 20k Arquivos</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Volume inflado (arquivos repetidos)',
                'Sem curadoria pedagógica',
                'Bagunça: difícil de encontrar o tema',
                'Comprou, acabou (sem atualizações)',
                'Muitas vezes com erros de português',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-bold text-stone-400 line-through decoration-stone-200">
                  <span className="text-lg">×</span> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-10 relative">
            <div className="absolute inset-0 bg-violet-50/30 -z-10" />
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-stone-800 uppercase tracking-tight">Kadernim Pro</h3>
            </div>
            <ul className="space-y-4">
              {[
                'Todos os materiais validados em sala',
                'Busca inteligente e organizada por série',
                'PDFs de alta qualidade, prontos p/ imprimir',
                'Novas atividades reais toda semana',
                'Feito por professoras atuantes',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm font-bold text-violet-700">
                  <Check className="h-4 w-4 text-violet-600" strokeWidth={4} /> {t}
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
   FAQ
───────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  
  const items = [
    { q: 'Serve para Fundamental II?', a: 'Nosso foco atual é Educação Infantil e Fundamental I (1º ao 5º ano), onde temos maior validação.' },
    { q: 'Posso imprimir quantas vezes quiser?', a: 'Sim! Uma vez baixado, o material é seu para usar em sala de aula.' },
    { q: 'Como recebo o acesso?', a: 'Instantaneamente após a confirmação do pagamento. Enviamos os dados para o seu email.' },
    { q: 'É alinhado à BNCC?', a: `Sim, todos os materiais seguem as diretrizes da BNCC ${new Date().getFullYear()} para garantir o aprendizado correto.` },
  ]

  return (
    <section className="py-24 bg-stone-50/50 border-t border-stone-200/60">
      <W>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-stone-800 text-center mb-12 uppercase tracking-tight">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold text-stone-800">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 text-stone-400 transition-transform ${open === i ? 'rotate-180 text-violet-600' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-6 text-sm font-medium text-stone-500 border-t border-stone-50 pt-4 animate-in fade-in duration-300">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PAGE CLIENT
───────────────────────────────────────────── */
export function PlansClient({ catalog }: { catalog: CheckoutPlanCatalog }) {
  const [period, setPeriod] = useState<Period>('annual')

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 selection:bg-violet-100 selection:text-violet-700 antialiased font-sans">
      <Navbar />

      <main>
        {/* Header Section */}
        <section className="pt-20 pb-12 text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-100/40 blur-[120px] rounded-full -z-10" />
          
          <W>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-stone-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-2">
              <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Utilizado por +1.200 Professoras
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 mb-6 tracking-tight leading-[0.9]">
              Invista na sua <br className="hidden sm:block" />
              <span className="text-violet-600">Tranquilidade</span> Pedagógica.
            </h1>

            <p className="text-lg text-stone-500 font-medium max-w-2xl mx-auto mb-12">
              Chega de perder noites procurando material genérico. Tenha uma biblioteca 
              valida e organizada sempre à mão.
            </p>

            <BillingToggle period={period} onChange={setPeriod} />
          </W>
        </section>

        {/* Card Section */}
        <section className="pb-24">
          <W>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <PricingCard period={period} catalog={catalog} />
            </div>
          </W>
        </section>

        {/* TRUST SIGNALS */}
        <section className="pb-24 border-b border-stone-100">
          <W>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Award, label: 'Qualidade Premium' },
                { icon: ShieldCheck, label: 'Pagamento Seguro' },
                { icon: RefreshCw, label: 'Atualização Semanal' },
                { icon: Heart, label: 'Feito c/ Amor' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 bg-white rounded-2xl border border-stone-200 flex items-center justify-center shadow-sm">
                    <Icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </W>
        </section>

        {/* Comparison Section */}
        <Comparison />

        {/* FAQ SECTION */}
        <FAQ />
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-stone-200/60">
        <W className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 bg-stone-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-stone-900 font-black text-lg tracking-tight uppercase">Kadernim</span>
            </Link>
            <p className="text-sm font-medium text-stone-400 max-w-xs text-center md:text-left">
              Biblioteca pedagógica completa para professoras da Educação Infantil e Fundamental I.
            </p>
          </div>
          
          <div className="flex items-center gap-10">
            <Link href="/login" className="text-xs font-bold text-stone-500 uppercase tracking-widest hover:text-stone-900 transition-colors">Entrar</Link>
            <Link href="/plans" className="text-xs font-bold text-stone-500 uppercase tracking-widest hover:text-stone-900 transition-colors">Planos</Link>
            <a href="#" className="text-xs font-bold text-stone-500 uppercase tracking-widest hover:text-stone-900 transition-colors">Termos</a>
          </div>
        </W>
        <div className="mt-12 text-center border-t border-stone-100 pt-8">
          <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Kadernim · Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}
