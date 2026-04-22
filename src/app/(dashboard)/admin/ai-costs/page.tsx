import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/server/auth/auth'
import { AdminAiCostsClient } from '@/components/dashboard/admin/ai-costs-client'

export const metadata = {
  title: 'Custos de IA | Admin',
  description: 'Monitoramento de custo e tokens do planner.',
}

export const dynamic = 'force-dynamic'

export default async function AdminAiCostsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== 'admin') {
    return redirect('/')
  }

  return <AdminAiCostsClient />
}
