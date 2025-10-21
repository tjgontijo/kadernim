'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiPhone, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'sonner'
import { applyWhatsAppMask, validateWhatsApp } from '@/lib/masks/whatsapp'
import { InstallPWA } from '@/components/pwa/InstallPWA'

export default function LoginPage() {
  const router = useRouter()
  const [whatsapp, setWhatsapp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(applyWhatsAppMask(e.target.value))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    const whatsappClean = whatsapp.replace(/\D/g, '')
    if (!validateWhatsApp(whatsappClean)) {
      setError('WhatsApp inválido. Digite um número com DDD.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/auth/whatsapp-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ whatsapp: whatsappClean })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Link de acesso enviado para seu WhatsApp!')
        router.push(`/login/sent?phone=${encodeURIComponent(whatsapp)}`)
      } else {
        setError(data.error || 'Erro ao enviar link de acesso')
        toast.error(data.error || 'Erro ao enviar link de acesso')
      }
    } catch (error) {
      console.error('Erro ao solicitar magic link:', error)
      setError('Falha na comunicação com o servidor')
      toast.error('Falha na comunicação com o servidor')
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
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Seu WhatsApp
              </label>
              <div className="relative mt-1 rounded-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiPhone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  className="block w-full rounded-md border border-gray-300 bg-white py-3 pl-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm"
                  placeholder="(11) 98888-8888"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Você receberá um link de acesso no WhatsApp informado
              </p>
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
