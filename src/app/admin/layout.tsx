import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { getServerSession } from '@/server/auth/session'
import { UserRole } from '@/types/user-role'

import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { HeaderActionsProvider } from '@/components/admin/header-actions'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminContent } from '@/components/admin/admin-content'
import { ResourceProvider } from '@/contexts/resource-context'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect('/login/otp')

  // Verifica se o usuário é admin
  if (session.user.role !== UserRole.admin) {
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
        <SidebarProvider>
          <div className="flex h-screen w-full bg-background overflow-hidden">
            <AdminSidebar user={user} />

            <SidebarInset className="flex flex-col h-full min-w-0">
              <AdminHeader />

              <main className="flex-1 min-h-0 bg-muted/5">
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
