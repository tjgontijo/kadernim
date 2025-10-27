import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { RequestFormPage } from '@/components/requests/request-form-page'
import { getEducationLevels, getSubjects, getResourceRequestById } from '@/lib/requests/queries'

interface EditRequestPageProps {
  params: Promise<{
    id: string
  }>
}

export const metadata = {
  title: 'Editar Solicitação | Kadernim',
}

export default async function EditRequestPage({ params }: EditRequestPageProps) {
  const { id } = await params

  // Verificar autenticação
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/login/magic-link')
  }

  // Carregar dados
  const [educationLevels, subjects, request] = await Promise.all([
    getEducationLevels(),
    getSubjects(),
    getResourceRequestById(id, session.user.id),
  ])

  // Verificar se a solicitação existe e se o usuário é o criador
  if (!request) {
    redirect('/requests')
  }

  if (request.userId !== session.user.id) {
    redirect('/requests')
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div>Carregando...</div>}>
          <RequestFormPage
            educationLevels={educationLevels}
            subjects={subjects}
            editingRequest={request}
          />
        </Suspense>
      </div>
    </div>
  )
}
