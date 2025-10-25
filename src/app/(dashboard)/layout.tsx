import type { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { PushNotificationSetup } from '@/components/pwa/PushNotificationSetup'
import { auth } from '@/lib/auth/auth'
import { Spinner } from '@/components/ui/spinner'

// Configuração otimizada para rotas protegidas
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache de 60 segundos para melhorar navegação

export const metadata: Metadata = {
  title: {
    template: '%s | Kadernim',
    default: 'Dashboard | Kadernim',
  },
  description: 'Área protegida do Kadernim',
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sessão (middleware já protege, mas mantém a verificação)
  await auth.api.getSession({ headers: await headers() })

  return (
    <>
      <PushNotificationSetup />
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 pb-20">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </>
  )
}
