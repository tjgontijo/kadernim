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
    <div className="flex min-h-screen items-center justify-center bg-paper relative overflow-hidden paper-grain">
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-surface-card rounded-r-5 border border-line shadow-3 p-8 sm:p-10 relative">
          {/* Subtle notebook lines decoration */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[repeating-linear-gradient(transparent,transparent_31px,var(--line)_31px,var(--line)_32px)]" />
          
          <div className="mb-10 flex justify-center relative">
            <Link href="/">
              <div className="flex items-center gap-3">
                <div className="relative size-[40px] rounded-[12px] bg-ink text-paper flex items-center justify-center font-display font-semibold text-xl after:absolute after:-top-[4px] after:-right-[4px] after:size-2.5 after:rounded-full after:bg-mustard">
                  K
                </div>
                <div className="text-left">
                  <div className="font-display font-semibold text-2xl tracking-tight leading-none text-ink">Kadernim</div>
                  <div className="font-hand text-base text-terracotta leading-none mt-0.5">da Professora</div>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center relative">
            <h1 className="mb-2 text-display-m font-medium text-ink tracking-tight">Verifique seu e-mail</h1>
            <p className="text-body-s text-ink-mute">
              Enviamos um código de 6 dígitos para:<br />
              <strong className="text-ink font-bold leading-relaxed break-all">{form.email || 'seu email'}</strong>
            </p>
          </div>

          <form className="mt-8 space-y-6 relative" onSubmit={handleVerify}>
            <div>
              <label
                htmlFor="otp"
                className="block text-caption mb-2 ml-1"
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
                className="block w-full rounded-r-3 border border-line bg-surface-card py-4 text-center text-4xl font-display font-black tracking-[0.3em] text-ink placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta-2 transition-all shadow-sm"
                placeholder="000000"
                aria-label="Código de verificação"
              />
            </div>

            <button
              type="submit"
              disabled={verifyStatus === 'verifying'}
              className="flex w-full cursor-pointer justify-center rounded-full bg-terracotta px-4 py-4 text-base font-semibold text-paper shadow-1 shadow-[0_1px_0_var(--terracotta-2)] transition-all hover:bg-terracotta-2 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifyStatus === 'verifying' ? <Spinner className="h-5 w-5 text-paper" /> : 'Entrar na plataforma'}
            </button>
          </form>

          <div className="mt-8 space-y-3 relative">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'sending' || countdown > 0}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line bg-surface-card px-4 py-3 text-xs font-bold text-ink-soft transition-all hover:bg-paper-2 hover:border-line-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendStatus === 'sending' ? (
                <Spinner className="h-4 w-4 text-terracotta" />
              ) : countdown > 0 ? (
                <span className="tabular-nums">Reenviar código em {countdown}s</span>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-terracotta" />
                  Reenviar código agora
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink-faint hover:text-terracotta transition-colors"
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
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <Suspense
        fallback={
          <div className="w-full max-w-md px-4 text-center">
            <Spinner className="h-8 w-8 text-terracotta mx-auto" />
          </div>
        }
      >
        <OTPSentContent />
      </Suspense>
    </div>
  )
}
