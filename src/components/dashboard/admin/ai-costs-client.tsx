'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Brain, RefreshCw, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type PlannerUsageResponse = {
  success: boolean
  data: {
    totals: {
      totalPlans: number
      totalInputTokens: number
      totalOutputTokens: number
      totalTokens: number
      totalCostUsd: number
      totalLatencyMs: number
      avgLatencyMs: number
      avgCostPerPlanUsd: number
      withUsageCount: number
    }
    byModel: Record<string, {
      calls: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      inputCostUsd: number
      outputCostUsd: number
      totalCostUsd: number
    }>
    byUser: Array<{
      userId: string
      name: string | null
      email: string | null
      calls: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      inputCostUsd: number
      outputCostUsd: number
      totalCostUsd: number
    }>
    daily: Array<{
      date: string
      calls: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      inputCostUsd: number
      outputCostUsd: number
      totalCostUsd: number
    }>
    logs: Array<{
      id: string
      title: string
      model: string
      createdAt: string
      user: { id: string; name: string | null; email: string | null }
      usage: {
        inputTokens: number
        outputTokens: number
        totalTokens: number
        inputCostUsd: number
        outputCostUsd: number
        totalCostUsd: number
        latencyMs: number
        attempts: number
      }
    }>
  }
}

function toUsd(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function AdminAiCostsClient() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-planner-ai-costs', period],
    queryFn: async () => {
      const response = await fetch(`/api/v1/admin/planner/usage?period=${period}`)
      const json = (await response.json()) as PlannerUsageResponse
      if (!response.ok || !json.success) {
        throw new Error('Erro ao carregar custos de IA')
      }
      return json.data
    },
  })

  const modelRows = useMemo(
    () => Object.entries(data?.byModel ?? {}).sort((a, b) => b[1].totalCostUsd - a[1].totalCostUsd),
    [data]
  )

  if (isLoading && !data) {
    return (
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-9 w-52" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-44 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="rounded-3 border border-line bg-paper-2 p-3 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-9 w-full rounded-2" />
                {Array.from({ length: 7 }).map((_, index) => (
                  <Skeleton key={index} className="h-11 w-full rounded-2" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] overflow-auto rounded-3 border border-line/60 p-3 space-y-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-2" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Custos de IA</h2>
          <p className="text-sm text-ink-mute">Monitoramento de geração de planos de aula no planner.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-line bg-card p-1">
            {(['7d', '30d', '90d'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  period === value ? 'bg-paper-2 text-ink' : 'text-ink-mute'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching || isLoading}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toUsd(data?.totals.totalCostUsd ?? 0)}</div>
            <p className="text-xs text-ink-mute">Apenas planos com métricas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.totals.totalTokens ?? 0).toLocaleString('pt-BR')}</div>
            <p className="text-xs text-ink-mute">
              in {(data?.totals.totalInputTokens ?? 0).toLocaleString('pt-BR')} · out {(data?.totals.totalOutputTokens ?? 0).toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Planos Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data?.totals.totalPlans ?? 0).toLocaleString('pt-BR')}</div>
            <p className="text-xs text-ink-mute">Com uso registrado: {(data?.totals.withUsageCount ?? 0).toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toUsd(data?.totals.avgCostPerPlanUsd ?? 0)}</div>
            <p className="text-xs text-ink-mute">Latência média: {data?.totals.avgLatencyMs ?? 0} ms</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4" />
              Por Modelo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modelRows.length === 0 && <p className="text-sm text-ink-mute">Sem dados no período.</p>}
              {modelRows.map(([model, values]) => (
                <div key={model} className="rounded-3 border border-line bg-paper-2 p-3">
                  <p className="text-sm font-semibold text-ink">{model}</p>
                  <p className="text-xs text-ink-mute">{values.calls} chamadas</p>
                      <p className="text-xs text-ink-mute">
                        in {values.inputTokens.toLocaleString('pt-BR')} · out {values.outputTokens.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-sm font-semibold text-ink mt-1">{toUsd(values.totalCostUsd)}</p>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Table2 className="h-4 w-4" />
              Últimas Gerações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-ink-mute">
                    <th className="py-2 pr-3">Plano</th>
                    <th className="py-2 pr-3">Modelo</th>
                    <th className="py-2 pr-3">Tokens in</th>
                    <th className="py-2 pr-3">Tokens out</th>
                    <th className="py-2 pr-3">Custo in</th>
                    <th className="py-2 pr-3">Custo out</th>
                    <th className="py-2 pr-3">Custo total</th>
                    <th className="py-2 pr-3">Latência</th>
                    <th className="py-2">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.logs ?? []).slice(0, 30).map((log) => (
                    <tr key={log.id} className="border-b border-dashed border-line align-top">
                      <td className="py-3 pr-3 max-w-[280px]">
                        <p className="font-medium text-ink line-clamp-2">{log.title}</p>
                        <p className="text-xs text-ink-mute">{log.user.email || log.user.name || 'Usuário'}</p>
                      </td>
                      <td className="py-3 pr-3 text-ink">{log.model}</td>
                      <td className="py-3 pr-3 text-ink">{log.usage.inputTokens.toLocaleString('pt-BR')}</td>
                      <td className="py-3 pr-3 text-ink">{log.usage.outputTokens.toLocaleString('pt-BR')}</td>
                      <td className="py-3 pr-3 text-ink">{toUsd(log.usage.inputCostUsd)}</td>
                      <td className="py-3 pr-3 text-ink">{toUsd(log.usage.outputCostUsd)}</td>
                      <td className="py-3 pr-3 font-semibold text-ink">{toUsd(log.usage.totalCostUsd)}</td>
                      <td className="py-3 pr-3 text-ink">{log.usage.latencyMs} ms</td>
                      <td className="py-3 text-ink-mute">
                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </td>
                    </tr>
                  ))}
                  {(data?.logs ?? []).length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-sm text-ink-mute">
                        Nenhuma geração encontrada para o período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consumo por Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-auto rounded-3 border border-line/60">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-line text-left text-xs uppercase tracking-[0.08em] text-ink-mute">
                  <th className="py-2 pr-3 pl-3">Usuário</th>
                  <th className="py-2 pr-3">Chamadas</th>
                  <th className="py-2 pr-3">Tokens in</th>
                  <th className="py-2 pr-3">Tokens out</th>
                  <th className="py-2 pr-3">Custo in</th>
                  <th className="py-2 pr-3">Custo out</th>
                  <th className="py-2 pr-3">Custo total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.byUser ?? []).map((user) => (
                  <tr key={user.userId} className="border-b border-dashed border-line">
                    <td className="py-3 pr-3 pl-3">
                      <p className="font-medium text-ink">{user.name || 'Sem nome'}</p>
                      <p className="text-xs text-ink-mute">{user.email || user.userId}</p>
                    </td>
                    <td className="py-3 pr-3 text-ink">{user.calls}</td>
                    <td className="py-3 pr-3 text-ink">{user.inputTokens.toLocaleString('pt-BR')}</td>
                    <td className="py-3 pr-3 text-ink">{user.outputTokens.toLocaleString('pt-BR')}</td>
                    <td className="py-3 pr-3 text-ink">{toUsd(user.inputCostUsd)}</td>
                    <td className="py-3 pr-3 text-ink">{toUsd(user.outputCostUsd)}</td>
                    <td className="py-3 pr-3 font-semibold text-ink">{toUsd(user.totalCostUsd)}</td>
                  </tr>
                ))}
                {(data?.byUser ?? []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-ink-mute">
                      Sem consumo por usuário no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
