'use client'

import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'

import { DashPageShell } from '@/components/admin/dash/dash-page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/index'

interface DashboardStats {
  totalResources: number
  totalUsers: number
  totalAccessGrants: number
  freeResources: number
  paidResources: number
}

function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await fetch('/api/v1/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
  })
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, refetch } = useDashboardStats()

  return (
    <DashPageShell
      title="Dashboard"
      subtitle="Visão geral do desempenho e estatísticas do sistema."
      actions={(
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Atualizar
        </Button>
      )}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Recursos
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : stats?.totalResources || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recursos cadastrados</p>
          </CardContent>
        </Card>

        {/* Free Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Recursos Gratuitos
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : stats?.freeResources || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Disponíveis gratuitamente</p>
          </CardContent>
        </Card>

        {/* Paid Resources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Recursos Premium
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : stats?.paidResources || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Apenas para assinantes</p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Usuários Ativos
              <Users className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Com acesso à plataforma</p>
          </CardContent>
        </Card>
      </div>
    </DashPageShell>
  )
}
