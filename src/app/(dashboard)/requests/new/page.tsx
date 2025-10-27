import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { RequestFormPage } from '@/components/requests/request-form-page'

export const metadata = {
  title: 'Nova Solicitação | Kadernim',
}

export default async function NewRequestPage() {
  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/login/magic-link')
  }

  // Carregar dados da API (com cache)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL 
  const response = await fetch(`${baseUrl}/api/v1/requests/metadata`, {
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
