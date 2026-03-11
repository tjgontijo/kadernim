'use client'

import type { InputHTMLAttributes, ReactNode } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  BookOpen,
  Check,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  QrCode,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import {
  DEFAULT_CHECKOUT_PLAN_ID,
  getAnnualCardInstallmentOptions,
  getAnnualCardInstallmentPreview,
  getCheckoutPricing,
  resolveCheckoutPaymentMethod,
  type CheckoutPlanCatalog,
  type CheckoutPlanId,
} from '@/lib/billing/checkout-offer'
import { PixQrCode } from './checkout-pix-qrcode'

function fmtCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 11) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

function fmtPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

function fmtCard(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19)
}

function fmtWholeAmount(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

type Method = 'PIX' | 'CREDIT_CARD'

interface PrefilledUser {
  id: string
  name: string
  email: string
}

interface PixData {
  payload: string
  image: string
  expirationDate: string
  statusId: string
  amountLabel: string
  statusToken?: string
  isAutomatic?: boolean
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
      {error ? <p role="alert" className="text-xs text-red-600 font-medium mt-1">{error}</p> : null}
    </div>
  )
}

function TextInput({
  id,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      className={`w-full h-11 px-3.5 rounded-lg border border-gray-300 text-sm text-gray-900
        placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25
        focus:border-blue-500 transition-all ${className}`}
      {...props}
    />
  )
}

function PlanSelector({
  catalog,
  plan,
  setPlan,
}: {
  catalog: CheckoutPlanCatalog
  plan: CheckoutPlanId
  setPlan: (value: CheckoutPlanId) => void
}) {
  const monthlyPlan = catalog.monthly
  const annualPlan = catalog.annual
  const annualPreview = getAnnualCardInstallmentPreview('annual', catalog)

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => setPlan('monthly')}
        className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all flex items-center justify-between gap-3 ${
          plan === 'monthly' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        aria-pressed={plan === 'monthly'}
      >
        <div className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            plan === 'monthly' ? 'border-blue-600' : 'border-gray-300'
          }`}>
            {plan === 'monthly' ? <div className="h-2 w-2 rounded-full bg-blue-600" /> : null}
          </div>
          <div>
            <p className={`text-sm font-bold leading-none mb-0.5 ${plan === 'monthly' ? 'text-blue-700' : 'text-gray-800'}`}>
              {monthlyPlan.label}
            </p>
            <p className="text-xs text-gray-400">{monthlyPlan.description}</p>
          </div>
        </div>
        <p className={`text-lg font-black shrink-0 ${plan === 'monthly' ? 'text-blue-700' : 'text-gray-800'}`}>
          R$&nbsp;{fmtWholeAmount(monthlyPlan.creditCardAmount)}<span className="text-xs font-medium text-gray-400">/mes</span>
        </p>
      </button>

      <button
        type="button"
        onClick={() => setPlan('annual')}
        className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all flex items-center justify-between gap-3 relative ${
          plan === 'annual' ? 'border-green-500 bg-green-50/50' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        aria-pressed={plan === 'annual'}
      >
        {annualPlan.badge ? (
          <span className="absolute -top-2.5 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
            {annualPlan.badge}
          </span>
        ) : null}
        <div className="flex items-center gap-3">
          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            plan === 'annual' ? 'border-green-500' : 'border-gray-300'
          }`}>
            {plan === 'annual' ? <div className="h-2 w-2 rounded-full bg-green-500" /> : null}
          </div>
          <div>
            <p className={`text-sm font-bold leading-none mb-0.5 ${plan === 'annual' ? 'text-green-700' : 'text-gray-800'}`}>
              {annualPlan.label}
            </p>
            <p className="text-xs text-gray-400">{annualPlan.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-black leading-none ${plan === 'annual' ? 'text-green-700' : 'text-gray-800'}`}>
            R$&nbsp;{fmtWholeAmount(annualPlan.creditCardAmount)}
          </p>
          {annualPreview ? <p className="text-[11px] font-semibold text-gray-500 mt-1">ou ate {annualPreview.priceLabel}</p> : null}
          {annualPlan.strikeLabel ? <p className="text-xs text-gray-400 line-through">{annualPlan.strikeLabel}</p> : null}
        </div>
      </button>
    </div>
  )
}

function OrderSummary({
  catalog,
  plan,
  setPlan,
}: {
  catalog: CheckoutPlanCatalog
  plan: CheckoutPlanId
  setPlan: (value: CheckoutPlanId) => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-widest leading-none mb-1">Kadernim Pro</p>
            <p className="text-white text-base font-bold leading-none">Acesso ilimitado</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <ul className="space-y-2.5">
          {[
            { icon: BookOpen, text: '+248 materiais em PDF prontos' },
            { icon: Sparkles, text: 'Gerador de plano de aula com IA' },
            { icon: Zap, text: 'Novos materiais toda semana' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-blue-600" aria-hidden="true" />
              </div>
              <span className="text-sm text-gray-600">{text}</span>
            </li>
          ))}
        </ul>

        <div className="h-px bg-gray-100" />

        <PlanSelector catalog={catalog} plan={plan} setPlan={setPlan} />
      </div>
    </div>
  )
}

export function GuestCheckoutForm({
  prefilledUser,
  catalog,
}: {
  prefilledUser?: PrefilledUser | null
  catalog: CheckoutPlanCatalog
}) {
  const [plan, setPlan] = useState<CheckoutPlanId>(DEFAULT_CHECKOUT_PLAN_ID)
  const [method, setMethod] = useState<Method>('PIX')
  const [annualInstallments, setAnnualInstallments] = useState(1)
  const [name, setName] = useState(prefilledUser?.name ?? '')
  const [email, setEmail] = useState(prefilledUser?.email ?? '')
  const [phone, setPhone] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [ccNumber, setCcNumber] = useState('')
  const [ccHolder, setCcHolder] = useState('')
  const [ccMonth, setCcMonth] = useState('')
  const [ccYear, setCcYear] = useState('')
  const [ccv, setCcv] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pixData, setPixData] = useState<PixData | null>(null)

  const isLoggedIn = Boolean(prefilledUser)
  const selectedPlan = catalog[plan]
  const selectedPricing = getCheckoutPricing(plan, method, catalog, annualInstallments)
  const annualInstallmentOptions = getAnnualCardInstallmentOptions(plan, catalog)
  const selectedPaymentMethod = resolveCheckoutPaymentMethod(plan, method, catalog)
  const checkoutSuccessUrl = '/dashboard?checkout=success'

  function getPostCheckoutUrl() {
    if (isLoggedIn) {
      return checkoutSuccessUrl
    }

    const checkoutEmail = (prefilledUser?.email ?? email).trim().toLowerCase()
    const query = new URLSearchParams({
      callbackURL: checkoutSuccessUrl,
      email: checkoutEmail,
    })

    return `/login?${query.toString()}`
  }

  function validate() {
    const nextErrors: Record<string, string> = {}

    if (!isLoggedIn) {
      if (!name.trim() || name.trim().length < 2) nextErrors.name = 'Nome obrigatorio'
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Email invalido'
      if (phone.replace(/\D/g, '').length < 10) nextErrors.phone = 'WhatsApp obrigatorio'
    }

    const cpfClean = cpfCnpj.replace(/\D/g, '')
    if (cpfClean.length !== 11 && cpfClean.length !== 14) nextErrors.cpfCnpj = 'CPF ou CNPJ invalido'

    if (method === 'CREDIT_CARD') {
      if (!ccNumber || ccNumber.replace(/\D/g, '').length < 14) nextErrors.ccNumber = 'Numero invalido'
      if (!ccHolder || ccHolder.trim().length < 3) nextErrors.ccHolder = 'Nome obrigatorio'
      if (!ccMonth || ccMonth.length < 2) nextErrors.ccMonth = 'Invalido'
      if (!ccYear || ccYear.length < 4) nextErrors.ccYear = 'Invalido'
      if (!ccv || ccv.length < 3) nextErrors.ccv = 'Invalido'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!validate()) {
        throw new Error('_validation')
      }

      const body: Record<string, unknown> = {
        email: (prefilledUser?.email ?? email).trim().toLowerCase(),
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        paymentMethod: selectedPaymentMethod,
        planId: plan,
        installments: plan === 'annual' && method === 'CREDIT_CARD' ? annualInstallments : 1,
        ...(!isLoggedIn ? {
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
        } : {}),
      }

      if (method === 'CREDIT_CARD') {
        body.creditCard = {
          holderName: ccHolder,
          number: ccNumber.replace(/\D/g, ''),
          expiryMonth: ccMonth,
          expiryYear: ccYear,
          ccv,
        }
      }

      const endpoint = isLoggedIn ? '/api/v1/billing/checkout' : '/api/v1/billing/checkout-guest'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      return { data, paymentMethod: selectedPaymentMethod }
    },
    onSuccess: ({ data, paymentMethod }) => {
      if (paymentMethod === 'PIX' || paymentMethod === 'PIX_AUTOMATIC') {
        setPixData({
          payload: data.qrCodePayload,
          image: data.qrCodeImage,
          expirationDate: data.expirationDate,
          statusId: data.authorizationId || data.invoiceId,
          amountLabel: data.amountLabel ?? selectedPricing.priceLabel,
          statusToken: data.statusToken,
          isAutomatic: paymentMethod === 'PIX_AUTOMATIC',
        })
        return
      }

      if (data.status === 'RECEIVED' || data.status === 'CONFIRMED') {
        toast.success('Pagamento aprovado!')
      }

      window.location.href = getPostCheckoutUrl()
    },
    onError: (error: Error) => {
      if (error.message === '_validation') {
        return
      }

      toast.error(error.message)
    },
  })

  if (pixData) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <PixQrCode
            payload={pixData.payload}
            image={pixData.image}
            expirationDate={pixData.expirationDate}
            statusId={pixData.statusId}
            amountLabel={pixData.amountLabel}
            statusToken={pixData.statusToken}
            isAutomatic={pixData.isAutomatic}
            onSuccess={() => {
              window.location.href = getPostCheckoutUrl()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_360px] gap-5 lg:gap-8 items-start">
        <div className="order-2 md:order-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
              <h2 className="text-sm font-bold text-gray-800">Dados pessoais</h2>
            </div>
            <div className="px-5 py-5">
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <div className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{prefilledUser?.name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{prefilledUser?.name}</p>
                      <p className="text-xs text-gray-500">{prefilledUser?.email}</p>
                    </div>
                  </div>
                  <Field label="CPF ou CNPJ" id="cpfcnpj" error={errors.cpfCnpj}>
                    <TextInput
                      id="cpfcnpj"
                      placeholder="000.000.000-00"
                      value={cpfCnpj}
                      onChange={(event) => setCpfCnpj(fmtCpfCnpj(event.target.value))}
                      inputMode="numeric"
                      maxLength={18}
                    />
                  </Field>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nome completo" id="name" error={errors.name}>
                    <TextInput
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoFocus
                    />
                  </Field>
                  <Field label="WhatsApp" id="phone" error={errors.phone}>
                    <TextInput
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(event) => setPhone(fmtPhone(event.target.value))}
                      inputMode="numeric"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email" id="email" error={errors.email}>
                      <TextInput
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="CPF ou CNPJ" id="cpfcnpj" error={errors.cpfCnpj}>
                      <TextInput
                        id="cpfcnpj"
                        placeholder="000.000.000-00"
                        value={cpfCnpj}
                        onChange={(event) => setCpfCnpj(fmtCpfCnpj(event.target.value))}
                        inputMode="numeric"
                        maxLength={18}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
              <h2 className="text-sm font-bold text-gray-800">Forma de pagamento</h2>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Metodo</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'PIX', icon: QrCode, label: 'Pix' },
                    { key: 'CREDIT_CARD', icon: CreditCard, label: 'Cartao de credito' },
                  ] as const).map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMethod(key)}
                      className={`flex items-center justify-center gap-2 h-11 rounded-lg border-2 text-sm font-semibold transition-all ${
                        method === key
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'PIX' ? (
                <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <Zap className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <span className="font-semibold">{plan === 'monthly' ? 'Aprovacao instantanea.' : 'Pagamento anual no PIX.'}</span>{' '}
                    {selectedPlan.pixDescription}
                  </p>
                </div>
              ) : null}

              {method === 'CREDIT_CARD' && plan === 'annual' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Parcelamento do anual</label>
                  <select
                    value={annualInstallments}
                    onChange={(event) => setAnnualInstallments(Number(event.target.value))}
                    className="w-full h-11 px-3.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                  >
                    {annualInstallmentOptions.map((option) => (
                      <option key={option.count} value={option.count}>
                        {option.priceLabel}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {method === 'CREDIT_CARD' ? (
                <div className="space-y-4">
                  <Field label="Numero do cartao" id="ccnumber" error={errors.ccNumber}>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                      <TextInput
                        id="ccnumber"
                        className="pl-10"
                        placeholder="0000 0000 0000 0000"
                        value={ccNumber}
                        onChange={(event) => setCcNumber(fmtCard(event.target.value))}
                        inputMode="numeric"
                        maxLength={19}
                      />
                    </div>
                  </Field>
                  <Field label="Nome no cartao" id="ccholder" error={errors.ccHolder}>
                    <TextInput
                      id="ccholder"
                      placeholder="NOME IGUAL AO CARTAO"
                      value={ccHolder}
                      onChange={(event) => setCcHolder(event.target.value.toUpperCase())}
                      className="uppercase"
                    />
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Mes" id="ccmonth" error={errors.ccMonth}>
                      <TextInput id="ccmonth" placeholder="MM" maxLength={2} value={ccMonth} onChange={(event) => setCcMonth(event.target.value)} inputMode="numeric" className="text-center" />
                    </Field>
                    <Field label="Ano" id="ccyear" error={errors.ccYear}>
                      <TextInput id="ccyear" placeholder="AAAA" maxLength={4} value={ccYear} onChange={(event) => setCcYear(event.target.value)} inputMode="numeric" className="text-center" />
                    </Field>
                    <Field label="CVV" id="ccv" error={errors.ccv}>
                      <TextInput id="ccv" placeholder="123" maxLength={4} value={ccv} onChange={(event) => setCcv(event.target.value)} inputMode="numeric" className="text-center" />
                    </Field>
                  </div>
                </div>
              ) : null}

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={() => payMutation.mutate()}
                  disabled={payMutation.isPending}
                  className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-[15px] flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-green-600/20"
                >
                  {payMutation.isPending ? (
                    <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Processando...</>
                  ) : (
                    <><Lock className="h-4 w-4" aria-hidden="true" /> Assinar por {selectedPricing.submitLabel} <ChevronRight className="h-4 w-4" aria-hidden="true" /></>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  Pagamento 100% seguro e criptografado
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5">
                <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-gray-800">Garantia de 7 dias</p>
                  <p className="text-xs text-gray-500 mt-0.5">Nao gostou? Devolvemos 100% sem perguntas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2 md:sticky md:top-8">
          <OrderSummary catalog={catalog} plan={plan} setPlan={setPlan} />
        </div>
      </div>
    </div>
  )
}

export function CheckoutForm({
  user,
  catalog,
}: {
  user: { name: string; email: string }
  catalog: CheckoutPlanCatalog
}) {
  return (
    <GuestCheckoutForm
      catalog={catalog}
      prefilledUser={{
        id: 'authenticated-user',
        name: user.name,
        email: user.email,
      }}
    />
  )
}
