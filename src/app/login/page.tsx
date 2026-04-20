'use client'

import { Suspense, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="flex min-h-screen items-center justify-center bg-paper relative overflow-hidden paper-grain">
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="bg-white rounded-r-5 border border-line shadow-3 p-8 pl-12 sm:p-10 sm:pl-14 relative overflow-visible">
          {/* Notebook spiral rings */}
          <div className="pointer-events-none absolute inset-y-7 -left-[11px] z-20 flex flex-col justify-between">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="block h-[14px] w-[14px] rounded-full border border-[#c6bdb3] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(36,30,24,0.15)]"
              />
            ))}
          </div>

          {/* Notebook spine */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[28px] border-r border-[#e2dacf] bg-[linear-gradient(to_right,#f5f1ea,#fdfbf7)]" />
          
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

          <h1 className="mb-2 text-center text-display-m font-medium text-ink tracking-tight relative">
            Acesse sua conta
          </h1>
          <p className="mb-8 text-center text-body-s text-ink-mute relative">
            Enviaremos um código de verificação para o seu e-mail.
          </p>

          <form className="space-y-6 relative" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-caption mb-2 ml-1"
              >
                E-mail de acesso
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-ink-faint" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  onBlur={(e) => {
                    setValue('email', e.target.value.trim(), { shouldValidate: true })
                  }}
                  className={`block w-full rounded-r-3 border-line py-3.5 pl-11 text-ink placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta-2 sm:text-sm transition-all shadow-sm ${errors.email
                    ? 'border-destructive focus:ring-destructive/20 focus:border-destructive'
                    : 'bg-paper-2'
                    }`}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-2 ml-1 text-xs font-semibold text-berry">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="group relative flex w-full cursor-pointer justify-center items-center gap-2 rounded-3 bg-terracotta px-4 py-4 text-base font-semibold text-paper shadow-1 shadow-[0_1px_0_var(--terracotta-2)] transition-all hover:bg-terracotta-2 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? (
                <Spinner className="h-5 w-5 text-paper" />
              ) : (
                <>
                  Enviar código de acesso
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-body-s relative">
            Não tem uma conta?{' '}
            <Link href="/plans" className="text-terracotta font-bold hover:underline">
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
