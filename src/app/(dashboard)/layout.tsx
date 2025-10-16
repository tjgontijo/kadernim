import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { auth } from '@/lib/auth/auth'

// Desabilitar cache para rotas protegidas
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: {
    template: '%s | Kadernim',
    default: 'Dashboard | Kadernim',
  },
  description: 'Área protegida do Kadernim',
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar sessão (middleware já protege, mas mantém a verificação)
  await auth.api.getSession({ headers: await headers() })

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 pb-20 px-4 md:px-6 lg:px-8">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
