import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/services/auth/session-service'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardHeader } from '@/components/dashboard/layout/header/DashboardHeader'
import { DashboardShell } from '@/components/dashboard/layout/DashboardShell'
import { AppSidebar } from '@/components/dashboard/layout/navigation/AppSidebar'

import { ResourceProvider } from '@/hooks/resources/use-resource-context'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    role: session.user.role ?? null,
  }

  return (
    <ResourceProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full flex-col overflow-hidden bg-sidebar">
          {/* Topbar Full Width - Padrão Whatrack */}
          <DashboardHeader user={user} />

          {/* Dashboard Frame (Sidebar + Content) */}
          <DashboardShell sidebar={<AppSidebar user={user} />}>
            {children}
          </DashboardShell>
        </div>
      </SidebarProvider>
    </ResourceProvider>
  )
}
