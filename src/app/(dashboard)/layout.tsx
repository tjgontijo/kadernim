import type { Metadata } from 'next'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { FloatingToggleButton } from '@/components/layout/FloatingToggleButton'

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
          <FloatingToggleButton />
          <div className="container mx-auto px-4 py-4">
            {children}
          </div>
        </main>
        <div className="fixed bottom-4 left-4 z-50 md:hidden">
          <SidebarTrigger className="bg-primary text-primary-foreground shadow-lg rounded-full h-12 w-12 flex items-center justify-center cursor-pointer" />
        </div>
      </div>
    </SidebarProvider>
  )
}
