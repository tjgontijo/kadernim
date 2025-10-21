'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FiCheckCircle } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function MagicLinkSentContent() {
  const searchParams = useSearchParams()
  const phone = searchParams?.get('phone') || 'seu WhatsApp'
  
  return (
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
        
        <div className="mb-6 flex justify-center">
          <FiCheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Link enviado!
        </h1>
        
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          Enviamos um link de acesso para {phone}.
          <br />
          Verifique seu WhatsApp e clique no link para entrar.
        </p>
        
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/30">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            O link é válido por 20 minutos. Se não receber, verifique se o número está correto.
          </p>
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
