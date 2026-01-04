import { SystemHeader } from '@/components/client/layout/header/SystemHeader'
import { FooterSingle } from '@/components/client/layout/footer/footer-single'
import { getServerSession } from '@/services/auth/session-service'
import { redirect } from 'next/navigation'
import { DashboardClientLayout } from '@/components/client/layout/DashboardClientLayout'
import { MobileNav } from '@/components/client/layout/navigation/MobileNav'

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
      <main className="mx-auto w-full max-w-7xl flex-1 overflow-hidden px-4 py-4 pb-20 sm:pb-4 sm:px-4 lg:px-6">
        <DashboardClientLayout>
          {children}
        </DashboardClientLayout>
      </main>
      <div className="hidden sm:block">
        <FooterSingle />
      </div>
      <MobileNav />
    </div>
  )
}
