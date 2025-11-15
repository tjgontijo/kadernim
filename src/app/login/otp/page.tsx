'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/ui/spinner'
import { InstallPWA } from '@/components/pwa/InstallPWA'
import { toast } from 'sonner'

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

export default function RequestOtpPage() {
  const router = useRouter()
  const [form, setForm] = useState<RequestOtpForm>({ email: '' })
  const [status, setStatus] = useState<SubmissionState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({ email: event.target.value })
    if (errorMessage) setErrorMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const start = performance.now()
    let afterValidation = start
    let afterRequest = start
    let outcome: OtpClientTimingLog['outcome'] = 'success'
    let errorCode: string | undefined

    const maskedEmail = form.email.replace(/(?<=.).(?=[^@]*?@)/g, '*')

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

    if (!form.email || !form.email.includes('@')) {
      afterValidation = performance.now()
      outcome = 'error'
      errorCode = 'invalid_email'
      setStatus('error')
      setErrorMessage('Informe um email válido.')
      emitLog()
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      afterValidation = performance.now()
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
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

        setStatus('error')
        setErrorMessage(message)
        toast.error(message)
        outcome = 'error'
        errorCode = rawCode
        return
      }

      router.push(`/login/otp/sent?email=${encodeURIComponent(form.email)}`)
    } catch (cause) {
      console.error('[otp] erro ao solicitar OTP', cause)
      const message = 'Falha na comunicação com o servidor. Tente novamente.'
      setStatus('error')
      setErrorMessage(message)
      toast.error(message)
      outcome = 'error'
      errorCode = cause instanceof Error ? cause.name ?? 'request_failed' : 'request_failed'
    } finally {
      if (afterRequest === start) {
        afterRequest = performance.now()
      }
      emitLog()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full max-w-md px-4">
        <div className="py-8 px-4 sm:px-6">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="inline-block cursor-pointer">
              <Image
                src="/images/system/logo_transparent.png"
                alt="Kadernim Logo"
                width={150}
                height={150}
                style={{ height: 'auto' }}
                priority
              />
            </Link>
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Acesse sua conta
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Informe seu email para receber um código de verificação.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleEmailChange}
                  className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                  placeholder="seu@email.com"
                  aria-invalid={status === 'error'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
