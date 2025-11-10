'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Clock, Edit3 } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/ui/spinner'
import { InstallPWA } from '@/components/pwa/InstallPWA'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface VerifyState {
  email: string
  otp: string
}

type SubmissionState = 'idle' | 'verifying'

type ResendState = 'idle' | 'sending'

type StatusMessage = {
  type: 'success' | 'error'
  message: string
} | null

function OTPSentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<VerifyState>({ email: '', otp: '' })
  const [verifyStatus, setVerifyStatus] = useState<SubmissionState>('idle')
  const [resendStatus, setResendStatus] = useState<ResendState>('idle')
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null)

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
    if (statusMessage?.type === 'error') {
      setStatusMessage(null)
    }
  }

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.email || form.otp.length !== 6) {
      setStatusMessage({ type: 'error', message: 'Informe o código de 6 dígitos.' })
      return
    }

    setVerifyStatus('verifying')
    setStatusMessage(null)

    try {
      const { error } = await authClient.signIn.emailOtp({
        email: form.email,
        otp: form.otp,
      })

      if (error) {
        const message = error.message ?? 'Código inválido ou expirado.'
        setStatusMessage({ type: 'error', message })
        return
      }

      setStatusMessage({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' })
      router.push('/resources')
    } catch (cause) {
      console.error('[otp] erro ao verificar código', cause)
      setStatusMessage({ type: 'error', message: 'Falha ao verificar código. Tente novamente.' })
    } finally {
      setVerifyStatus('idle')
    }
  }

  const handleResend = async () => {
    if (!form.email) {
      setStatusMessage({ type: 'error', message: 'Email não encontrado. Volte e solicite um novo código.' })
      return
    }

    setResendStatus('sending')
    setStatusMessage(null)

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: 'sign-in',
      })

      if (error) {
        const message = error.message ?? 'Não foi possível reenviar o código.'
        setStatusMessage({ type: 'error', message })
        return
      }

      setStatusMessage({ type: 'success', message: 'Novo código enviado! Verifique seu email.' })
    } catch (cause) {
      console.error('[otp] erro ao reenviar código', cause)
      setStatusMessage({ type: 'error', message: 'Erro ao reenviar código. Tente novamente mais tarde.' })
    } finally {
      setResendStatus('idle')
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="py-8 px-4 sm:px-6">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-block cursor-pointer">
            <Image
              src="/images/system/logo_transparent.png"
              alt="Kadernim Logo"
              width={120}
              height={120}
              style={{ height: 'auto' }}
              priority
            />
          </Link>
        </div>

        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-indigo-500" />
          <h1 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Código enviado!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Enviamos um código de 6 dígitos para o e-mail: <strong>{form.email || 'seu email'}</strong>.
            Ele expira em 5 minutos.
          </p>
        </div>

        {statusMessage && (
          <Alert
            variant={statusMessage.type === 'error' ? 'destructive' : 'default'}
            className="mb-4"
          >
            {statusMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertTitle>
              {statusMessage.type === 'error'
                ? 'Falha ao processar código'
                : 'Tudo pronto!'}
            </AlertTitle>
            <AlertDescription>{statusMessage.message}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-3 text-center text-2xl tracking-[0.4em] text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              placeholder="••••••"
              aria-label="Código OTP"
            />
          </div>

          <button
            type="submit"
            disabled={verifyStatus === 'verifying'}
            className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyStatus === 'verifying' ? <Spinner className="h-5 w-5 text-white" /> : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-indigo-600 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
          >
            {resendStatus === 'sending' ? (
              <Spinner className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            Reenviar código
          </button>

          <button
            type="button"
            onClick={() => router.push('/login/otp')}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
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
