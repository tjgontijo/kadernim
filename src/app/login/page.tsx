'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'
import { authClient } from '@/lib/auth/auth-client'
import { toast } from 'sonner'
import { InstallPWA } from '@/components/pwa/InstallPWA'

function SignInForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const registered = searchParams?.get('registered')
  const email = searchParams?.get('email')

  const [formData, setFormData] = useState({
    email: email || '',
    password: '',
  })
  const [errorState, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(registered === 'true')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    await authClient.signIn.email({
      email: formData.email,
      password: formData.password
      // Removido callbackURL para evitar conflito de redirecionamento
    }, {
      onRequest: () => {
        setIsLoading(true)
      },
      onSuccess: async () => {
        toast.success("Login realizado com sucesso")
        try {
          await authClient.getSession()
        } catch (error) {
          console.error('Não foi possível atualizar a sessão após o login:', error)
        }
        router.replace('/resources')
      },
      onError: () => {
        setIsLoading(false)
        toast.error("Erro ao fazer login. Verifique suas credenciais")
      }
    })
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="py-8 px-4 sm:px-6">
        <div className="mb-4 flex justify-center">
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
        
        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Conta criada com sucesso! Faça login para continuar.
                </p>
              </div>
            </div>
          </div>
        )}

        {errorState && (
          <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{errorState}</p>
              </div>
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
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <div className="relative mt-1 rounded-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FiLock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                placeholder="********"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a
                href="https://api.whatsapp.com/send?phone=551148635262&text=Ol%C3%A1%2C%20esqueci%20minha%20senha%20do%20Kadernim.%20Preciso%20de%20ajuda%20para%20recuper%C3%A1-la."
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Esqueceu sua senha?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>

        <InstallPWA />

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
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center">Carregando...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
