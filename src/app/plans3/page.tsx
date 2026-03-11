'use client'

import React, { useState } from 'react'
import {
  BookOpen, Check, ChevronDown, ArrowRight, Sparkles,
  Shield, Download, GraduationCap, Clock, FileText,
  Vote, Users, RefreshCw, Zap, Star, AlertTriangle,
  Timer, Calendar, Search,
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
    <section className="relative min-h-screen bg-[#040410] flex items-center overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      {/* Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/15 rounded-full blur-[130px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />

      <W className="py-20 lg:py-0 lg:min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center w-full">

          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 mb-8">
              <Timer className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
              <span className="text-violet-400 text-xs font-semibold">Quanto do seu tempo vai para buscar material?</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl 2xl:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Você virou professora{' '}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                para ensinar.
              </span>{' '}
              Não para garimpar material.
            </h1>

            <p className="text-slate-400 text-lg 2xl:text-xl leading-relaxed mb-10 max-w-lg">
              São horas toda semana buscando no Instagram, formatando atividades, montando plano de aula do zero. Horas que deveriam estar na sala de aula, com a família, ou descansando. Por{' '}
              <span className="text-white font-semibold">R$&nbsp;29/mês</span> isso acaba.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={go}
                className="group flex items-center justify-center gap-2 h-14 2xl:h-16 px-8 2xl:px-10 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-base 2xl:text-lg transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]"
                aria-label="Recuperar meu tempo livre com o Kadernim"
              >
                Recuperar meu tempo
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
                { icon: GraduationCap, label: 'Alinhado à BNCC' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup: rastreador de horas */}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Semana típica de uma professora</span>
                  <span className="text-[10px] text-slate-600">horas fora de sala</span>
                </div>

                {[
                  { day: 'Segunda', task: 'Buscando atividades no Instagram', time: '1h 20min', icon: Search },
                  { day: 'Quarta', task: 'Montando apresentação', time: '1h 30min', icon: FileText },
                  { day: 'Sexta', task: 'Formatando material para impressão', time: '45min', icon: Download },
                  { day: 'Domingo', task: 'Planejando aulas da semana seguinte', time: '3h 00min', icon: Calendar },
                  { day: 'Domingo', task: 'Escrevendo planos de aula', time: '1h 30min', icon: FileText },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                    <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{item.task}</p>
                      <p className="text-[10px] text-slate-600">{item.day}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 shrink-0">{item.time}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t-2 border-violet-500/20">
                  <span className="text-sm font-bold text-white">Total na semana</span>
                  <span className="text-xl font-black text-amber-400">8h 05min</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>Com Kadernim:</span>
                  <span className="text-green-400 font-bold">menos de 30min</span>
                </div>
              </div>
            </div>

            {/* badge de semanas */}
            <div className="absolute -bottom-4 -left-4 flex items-center gap-3 bg-[#0A0A1C] border border-violet-500/20 rounded-2xl px-4 py-3 shadow-xl">
              <div className="h-9 w-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Em um semestre</p>
                <p className="text-sm font-bold text-violet-400">170h perdidas</p>
              </div>
            </div>

            {/* badge gerador */}
            <div className="absolute -top-4 -right-4 flex items-center gap-3 bg-[#0A0A1C] border border-white/10 rounded-2xl px-4 py-3 shadow-xl">
              <div className="h-9 w-9 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Plano de aula com IA</p>
                <p className="text-sm font-bold text-white">em 23 segundos</p>
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
    { value: '8h', label: 'Por semana em busca e preparação de materiais' },
    { value: '248+', label: 'Materiais prontos na biblioteca' },
    { value: '23s', label: 'Para gerar um plano de aula completo' },
    { value: '170h', label: 'Economizadas por semestre com Kadernim' },
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
    <section className="py-24 2xl:py-32 bg-[#040410]">
      <W>
        <div className="space-y-28 2xl:space-y-36">

          {/* Bloco 1: O ciclo que não para */}
          <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-violet-400 mb-4 border border-violet-500/30 bg-violet-500/10 rounded-full px-3 py-1">
                O ciclo semanal
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                Toda semana o mesmo ciclo. E ele nunca para.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Segunda: buscar atividade. Quarta: montar apresentação. Sexta: formatar para impressão. Domingo: planejar a semana inteira do zero. É um ciclo que se repete há anos, <span className="text-slate-200 font-medium">e cada ciclo custa em média 8 horas da sua vida.</span>
              </p>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-violet-500/15 bg-violet-500/5">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Onde as horas vão toda semana</p>
              <div className="space-y-3">
                {[
                  { task: 'Buscando material no Instagram e Pinterest', time: '2h 30min' },
                  { task: 'Comprando e baixando de plataformas', time: '45min' },
                  { task: 'Adaptando para a sua turma', time: '1h 00min' },
                  { task: 'Escrevendo plano de aula à mão ou no Word', time: '2h 00min' },
                  { task: 'Formatando e preparando para imprimir', time: '1h 15min' },
                ].map(({ task, time }, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-slate-400">{task}</span>
                    <span className="text-xs font-semibold text-amber-400 shrink-0 ml-4">{time}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-violet-500/20">
                <p className="text-sm text-violet-300 font-medium">
                  Total: <span className="font-black text-lg text-amber-400">~8h por semana</span> em preparação
                </p>
              </div>
            </div>
          </div>

          {/* Bloco 2: O que esse tempo vale */}
          <div className="grid lg:grid-cols-2 gap-12 2xl:gap-20 items-center lg:[&>*:first-child]:order-2">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 border border-amber-500/30 bg-amber-500/10 rounded-full px-3 py-1">
                O custo real
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                Não é só o domingo que vai embora.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Em um semestre são 170 horas que poderiam estar com sua família, estudando, descansando, ou sendo a professora que você quer ser dentro da sala. Em vez disso, ficam no ciclo de busca, compra, formata, repete.
              </p>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-white/8 bg-white/[0.02] space-y-3">
              {[
                { title: 'Horas com a família que não voltam', sub: '170h por semestre fora de sala, sem contar as aulas em si', warn: true },
                { title: 'Material que às vezes nem serve', sub: 'Comprou, baixou, não encaixa na turma. Tempo e dinheiro fora', warn: true },
                { title: 'Planejamento improvisado no último minuto', sub: 'Porque simplesmente não sobrou tempo para fazer direito', warn: true },
                { title: 'Sensação de nunca estar preparada o suficiente', sub: 'Não por falta de dedicação, mas por falta de tempo e recursos', warn: true },
              ].map(({ title, sub }, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/6">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
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
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-green-400 mb-4 border border-green-500/30 bg-green-500/10 rounded-full px-3 py-1">
                A virada
              </span>
              <h2 className="text-3xl 2xl:text-4xl font-black text-white leading-tight mb-5">
                8 horas de ciclo viram 30 minutos. Toda semana.
              </h2>
              <p className="text-slate-400 text-base 2xl:text-lg leading-relaxed">
                Você abre o Kadernim, encontra o material na biblioteca, gera o plano de aula com IA em 23 segundos, baixa o PDF e pronto. O domingo voltou a ser seu.
              </p>
              <button
                onClick={go}
                className="group mt-8 flex items-center gap-2 h-12 2xl:h-14 px-7 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm 2xl:text-base transition-all"
                aria-label="Recuperar meu tempo com o Kadernim"
              >
                Quero meu tempo de volta
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
            </div>
            <div className="p-6 2xl:p-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3">
              {[
                { label: 'Biblioteca com +248 materiais prontos em PDF', color: 'violet' },
                { label: 'Plano de aula com IA em 23 segundos', color: 'green' },
                { label: 'Tudo organizado, sem pendrive ou link expirado', color: 'blue' },
                { label: 'Você decide o que entra todo mês', color: 'amber' },
                { label: 'Comunidade de professoras com os mesmos desafios', color: 'pink' },
                { label: 'Novo material toda semana, sem você pedir', color: 'teal' },
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
    { Icon: BookOpen, color: 'violet', title: 'Biblioteca viva', body: 'Centenas de atividades para Ed. Infantil e Fundamental I. Novos materiais toda semana. Sempre tem o que você precisa.', badge: '+20/mês' },
    { Icon: Sparkles, color: 'green', title: 'Plano de aula em 23s', body: 'Informa o tema e a série, a IA cria o plano completo, alinhado à BNCC, pronto para baixar em PDF.', badge: 'IA + BNCC' },
    { Icon: Download, color: 'blue', title: 'PDF pronto para imprimir', body: 'Tudo formatado, sem editar. Abriu, baixou, imprimiu. Sem depender de editor ou plataforma online.', badge: 'Pronto já' },
    { Icon: Vote, color: 'amber', title: 'Você manda', body: 'Todo mês votação aberta. Você pede o que precisa e a gente cria. Nunca vai faltar material para a sua aula.', badge: 'Todo mês' },
    { Icon: Users, color: 'pink', title: 'Comunidade real', body: 'Professoras com os mesmos desafios. Compartilhe estratégias, ideias e descubra que não está sozinha.', badge: '500+ membros' },
    { Icon: RefreshCw, color: 'teal', title: 'Sempre atualizado', body: 'Calendário escolar, datas comemorativas, habilidades da BNCC. A plataforma acompanha seu ano letivo.', badge: 'Toda semana' },
  ]

  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  return (
    <section className="py-24 2xl:py-32 border-t border-white/6 bg-[#060618]">
      <W>
        <div className="text-center max-w-2xl 2xl:max-w-3xl mx-auto mb-16 2xl:mb-20">
          <h2 className="text-3xl 2xl:text-4xl font-black text-white mb-4">
            Tudo o que você precisa para ensinar. Nada do que drena seu tempo.
          </h2>
          <p className="text-slate-400 text-base 2xl:text-lg">
            Um lugar com tudo organizado. Sem garimpar, sem formatar, sem domingo perdido.
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
    <section id="oferta" className="py-24 2xl:py-32 bg-[#040410]">
      <W>
        <div className="text-center max-w-xl mx-auto mb-12 2xl:mb-16">
          <h2 className="text-3xl 2xl:text-4xl font-black text-white mb-3">
            170 horas por semestre. Por R$ 29/mês.
          </h2>
          <p className="text-slate-400 2xl:text-lg">
            O que você recupera vale muito mais do que o que paga.
          </p>
        </div>

        <div className="max-w-md 2xl:max-w-lg mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/15 blur-3xl rounded-3xl pointer-events-none" aria-hidden="true" />
            <div className="relative rounded-3xl border border-violet-500/30 bg-[#08081A] overflow-hidden">

              <div className="px-8 2xl:px-10 pt-8 2xl:pt-10 pb-6 border-b border-white/6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Plano Pro</p>
                    <h3 className="text-2xl 2xl:text-3xl font-black text-white">Acesso ilimitado</h3>
                  </div>
                  <span className="mt-1 text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2.5 py-1">
                    170h/semestre
                  </span>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-4 mb-4 border border-white/6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Tempo semanal atual em prep.</span>
                    <span className="text-sm font-bold text-red-400">~8h/semana</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">Com Kadernim</span>
                    <span className="text-sm font-black text-green-400">menos de 30min</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl 2xl:text-6xl font-black text-white tracking-tight">R$&nbsp;29</span>
                  <span className="text-slate-500 text-sm">/mês</span>
                </div>
                <p className="text-sm text-slate-500">
                  Mensal · Cancele quando quiser
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  À vista anual: <span className="text-white font-semibold">R$ 199/ano</span>{' '}
                  <span className="text-green-400">(2 meses grátis)</span>
                </p>
              </div>

              <div className="px-8 2xl:px-10 py-6 border-b border-white/6">
                <ul className="space-y-3 2xl:space-y-4" aria-label="Incluído no Plano Pro">
                  {[
                    'Biblioteca ilimitada — +248 materiais em PDF',
                    'Gerador de Planos de Aula (IA + BNCC)',
                    'Download ilimitado em PDF',
                    'Votação mensal nos próximos materiais',
                    'Comunidade colaborativa de professoras',
                    'Novos recursos toda semana',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm 2xl:text-base text-slate-300">
                      <div className="h-5 w-5 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-violet-400" aria-hidden="true" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-8 2xl:px-10 py-6 2xl:py-8 space-y-4">
                <button
                  onClick={go}
                  className="group w-full h-14 2xl:h-16 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-base 2xl:text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]"
                  aria-label="Assinar o Plano Pro e recuperar meu tempo"
                >
                  Recuperar meu tempo agora
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
  { q: 'Mas eu já tenho uma rotina de preparação. Vale mudar?', a: 'Se a sua rotina custa 8 horas por semana, sim. Com a biblioteca pronta e o gerador de planos de aula, o que hoje leva horas passa a levar minutos. A maioria das professoras sente a diferença já na primeira semana.' },
  { q: 'Os materiais são realmente prontos ou preciso adaptar muito?', a: 'Os materiais são criados especificamente para Ed. Infantil e Fundamental I, já formatados e prontos para imprimir em PDF. O gerador de planos de aula cria o planejamento personalizado para o seu tema e série em menos de 30 segundos.' },
  { q: 'E se não tiver o material que eu preciso?', a: 'Você vota todo mês no que a plataforma vai criar. Se não existe ainda, você pede e a comunidade vota. Os temas mais votados entram em produção na semana seguinte. Nunca vai ficar sem o que precisa.' },
  { q: 'Para quais séries são os materiais?', a: 'Focamos na Educação Infantil e Fundamental I (1º ao 5º ano): alfabetização, matemática, ciências, história, geografia e datas comemorativas.' },
  { q: 'Como funciona a garantia de 7 dias?', a: 'Você experimenta tudo livremente. Se em até 7 dias não sentir que valeu o tempo e o dinheiro, devolvemos 100% do valor sem perguntas.' },
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem fidelidade, sem multa. Mas a maioria que entra não quer mais voltar ao ciclo semanal de 8 horas de garimpo.' },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-24 2xl:py-32 border-t border-white/6 bg-[#060618]">
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
                  id={`faqc-${i}`}
                  aria-expanded={open === i}
                  aria-controls={`faqc-p-${i}`}
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 2xl:px-6 2xl:py-5 text-left text-sm 2xl:text-base font-semibold text-slate-200 hover:text-white hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 transition-colors"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-4 w-4 2xl:h-5 2xl:w-5 text-slate-600 shrink-0 ml-4 transition-transform duration-200 ${open === i ? 'rotate-180 text-violet-400' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {open === i && (
                  <div
                    id={`faqc-p-${i}`}
                    role="region"
                    aria-labelledby={`faqc-${i}`}
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
    <section className="py-24 2xl:py-32 bg-[#040410] relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[600px] h-[600px] 2xl:w-[800px] 2xl:h-[800px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>
      <W className="relative text-center">
        <div className="max-w-2xl 2xl:max-w-3xl mx-auto">
          <p className="text-slate-500 text-sm 2xl:text-base mb-4">Faça a conta</p>
          <h2 className="text-4xl 2xl:text-5xl font-black text-white mb-5 leading-tight">
            8 horas por semana procurando material<br />
            <span className="text-violet-400">ou 30 minutos com tudo pronto?</span>
          </h2>
          <p className="text-slate-400 text-lg 2xl:text-xl mb-10">
            Você virou professora para ensinar. O Kadernim cuida do resto.
          </p>
          <button
            onClick={go}
            className="group inline-flex items-center gap-2 h-14 2xl:h-16 px-10 2xl:px-14 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-base 2xl:text-lg transition-all shadow-[0_0_60px_rgba(139,92,246,0.4)] hover:shadow-[0_0_80px_rgba(139,92,246,0.6)]"
            aria-label="Assinar o Plano Pro e recuperar meu tempo"
          >
            Quero meu tempo de volta
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
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#040410] py-8 2xl:py-10">
      <W className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-violet-500 rounded-md flex items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-white font-bold text-sm">Kadernim</span>
        </div>
        <p className="text-xs 2xl:text-sm text-slate-700 text-center">
          Devolvendo o tempo que o professor merece.
        </p>
        <p className="text-xs text-slate-800">© {new Date().getFullYear()} Kadernim</p>
      </W>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function PlansPageC() {
  return (
    <div className="min-h-screen bg-[#040410] antialiased">
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
