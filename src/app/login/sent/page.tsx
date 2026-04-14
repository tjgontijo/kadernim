'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock, Edit3 } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/shared/spinner'

import { toast } from 'sonner'

interface VerifyState {
  email: string
  otp: string
}

type SubmissionState = 'idle' | 'verifying'
type ResendState = 'idle' | 'sending'

function OTPSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<VerifyState>({ email: '', otp: '' })
  const [verifyStatus, setVerifyStatus] = useState<SubmissionState>('idle')
  const [resendStatus, setResendStatus] = useState<ResendState>('idle')
  const callbackURL = searchParams.get('callbackURL')
  const [countdown, setCountdown] = useState(60)

  // Referência para o input de OTP
  const otpInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setForm((prev) => ({ ...prev, email: emailParam }))
    }

    // Foca no input de OTP automaticamente após o componente ser montado
    setTimeout(() => {
      if (otpInputRef.current) {
        otpInputRef.current.focus()
      }
    }, 100) // Pequeno delay para garantir que o DOM esteja pronto
  }, [searchParams])

  // Countdown timer para o botão de reenviar
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newOtp = event.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setForm((prev) => ({ ...prev, otp: newOtp }))
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.email || form.otp.length !== 6) {
      toast.error('Informe o código de 6 dígitos.')
      return
    }

    setVerifyStatus('verifying')

    try {
      const { error } = await authClient.signIn.emailOtp({
        email: form.email,
        otp: form.otp,
      })

      if (error) {
        toast.error(error.message ?? 'Código inválido ou expirado.')
        return
      }

      router.push(callbackURL || '/resources')
    } catch (cause) {
      console.error('[otp] erro ao verificar código', cause)
      toast.error('Falha ao verificar código. Tente novamente.')
    } finally {
      setVerifyStatus('idle')
    }
  }

  const handleResend = async () => {
    if (!form.email) {
      toast.error('Email não encontrado. Volte e solicite um novo código.')
      return
    }

    setResendStatus('sending')

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: 'sign-in',
      })

      if (error) {
        toast.error(error.message ?? 'Não foi possível reenviar o código.')
        return
      }

      toast.success('Novo código enviado! Verifique seu email.')
      setCountdown(60) // Reinicia o contador
    } catch (cause) {
      console.error('[otp] erro ao reenviar código', cause)
      toast.error('Erro ao reenviar código. Tente novamente mais tarde.')
    } finally {
      setResendStatus('idle')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB] relative overflow-hidden">
      {/* Brand Glow Background */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-brand-1/10 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-brand-2/10 blur-3xl opacity-60"></div>

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl shadow-stone-200/50 p-8 sm:p-10">
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/images/logo_transparent_crop.png"
                alt="Kadernim"
                width={160}
                height={37}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>

        <div className="text-center">
          <h1 className="mb-2 text-2xl font-black text-stone-800 tracking-tight">Verifique seu e-mail</h1>
          <p className="text-sm font-medium text-stone-400">
            Enviamos um código de 6 dígitos para:<br />
            <strong className="text-stone-600 leading-relaxed break-all">{form.email || 'seu email'}</strong>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="otp"
              className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1"
            >
              Código de Verificação
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={form.otp}
              onChange={handleOtpChange}
              ref={otpInputRef}
              className="block w-full rounded-xl border border-stone-200 bg-stone-50/50 py-4 text-center text-3xl font-black tracking-[0.4em] text-stone-800 placeholder-stone-200 focus:border-brand-1 focus:ring-2 focus:ring-brand-1/20 transition-all"
              placeholder="000000"
              aria-label="Código de verificação"
            />
          </div>

          <button
            type="submit"
            disabled={verifyStatus === 'verifying'}
            className="flex w-full cursor-pointer justify-center rounded-xl bg-brand-1 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-brand-1/25 transition-all hover:bg-brand-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyStatus === 'verifying' ? <Spinner className="h-5 w-5 text-white" /> : 'Entrar na plataforma'}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending' || countdown > 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs font-bold text-stone-600 transition-all hover:bg-stone-50 hover:border-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendStatus === 'sending' ? (
              <Spinner className="h-4 w-4 text-brand-1" />
            ) : countdown > 0 ? (
              <span className="tabular-nums">Reenviar código em {countdown}s</span>
            ) : (
              <>
                <Clock className="h-4 w-4 text-brand-1" />
                Reenviar código agora
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Usar outro e-mail
          </button>
        </div>

        </div>
      </div>
    </div>
  )
}

export default function OTPSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCFB]">
      <Suspense
        fallback={
          <div className="w-full max-w-md px-4 text-center">
            <Spinner className="h-8 w-8 text-brand-1 mx-auto" />
          </div>
        }
      >
        <OTPSentContent />
      </Suspense>
    </div>
  )
}
