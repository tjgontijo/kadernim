import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { PushNotificationSetup } from '@/components/pwa/PushNotificationSetup'
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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Middleware já valida a sessão e bloqueia rotas não autenticadas
  // Layout fica estático para não re-renderizar Header/BottomNav entre rotas

  return (
    <>
      <PushNotificationSetup />
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 pb-20 native-scroll">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </>
  )
}
