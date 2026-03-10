import { DashPageShell } from '@/components/dashboard/dash/dash-page-shell'
import { StatsService } from '@/services/stats/stats.service'
import { AdminStatsClient } from '@/components/dashboard/dash/admin-stats-client'

export const metadata = {
  title: 'Dashboard | Admin',
  description: 'Visão geral do desempenho e estatísticas do sistema.',
}

export default async function AdminDashboardPage() {
  const stats = await StatsService.getAdminSummary()

  return (
    <DashPageShell
      title="Dashboard"
      subtitle="Visão geral do desempenho e estatísticas do sistema."
    >
      <AdminStatsClient initialStats={stats} />
    </DashPageShell>
  )
}
