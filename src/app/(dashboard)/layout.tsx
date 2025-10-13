import type { Metadata } from 'next'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

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

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 pb-20 md:pb-0 relative">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}
