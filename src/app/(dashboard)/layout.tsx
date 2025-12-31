import { SystemHeader } from '@/components/dashboard/header/SystemHeader'
import { FooterSingle } from '@/components/dashboard/footer/footer-single'
import { getServerSession } from '@/server/auth/session'
import { redirect } from 'next/navigation'
import { DashboardClientLayout } from '@/components/dashboard/layout/DashboardClientLayout'

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
    <div className="flex min-h-screen flex-col bg-gray-50">
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
