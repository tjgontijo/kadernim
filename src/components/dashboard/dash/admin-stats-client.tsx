'use client'

import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, TrendingUp, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/index'
import { DashboardStats } from '@/types/stats/dashboard-stats'

interface AdminStatsClientProps {
    initialStats: DashboardStats
}

export function AdminStatsClient({ initialStats }: AdminStatsClientProps) {
    const { data: stats, isLoading, refetch } = useQuery<DashboardStats>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await fetch('/api/v1/admin/stats')
            if (!response.ok) throw new Error('Failed to fetch stats')
            return response.json()
        },
        initialData: initialStats,
    })

    return (
        <>
            <div className="flex justify-end mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                >
                    <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                    Atualizar
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-surface-card border-line shadow-1 p-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute flex items-center gap-2">
                                <BookOpen className="size-3.5" />
                                Total de Recursos
                            </span>
                        </div>
                        <div>
                            <div className="font-display text-4xl font-medium tracking-tight text-ink">
                                {stats?.totalResources || 0}
                            </div>
                            <div className="text-[12px] font-semibold text-sage mt-2">
                                +{Math.floor((stats?.totalResources || 0) * 0.1)} este mês
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-surface-card border-line shadow-1 p-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute flex items-center gap-2">
                                <TrendingUp className="size-3.5" />
                                Gratuitos
                            </span>
                        </div>
                        <div>
                            <div className="font-display text-4xl font-medium tracking-tight text-ink">
                                {stats?.freeResources || 0}
                            </div>
                            <div className="text-[12px] font-semibold text-ink-mute mt-2">
                                {Math.round(((stats?.freeResources || 0) / (stats?.totalResources || 1)) * 100)}% do total
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-surface-card border-line shadow-1 p-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute flex items-center gap-2">
                                <BarChart3 className="size-3.5" />
                                Premium
                            </span>
                        </div>
                        <div>
                            <div className="font-display text-4xl font-medium tracking-tight text-ink">
                                {stats?.paidResources || 0}
                            </div>
                            <div className="text-[12px] font-semibold text-terracotta mt-2 italic font-hand text-lg leading-none">
                                Exclusivos Pro
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-surface-card border-line shadow-1 p-5">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute flex items-center gap-2">
                                <Users className="size-3.5" />
                                Usuários Ativos
                            </span>
                        </div>
                        <div>
                            <div className="font-display text-4xl font-medium tracking-tight text-ink">
                                {stats?.totalUsers || 0}
                            </div>
                            <div className="text-[12px] font-semibold text-sage mt-2">
                                +12% vs mês anterior
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}
