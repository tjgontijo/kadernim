import { ReactNode } from 'react'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/services/auth/session-service'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DashboardHeader } from '@/components/dashboard/layout/header/DashboardHeader'
import { DashboardShell } from '@/components/dashboard/layout/DashboardShell'
import { AppSidebar } from '@/components/dashboard/layout/navigation/AppSidebar'
import { CheckoutAuthHandler } from '@/components/dashboard/checkout-auth-handler'

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
        <CheckoutAuthHandler />
        <div className="flex h-screen w-full overflow-hidden bg-paper">
          <AppSidebar user={user} />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
            <DashboardHeader user={user} />
            <DashboardShell>
              {children}
            </DashboardShell>
          </div>
        </div>
      </SidebarProvider>
    </ResourceProvider>
  )
}
