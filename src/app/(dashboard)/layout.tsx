import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
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
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar initialUser={session?.user ?? null} />
        <main className="flex-1 pb-20 md:pb-0 relative">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}
