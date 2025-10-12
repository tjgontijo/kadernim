'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiUser, FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { authClient } from '@/lib/auth/auth-client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { applyWhatsAppMask, normalizeWhatsApp, validateWhatsApp } from '@/lib/masks/whatsapp'

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'Email é obrigatório').email('Formato de email inválido'),
  whatsapp: z
    .string()
    .optional()
    .refine(
      (val) => !val || validateWhatsApp(val),
      'WhatsApp inválido. Use o formato: 55 (DDD) 8888-8888'
    ),
  password: z
    .string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [whatsappValue, setWhatsappValue] = useState('')

  const { 
    register, 
    handleSubmit,
    setValue,
    formState: { errors } 
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setSubmitError('')

    try {
      const { name, email, password, whatsapp } = data
      
      // Normalizar WhatsApp (remover máscara e nono dígito)
      const normalizedWhatsApp = whatsapp ? normalizeWhatsApp(whatsapp) : undefined
      
      // Criar conta com Better Auth
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: '/resources'
      }, {
        onSuccess: async () => {
          // Se whatsapp foi fornecido, fazer login automático e atualizar
          if (normalizedWhatsApp) {
            try {
              // Fazer login para obter sessão
              await authClient.signIn.email({
                email,
                password
              })

              // Atualizar WhatsApp via API
              const response = await fetch('/api/user/update-whatsapp', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ whatsapp: normalizedWhatsApp }),
              })

              if (!response.ok) {
                console.error('Erro ao salvar WhatsApp')
              }

              // Fazer logout após atualização
              await authClient.signOut()
            } catch (error) {
              console.error('Erro ao processar WhatsApp:', error)
            }
          }

          // Redirecionar para login
          router.push('/login?registered=true')
        },
        onError: (ctx) => {
          throw new Error(ctx.error.message || 'Erro ao criar conta')
        }
      })
      
      if (signUpError) {
        throw new Error(signUpError.message || 'Erro ao criar conta')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mt-8 px-3 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="transform bg-white px-4 py-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800 sm:rounded-lg sm:px-10">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="inline-block cursor-pointer">
              <Image 
                src="/images/system/logo_transparent.png" 
                alt="Kadernim Logo" 
                width={150} 
                height={150} 
                style={{ height: 'auto' }}
                className="transition-opacity hover:opacity-90"
                priority
              />
            </Link>
          </div>
          
          {submitError && (
            <div className="animate-fadeIn mb-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300"
              >
                Nome
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiUser className="h-5 w-5 text-gray-400 transition-colors duration-200 dark:text-gray-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`block w-full rounded-md border-2 ${errors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'} bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm`}
                  placeholder="Seu nome completo"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300"
              >
                Email
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiMail className="h-5 w-5 text-gray-400 transition-colors duration-200 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full rounded-md border-2 ${errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'} bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm`}
                  placeholder="seu@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300"
              >
                WhatsApp <span className="text-xs text-gray-500">(opcional)</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 gap-2">
                  <span className="text-lg">🇧🇷</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">+55</span>
                </div>
                <input
                  id="whatsapp"
                  type="tel"
                  autoComplete="tel"
                  value={whatsappValue}
                  onChange={(e) => {
                    const masked = applyWhatsAppMask(e.target.value)
                    setWhatsappValue(masked)
                    // Atualizar o valor do form com apenas números
                    const numbers = masked.replace(/\D/g, '')
                    setValue('whatsapp', numbers, { shouldValidate: true })
                  }}
                  className={`block w-full rounded-md border-2 ${errors.whatsapp ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'} bg-white py-3 pl-20 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm`}
                  placeholder="(11) 98888-8888"
                />
              </div>
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.whatsapp.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300"
              >
                Senha
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400 transition-colors duration-200 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full rounded-md border-2 ${errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'} bg-white py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm`}
                  placeholder="********"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-opacity hover:opacity-80"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-300"
              >
                Confirmar Senha
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400 transition-colors duration-200 dark:text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full rounded-md border-2 ${errors.confirmPassword ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-500'} bg-white py-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm`}
                  placeholder="********"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-opacity hover:opacity-80"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-5 w-5 cursor-pointer text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Criar Conta'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="cursor-pointer font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}