'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InstallPWA } from '@/components/pwa/InstallPWA'
import { Spinner } from '@/components/ui/spinner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<
    { type: 'success' | 'error'; message: string }
  | null>(null)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (feedback?.type === 'error') setFeedback(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Informe um email válido.' })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/v1/auth/sign-in/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, callbackURL: '/resources' })
      })

      const data = await response.json()

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Link enviado! Redirecionando...' })
        router.push(`/login/sent?email=${encodeURIComponent(email)}`)
      } else {
        setFeedback({ type: 'error', message: data.error || 'Erro ao enviar link de acesso' })
      }
    } catch (error) {
      console.error('Erro ao solicitar magic link:', error)
      setFeedback({ type: 'error', message: 'Falha na comunicação com o servidor' })
    } finally {
      setIsLoading(false)
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
          
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Acesse sua conta
          </h1>
          
          {feedback && (
            <Alert
              variant={feedback.type === 'error' ? 'destructive' : 'default'}
              className="mb-4"
            >
              {feedback.type === 'error' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <AlertTitle>
                {feedback.type === 'error'
                  ? 'Não foi possível enviar o link'
                  : 'Link enviado com sucesso'}
              </AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Seu Email
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
                  value={email}
                  onChange={handleEmailChange}
                  className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                  placeholder="seu@email.com"
                  aria-invalid={feedback?.type === 'error'}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Você receberá um link de acesso no email informado
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Spinner className="h-5 w-5 text-white" />
                ) : (
                  'Receber link de acesso'
                )}
              </button>
            </div>
          </form>

          <InstallPWA />
{/* 
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Cadastre-se
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
