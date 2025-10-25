'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiAlertCircle, FiLock } from 'react-icons/fi'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/auth-client'
import { Spinner } from '@/components/ui/spinner'
import { InstallPWA } from '@/components/pwa/InstallPWA'

interface RequestOtpForm {
  email: string
}

type SubmissionState = 'idle' | 'loading' | 'error'

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

    if (!form.email || !form.email.includes('@')) {
      setStatus('error')
      setErrorMessage('Informe um email válido.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: form.email,
        type: 'sign-in',
      })

      if (error) {
        const message = error.message ?? 'Não foi possível enviar o código. Tente novamente.'
        setStatus('error')
        setErrorMessage(message)
        toast.error(message)
        return
      }

      toast.success('Código enviado! Verifique seu email.')
      router.push(`/login/otp/sent?email=${encodeURIComponent(form.email)}`)
    } catch (cause) {
      console.error('[otp] erro ao solicitar OTP', cause)
      const message = 'Falha na comunicação com o servidor. Tente novamente.'
      setStatus('error')
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setStatus('idle')
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
            Entrar com código OTP
          </h1>
          <p className="mb-6 text-center text-sm text-gray-600 dark:text-gray-300">
            Enviaremos um código de 6 dígitos para o seu email. Informe-o para concluir o login.
          </p>

          {status === 'error' && errorMessage && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                <span className="ml-3 text-sm text-red-800 dark:text-red-200">{errorMessage}</span>
              </div>
            </div>
          )}

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
                  <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
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
              <p className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FiLock className="mr-1 h-4 w-4" />
                O código expira em 5 minutos.
              </p>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? <Spinner className="h-5 w-5 text-white" /> : 'Enviar código'}
            </button>
          </form>

          {/* <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Prefere receber um link de acesso?{' '}
            <Link
              href="/login/magic-link"
              className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Entrar com Magic Link
            </Link>
          </div> */}

          <InstallPWA />
        </div>
      </div>
    </div>
  )
}
