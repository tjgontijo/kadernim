'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Clock, Edit3 } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/ui/spinner'
import { InstallPWA } from '@/components/pwa/InstallPWA'
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

      router.push('/resources')
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
    } catch (cause) {
      console.error('[otp] erro ao reenviar código', cause)
      toast.error('Erro ao reenviar código. Tente novamente mais tarde.')
    } finally {
      setResendStatus('idle')
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="py-8 px-4 sm:px-6">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/system/logo_transparent.png"
            alt="Kadernim Logo"
            width={150}
            height={100}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Enviamos um código de 6 dígitos para o e-mail: <strong>{form.email || 'seu email'}</strong>.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-muted-foreground"
            >
              Código de Acesso
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
              className="mt-1 block w-full rounded-md border border-input bg-background py-3 text-center text-2xl tracking-[0.4em] text-foreground focus:border-primary focus:ring-2 focus:ring-ring"
              placeholder="••••••"
              aria-label="Código OTP"
            />
          </div>

          <button
            type="submit"
            disabled={verifyStatus === 'verifying'}
            className="flex w-full cursor-pointer justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyStatus === 'verifying' ? <Spinner className="h-5 w-5 text-primary-foreground" /> : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 font-medium text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendStatus === 'sending' ? (
              <Spinner className="h-4 w-4 text-primary" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Reenviar código
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 font-medium text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <Edit3 className="h-4 w-4" />
            Informar outro email
          </button>
        </div>
        <InstallPWA />
      </div>
    </div>
  )
}

export default function OTPSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Suspense
        fallback={
          <div className="w-full max-w-md px-4">
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-indigo-500" />
              <span className="ml-2 text-sm text-indigo-600 dark:text-indigo-300">Carregando...</span>
            </div>
          </div>
        }
      >
        <OTPSentContent />
      </Suspense>
    </div>
  )
}
