'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  BookOpen, Check, ChevronDown, ArrowRight, Sparkles,
  Shield, Download, GraduationCap, Star, Users, Zap,
  Clock, FileText, Vote, RefreshCw, TrendingDown, AlertCircle,
} from 'lucide-react'

const go = () => { window.location.href = '/checkout' }

const W = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mx-auto w-full max-w-6xl 2xl:max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>
    {children}
  </div>
)

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen bg-[#05050A] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <W className="py-20 lg:py-0 lg:min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center w-full">

          {/* Copy */}
          <div>
            {/* Gancho: a dor financeira invisível */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-8">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-amber-400 text-xs font-semibold">Você sabe quanto gasta por mês com materiais de aula?</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl 2xl:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Professoras gastam{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                R$&nbsp;120–200/mês
              </span>{' '}
              em materiais avulsos sem perceber.
            </h1>

            <p className="text-slate-400 text-lg 2xl:text-xl leading-relaxed mb-10 max-w-lg">
              R$ 15 aqui, R$ 12 ali, R$ 25 em outro perfil. No fim do mês o dinheiro foi, e às vezes o material nem serviu para a sua turma. Por{' '}
              <span className="text-white font-semibold">R$&nbsp;27/mês</span> você acessa tudo, ilimitado.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={go}
                className="group flex items-center justify-center gap-2 h-14 2xl:h-16 px-8 2xl:px-10 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base 2xl:text-lg transition-all shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)]"
                aria-label="Parar de desperdiçar dinheiro com materiais avulsos"
              >
                Quero parar de desperdiçar
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <a
                href="#oferta"
                className="flex items-center justify-center gap-2 h-14 2xl:h-16 px-8 rounded-2xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white text-base font-medium transition-all"
              >
                Ver o plano
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              {[
                { icon: Shield, label: 'Garantia 7 dias' },
                { icon: Download, label: 'PDF pronto para imprimir' },
                { icon: Star, label: 'Novos materiais toda semana' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup: calculadora de gasto */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden shadow-2xl">
              {/* barra browser */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/8 bg-white/[0.02]">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <div className="ml-3 flex-1 h-5 bg-white/5 rounded-md" />
              </div>

              <div className="p-6 space-y-4">
                {/* Título interno */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Seus gastos com materiais</span>
                  <span className="text-[10px] text-slate-600">últimos 12 meses</span>
                </div>

                {/* Itens de compra */}
                {[
                  { label: 'Atividades no Instagram', value: 'R$ 45', qty: '3 compras' },
                  { label: 'Pacote no Hotmart', value: 'R$ 29', qty: '2 compras' },
                  { label: 'Material no Shopee', value: 'R$ 25', qty: '1 compra' },
                  { label: 'PDF em grupo de WA', value: 'R$ 18', qty: '1 compra' },
                  { label: 'Outros avulsos', value: 'R$ 41', qty: '4 compras' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5">
                    <div>
                      <p className="text-xs text-slate-300">{item.label}</p>
                      <p className="text-[10px] text-slate-600">{item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-400">{item.value}</span>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-2 border-t-2 border-red-500/20">
                  <span className="text-sm font-bold text-white">Total no mês</span>
                  <span className="text-xl font-black text-red-400">R$ 158,00</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>Kadernim Pro custa:</span>
                  <span className="text-green-400 font-bold">R$ 27/mês</span>
                </div>
              </div>
            </div>

            {/* badge de economia */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-3 bg-[#0F0F1A] border border-green-500/20 rounded-2xl px-4 py-3 shadow-xl">
              <div className="h-9 w-9 rounded-xl bg-green-500/15 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Você economizaria</p>
                <p className="text-sm font-bold text-green-400">R$ 1.572/ano</p>
              </div>
            </div>

            {/* badge plataforma */}
            <div className="absolute -top-4 -right-4 flex items-center gap-3 bg-[#0F0F1A] border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Na plataforma</p>
                <p className="text-sm font-bold text-white">248 materiais</p>
              </div>
            </div>
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
function Stats() {
  const items = [
    { value: 'R$ 158', label: 'Gasto médio mensal em materiais avulsos' },
    { value: '248+', label: 'Materiais na biblioteca' },
    { value: '100%', label: 'PDFs prontos para imprimir' },
    { value: '5x', label: 'Mais barato que comprar avulso' },
  ]
  return (
    <section className="border-y border-white/6 bg-white/[0.02]">
      <W className="py-12 2xl:py-16">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-12">
          {items.map(({ value, label }) => (
            <div key={label} className="text-center">
              <dt className="text-4xl 2xl:text-5xl font-black text-white mb-1">{value}</dt>
              <dd className="text-sm 2xl:text-base text-slate-500 max-w-[160px] mx-auto">{label}</dd>
            </div>
          ))}
        </dl>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PROBLEMA → SOLUÇÃO
───────────────────────────────────────────── */
function HowItWorks() {
  return (
    <section className="py-24 2xl:py-32 bg-[#05050A]">
      <W>
        <div className="space-y-28 2xl:space-y-36">

          {/* Bloco 1: O script que se repete */}
          <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 border border-amber-500/30 bg-amber-500/10 rounded-full px-3 py-1">
                O que realmente acontece
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                O script que se repete toda semana, e você nem percebe.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Você viu uma atividade linda no Instagram da prof. Fulana: <span className="text-white">R$ 15</span>. Um jogo de folclore no Hotmart: <span className="text-white">R$ 12</span>. Um pacote de alfabetização no Shopee: <span className="text-white">R$ 25</span>. Às vezes o material nem serve direito para a sua turma, mas você já comprou. <span className="text-slate-200 font-medium">No fim do mês você nem lembra de tudo, mas o dinheiro foi.</span>
              </p>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-amber-500/15 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Onde o dinheiro vai</p>
              <div className="space-y-3">
                {[
                  { source: 'Perfis educativos no Instagram', range: 'R$ 10–35 por material' },
                  { source: 'Hotmart / Kiwify / Eduzz', range: 'R$ 15–49 por material' },
                  { source: 'Grupos de WhatsApp / Telegram', range: 'R$ 5–20 por material' },
                  { source: 'Shopee / Elo7', range: 'R$ 8–30 por material' },
                  { source: 'Pinterest → link de compra', range: 'R$ 10–25 por material' },
                ].map(({ source, range }, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-400">{source}</span>
                    <span className="text-xs font-semibold text-red-400 shrink-0 ml-4">{range}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-amber-500/20">
                <p className="text-sm text-amber-300 font-medium">
                  Media: 8 compras/mês × R$ 18 = <span className="font-black text-lg text-amber-400">R$ 144/mês</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bloco 2: Além do dinheiro */}
          <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center lg:[&>*:first-child]:order-2">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-400 mb-4 border border-red-500/30 bg-red-500/10 rounded-full px-3 py-1">
                Ainda tem mais
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                Dinheiro é só uma parte do problema.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Material que não se encaixa na sua turma. Arquivo perdido no email, link expirado no WhatsApp, pendrive que sumiu. Horas na noite de domingo organizando o que deu para achar. E ainda a sensação de que a aula poderia ser melhor se você tivesse tempo para planejar direito.
              </p>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-white/8 bg-white/[0.02] space-y-3">
              {[
                { icon: '💸', title: 'Material comprado que não serve', sub: 'Sem preview, sem garantia, dinheiro fora' },
                { icon: '📁', title: 'Arquivos espalhados por todo lugar', sub: 'Email, WhatsApp, pendrive, Drive, nada organizado' },
                { icon: '😩', title: 'Noite e FDS perdidos planejando', sub: 'Além de corrigir prova e preencher diário' },
                { icon: '🔄', title: 'Reinventando a roda toda semana', sub: 'Outras professoras têm o mesmo problema, isolamento' },
              ].map(({ icon, title, sub }, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/6">
                  <span className="text-2xl shrink-0" role="img" aria-label={title}>{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 3: A solução */}
          <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1">
                A virada
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                Trocar R$ 144/mês por R$ 27. Acesso a tudo. Sem surpresa.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Uma biblioteca com tudo organizado, materiais prontos para imprimir e novos recursos toda semana. Você entra, escolhe, imprime e volta a ter fim de semana.
              </p>
              <button
                onClick={go}
                className="group mt-8 flex items-center gap-2 h-12 2xl:h-14 px-7 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm 2xl:text-base transition-all"
                aria-label="Trocar compras avulsas pelo Kadernim"
              >
                Trocar as compras avulsas agora
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-3">
              {[
                { label: 'Biblioteca com +248 materiais prontos', color: 'blue' },
                { label: 'PDF pronto para imprimir, sem editor', color: 'green' },
                { label: 'Materiais organizados por série', color: 'amber' },
                { label: 'Sempre atualizado, toda semana', color: 'teal' },
              ].map(({ label, color }, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`h-5 w-5 rounded-full bg-${color}-500/15 border border-${color}-500/25 flex items-center justify-center shrink-0`}>
                    <Check className={`h-3 w-3 text-${color}-400`} aria-hidden="true" />
                  </div>
                  <span className="text-sm 2xl:text-base text-slate-300 font-medium">{label}</span>
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
   FEATURES
───────────────────────────────────────────── */
function Features() {
  const feats = [
    { Icon: BookOpen, color: 'blue', title: 'Biblioteca viva', body: 'Centenas de atividades para Ed. Infantil e Fundamental I. Novos materiais toda semana. Nunca fica parado.', badge: '+20/mês' },
    { Icon: Download, color: 'green', title: 'PDF pronto para imprimir', body: 'Baixe e imprima sem depender de editor online. Cada material já sai formatado e pronto.', badge: 'Pronto já' },
    { Icon: RefreshCw, color: 'teal', title: 'Sempre atualizado', body: 'Calendário escolar, datas comemorativas, novas temáticas, a plataforma acompanha.', badge: 'Toda semana' },
  ]

  const colorMap: Record<string, string> = {
    'brand-1': 'bg-brand-1/10 text-brand-1 border-brand-1/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  return (
    <section className="py-24 2xl:py-32 border-t border-white/6 bg-[#08080F]">
      <W>
        <div className="text-center max-w-2xl 2xl:max-w-3xl mx-auto mb-16 2xl:mb-20">
          <h2 className="text-3xl 2xl:text-4xl font-black text-white mb-4">
            Tudo o que você compra avulso por um preço fixo.
          </h2>
          <p className="text-slate-400 text-base 2xl:text-lg">
            Sem surpresa no fim do mês. Sem material que não serve. Sem caçar no Instagram.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 2xl:gap-5">
          {feats.map(({ Icon, color, title, body, badge }) => (
            <div key={title} className="group p-6 2xl:p-7 rounded-2xl border border-white/6 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04] transition-all">
              <div className={`inline-flex items-center justify-center h-11 w-11 2xl:h-12 2xl:w-12 rounded-xl border mb-4 ${colorMap[color]}`}>
                <Icon className="h-5 w-5 2xl:h-6 2xl:w-6" aria-hidden="true" />
              </div>
              <div className="flex items-start justify-between mb-2 gap-2">
                <h3 className="text-base 2xl:text-lg font-bold text-white">{title}</h3>
                <span className={`shrink-0 text-[10px] 2xl:text-xs font-bold px-2 py-0.5 rounded-full border ${colorMap[color]}`}>
                  {badge}
                </span>
              </div>
              <p className="text-sm 2xl:text-base text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
function Pricing() {
  return (
    <section id="oferta" className="py-24 2xl:py-32 bg-[#05050A]">
      <W>
        <div className="text-center max-w-xl mx-auto mb-12 2xl:mb-16">
          <h2 className="text-3xl 2xl:text-4xl font-black text-white mb-3">
            Menos de um material avulso por mês.
          </h2>
          <p className="text-slate-400 2xl:text-lg">
            Por R$ 27/mês você acessa o que antes custava R$ 144. Todo mês.
          </p>
        </div>

        <div className="max-w-md 2xl:max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative rounded-3xl border border-blue-500/30 bg-[#0A0A18] overflow-hidden">

              <div className="px-8 2xl:px-10 pt-8 2xl:pt-10 pb-6 border-b border-white/6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Plano Pro</p>
                    <h3 className="text-2xl 2xl:text-3xl font-black text-white">Acesso ilimitado</h3>
                  </div>
                  <span className="mt-1 text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2.5 py-1">
                    80% mais barato
                  </span>
                </div>

                {/* Comparação de preço */}
                <div className="bg-white/[0.03] rounded-xl p-4 mb-4 border border-white/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Comprando avulso (média)</span>
                    <span className="text-sm font-bold text-red-400 line-through">R$ 144/mês</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">Kadernim Pro</span>
                    <span className="text-sm font-black text-green-400">R$ 27/mês</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl 2xl:text-6xl font-black text-white tracking-tight">R$&nbsp;27</span>
                  <span className="text-slate-500 text-sm">/mês</span>
                </div>
                <p className="text-sm text-slate-500">
                  Mensal · Cancele quando quiser
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  À vista anual: <span className="text-white font-semibold">R$ 197/ano</span>{' '}
                  <span className="text-green-400">(2 meses grátis)</span>
                </p>
              </div>

              <div className="px-8 2xl:px-10 py-6 border-b border-white/6">
                <ul className="space-y-3 2xl:space-y-4" aria-label="Incluído no Plano Pro">
                  {[
                    'Biblioteca ilimitada com +248 materiais',
                    'Acesso a materiais exclusivos',
                    'Download ilimitado em PDF',
                    'Materiais organizados por série',
                    'Suporte via WhatsApp',
                    'Novos recursos toda semana',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm 2xl:text-base text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-blue-400" aria-hidden="true" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-8 2xl:px-10 py-6 2xl:py-8 space-y-4">
                <button
                  onClick={go}
                  className="group w-full h-14 2xl:h-16 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base 2xl:text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]"
                  aria-label="Assinar o Plano Pro e parar de desperdiçar dinheiro"
                >
                  Quero acesso ilimitado
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <Shield className="h-5 w-5 text-green-400 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-white">Garantia incondicional de 7 dias</p>
                    <p className="text-xs text-slate-500 mt-0.5">Não gostou? 100% do valor de volta. Sem burocracia.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-5 mt-6 text-xs 2xl:text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" aria-hidden="true" />+500 professoras</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" aria-hidden="true" />Acesso imediato</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" aria-hidden="true" />Cancele quando quiser</span>
          </div>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
const faqs = [
  { q: 'Como saber se é para mim?', a: 'Se você leciona na Educação Infantil ou Fundamental I e já comprou algum material avulso, pacote no Hotmart, atividade no Instagram, PDF no Shopee, então é para você. A Kadernim substitui todas essas compras por um acesso único e ilimitado.' },
  { q: 'Como funciona a garantia de 7 dias?', a: 'Você experimenta tudo livremente. Se em até 7 dias não gostar, devolvemos 100% do valor, sem perguntas, sem burocracia. Sem risco nenhum.' },
  { q: 'Para quais séries são os materiais?', a: 'Focamos na Educação Infantil e Fundamental I (1º ao 5º ano): alfabetização, matemática, ciências, história, geografia e datas comemorativas.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem fidelidade, sem multa. Mas ao cancelar você perde o acesso à biblioteca. A maioria das professoras que entra não quer mais voltar a comprar avulso.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-24 2xl:py-32 border-t border-white/6 bg-[#08080F]">
      <W>
        <div className="max-w-2xl 2xl:max-w-3xl mx-auto">
          <h2 className="text-3xl 2xl:text-4xl font-black text-white text-center mb-3">
            Perguntas frequentes
          </h2>
          <p className="text-center text-slate-500 mb-10 2xl:mb-12 text-sm 2xl:text-base">
            Ainda com dúvidas? Faz sentido. Veja as respostas mais comuns.
          </p>
          <div className="space-y-2 2xl:space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/6 bg-white/[0.02] overflow-hidden">
                <button
                  id={`variantb-faq-${i}`}
                  aria-expanded={open === i}
                  aria-controls={`variantb-faq-p-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 2xl:px-6 2xl:py-5 text-left text-sm 2xl:text-base font-semibold text-slate-200 hover:text-white hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-colors"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 2xl:h-5 2xl:w-5 text-slate-600 shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180 text-blue-400' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {open === i && (
                  <div
                    id={`variantb-faq-p-${i}`}
                    role="region"
                    aria-labelledby={`variantb-faq-${i}`}
                    className="px-5 pb-5 2xl:px-6 2xl:pb-6 text-sm 2xl:text-base text-slate-500 leading-relaxed border-t border-white/6 pt-4"
                  >
                    {faq.a}
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
   CTA FINAL
───────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section className="py-24 2xl:py-32 bg-[#05050A] relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[600px] h-[600px] 2xl:w-[800px] 2xl:h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>
      <W className="relative text-center">
        <div className="max-w-2xl 2xl:max-w-3xl mx-auto">
          <p className="text-slate-500 text-sm 2xl:text-base mb-4">Faça a conta</p>
          <h2 className="text-4xl 2xl:text-5xl font-black text-white mb-5 leading-tight">
            R$ 144/mês em compras avulsas<br />
            <span className="text-blue-400">ou R$ 27 com acesso a tudo?</span>
          </h2>
          <p className="text-slate-400 text-lg 2xl:text-xl mb-10">
            A escolha parece óbvia. Mas a maioria das professoras ainda não fez essa troca.
          </p>
          <button
            onClick={go}
            className="group inline-flex items-center gap-2 h-14 2xl:h-16 px-10 2xl:px-14 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base 2xl:text-lg transition-all shadow-[0_0_60px_rgba(59,130,246,0.4)] hover:shadow-[0_0_80px_rgba(59,130,246,0.6)]"
            aria-label="Assinar o Plano Pro agora"
          >
            Fazer a troca agora
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
          <p className="mt-5 text-xs 2xl:text-sm text-slate-600">
            Garantia de 7 dias · Acesso imediato · Cancele quando quiser
          </p>
        </div>
      </W>
    </section>
  )
}

/* ─────────────────────────────────────────────
   FOOTER MINIMALISTA
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#05050A] py-8 2xl:py-10">
      <W className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Image
            src="/images/logo_transparent_crop.png"
            alt="Kadernim"
            width={105}
            height={24}
            className="h-6 w-auto object-contain"
          />
        </div>
        <p className="text-xs 2xl:text-sm text-slate-700 text-center">
          Devolvendo o tempo e o dinheiro que o professor merece.
        </p>
        <p className="text-xs text-slate-800">© {new Date().getFullYear()} Kadernim</p>
      </W>
    </footer>
  )
}

export function VariantB() {
  return (
    <div className="min-h-screen bg-[#05050A] antialiased">
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
