import { SystemHeader } from '@/components/client/header/SystemHeader'
import { FooterSingle } from '@/components/client/footer/footer-single'
import { getServerSession } from '@/services/auth/session-service'
import { redirect } from 'next/navigation'
import { DashboardClientLayout } from '@/components/client/layout/DashboardClientLayout'

export const dynamic = 'force-dynamic'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login/otp')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SystemHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 overflow-hidden px-4 py-4 sm:px-4 lg:px-6">
        <DashboardClientLayout>
          {children}
        </DashboardClientLayout>
      </main>
      <FooterSingle />
    </div>
  )
}
