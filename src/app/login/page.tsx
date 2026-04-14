'use client'

import { Suspense, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/shared/spinner'

import { toast } from 'sonner'

const otpSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('Informe um email válido.')
    .trim(),
})

type OtpData = z.infer<typeof otpSchema>

interface RequestOtpForm {
  email: string
}

type SubmissionState = 'idle' | 'loading' | 'error'

interface OtpClientTimingLog {
  event: 'otp_request_client'
  email: string
  timestamp: string
  outcome: 'success' | 'error'
  durations: {
    validationMs: number
    requestMs: number
    totalMs: number
  }
  error?: string
}

function RequestOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get('callbackURL') || ''
  const [status, setStatus] = useState<SubmissionState>('idle')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: OtpData) => {
    const start = performance.now()
    let afterValidation = start
    let afterRequest = start
    let outcome: OtpClientTimingLog['outcome'] = 'success'
    let errorCode: string | undefined

    const maskedEmail = data.email.replace(/(?<=.).(?=[^@]*?@)/g, '*')

    const emitLog = () => {
      const end = performance.now()
      const log: OtpClientTimingLog = {
        event: 'otp_request_client',
        email: maskedEmail,
        timestamp: new Date().toISOString(),
        outcome,
        durations: {
          validationMs: afterValidation - start,
          requestMs: afterRequest - afterValidation,
          totalMs: end - start,
        },
        error: errorCode,
      }

      console.info('[otp_client] timings', log)
    }

    console.info('[otp_client] submit_start', {
      email: maskedEmail,
      timestamp: new Date().toISOString(),
    })

    setStatus('loading')

    try {
      afterValidation = performance.now()
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: 'sign-in',
      })
      afterRequest = performance.now()

      if (error) {
        const rawCode = (error.code ?? error.message ?? 'otp_send_error') as string
        const normalized = rawCode.toLowerCase()

        let message = 'Não foi possível enviar o código. Tente novamente.'

        if (normalized.includes('user_not_found') || normalized === 'otp_send_error') {
          message = 'Não encontramos nenhuma conta com esse e-mail.'
        } else if (normalized.includes('email_not_delivered')) {
          message = 'Não conseguimos entregar o e-mail agora. Tente novamente em alguns minutos.'
        } else if (normalized.includes('otp_delivery_failed')) {
          message = 'Tivemos um problema ao enviar o código. Tente novamente.'
        }

        toast.error(message)
        outcome = 'error'
        errorCode = rawCode
        return
      }

      const nextUrl = `/login/sent?email=${encodeURIComponent(data.email)}${callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : ''}`
      router.push(nextUrl)
    } catch (cause) {
      console.error('[otp] erro ao solicitar OTP', cause)
      const message = 'Falha na comunicação com o servidor. Tente novamente.'
      toast.error(message)
      outcome = 'error'
      errorCode = cause instanceof Error ? cause.name ?? 'request_failed' : 'request_failed'
    } finally {
      if (afterRequest === start) {
        afterRequest = performance.now()
      }
      emitLog()
      if (outcome !== 'success') setStatus('idle')
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

          <h1 className="mb-2 text-center text-2xl font-black text-stone-800 tracking-tight">
            Acesse sua conta
          </h1>
          <p className="mb-8 text-center text-sm font-medium text-stone-400">
            Enviaremos um código de verificação para o seu e-mail.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5 ml-1"
              >
                E-mail de acesso
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-stone-300" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  onBlur={(e) => {
                    setValue('email', e.target.value.trim(), { shouldValidate: true })
                  }}
                  className={`block w-full rounded-xl border-stone-200 py-3.5 pl-11 text-stone-700 placeholder-stone-300 focus:ring-2 focus:ring-brand-1 focus:border-brand-1 sm:text-sm transition-all shadow-sm ${errors.email
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : 'bg-stone-50/30'
                    }`}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 ml-1 text-xs font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative flex w-full cursor-pointer justify-center rounded-xl bg-brand-1 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-brand-1/25 transition-all hover:bg-brand-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Spinner className="h-5 w-5 text-white" />
              ) : (
                <div className="flex items-center gap-2">
                  Enviar código de acesso
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-stone-400 font-medium">
            Não tem uma conta?{' '}
            <Link href="/plans" className="text-brand-1 font-bold hover:underline">
              Ver planos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RequestOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    }>
      <RequestOtpContent />
    </Suspense>
  )
}
