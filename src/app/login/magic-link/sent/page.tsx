'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Clock, Mail, MessageCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MagicLinkSentContent() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email') || 'seu email'
  
  return (
    <div className="w-full max-w-md px-4">
      <div className="py-4 px-4 sm:px-6">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="inline-block cursor-pointer">
            <Image 
              src="/images/system/logo_transparent.png" 
              alt="Kadernim Logo" 
              width={80} 
              height={80} 
              style={{ height: 'auto' }}
              priority
            />
          </Link>
        </div>
        
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Link de acesso enviado!
        </h1>
        
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          Enviamos um link de acesso para <strong>{email}</strong>.
        </p>
        
        {/* Email Section */}
        <div className="mb-4 rounded-md bg-indigo-50 p-4 dark:bg-indigo-900/30">
          <div className="flex items-start">
            <Mail className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="font-medium text-indigo-900 dark:text-indigo-200">Email enviado</p>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                Verifique sua caixa de entrada (e spam) para o link de acesso. Não se esqueça de marcar como &quot;Não Spam&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Section */}
        <div className="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
          <div className="flex items-start">
            <MessageCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-200">WhatsApp enviado</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Se você tiver WhatsApp cadastrado, receberá o link por lá também.
              </p>
            </div>
          </div>
        </div>

        {/* Expiration Info */}
        <div className="mb-6 rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/30">
          <div className="flex items-start">
            <Clock className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">Link válido por 20 minutos</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Clique no link assim que receber para acessar sua conta.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Voltar para a página de login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MagicLinkSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <span className="ml-2">Carregando...</span>
        </div>
      }>
        <MagicLinkSentContent />
      </Suspense>
    </div>
  )
}
