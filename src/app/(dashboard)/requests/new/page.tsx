import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { RequestFormPage } from '@/components/requests/request-form-page'

const requestsEnvConfig = (() => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL não configurada.')
  }

  return { baseUrl } as const
})()

export const metadata = {
  title: 'Nova Solicitação | Kadernim',
}

export default async function NewRequestPage() {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/')
  }

  // Carregar dados da API (com cache)
  const response = await fetch(`${requestsEnvConfig.baseUrl}/api/v1/requests/metadata`, {
    next: { revalidate: 3600 }, // Cache por 1 hora
  })
  
  if (!response.ok) {
    throw new Error('Erro ao carregar dados')
  }
  
  const { educationLevels, subjects } = await response.json()

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div>Carregando...</div>}>
          <RequestFormPage
            educationLevels={educationLevels}
            subjects={subjects}
          />
        </Suspense>
      </div>
    </div>
  )
}
