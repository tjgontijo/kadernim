'use client'

import { Suspense, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/shared/spinner'
import { InstallPWA } from '@/components/pwa/InstallPWA'
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="py-8 px-4 sm:px-6">
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/system/logo_transparent.png"
              alt="Kadernim Logo"
              width={130}
              height={87}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>

          <h1 className="mb-2 text-center text-xl font-semibold text-foreground">
            Acesse sua conta
          </h1>
          <p className="mb-6 text-center text-xs text-muted-foreground">
            Enviaremos um código de verificação para o seu email.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground"
              >
                Email
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  onBlur={(e) => {
                    setValue('email', e.target.value.trim(), { shouldValidate: true })
                  }}
                  className={`block w-full rounded-md border py-3 pl-10 text-foreground placeholder-muted-foreground focus:ring-2 sm:text-sm ${errors.email
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/50'
                    : 'border-input bg-background focus:border-primary focus:ring-ring'
                    }`}
                  placeholder="seu@email.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full cursor-pointer justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? <Spinner className="h-5 w-5 text-white" /> : 'Enviar código'}
            </button>
          </form>
          <InstallPWA />
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
