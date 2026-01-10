import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getServerSession } from '@/services/auth/session-service'
import { UserRole } from '@/types/user-role'
import { isStaff } from '@/lib/auth/roles'

import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { HeaderActionsProvider } from '@/components/admin/header-actions'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminContent } from '@/components/admin/admin-content'
import { ResourceProvider } from '@/contexts/resource-context'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login')

  // Permite apenas admin, manager e editor na área administrativa
  if (!isStaff(session.user.role as any)) {
    redirect('/resources')
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
      <HeaderActionsProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-screen w-full bg-muted/10 overflow-hidden">
            <AdminSidebar user={user} />

            <SidebarInset className="flex flex-col min-h-0 h-full overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-y-auto">
                <AdminContent user={user}>
                  {children}
                </AdminContent>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </HeaderActionsProvider>
    </ResourceProvider>
  )
}
