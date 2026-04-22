import { prisma } from '@/lib/db'

type Period = '7d' | '30d' | '90d'

type UsageMeta = {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  inputCostUsd?: number
  outputCostUsd?: number
  totalCostUsd?: number
  latencyMs?: number
  attempts?: number
}

type GenerationMeta = {
  model?: string
  usage?: UsageMeta
  generatedAt?: string
}

export type PlannerUsageLog = {
  id: string
  title: string
  model: string
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
  usage: Required<UsageMeta>
}

function periodStart(period: Period) {
  const now = new Date()
  const start = new Date(now)
  if (period === '7d') start.setDate(now.getDate() - 7)
  else if (period === '90d') start.setDate(now.getDate() - 90)
  else start.setDate(now.getDate() - 30)
  return start
}

function toSafeUsage(meta: GenerationMeta | null | undefined): Required<UsageMeta> {
  const usage = meta?.usage ?? {}

  return {
    inputTokens: Number(usage.inputTokens ?? 0),
    outputTokens: Number(usage.outputTokens ?? 0),
    totalTokens: Number(usage.totalTokens ?? 0),
    inputCostUsd: Number(usage.inputCostUsd ?? 0),
    outputCostUsd: Number(usage.outputCostUsd ?? 0),
    totalCostUsd: Number(usage.totalCostUsd ?? 0),
    latencyMs: Number(usage.latencyMs ?? 0),
    attempts: Number(usage.attempts ?? 1),
  }
}

export async function getPlannerUsageReport(period: Period) {
  const start = periodStart(period)

  const plans = await prisma.lessonPlan.findMany({
    where: {
      createdAt: { gte: start },
      status: { in: ['GENERATED', 'ARCHIVED'] },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
      generationMeta: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  const logs: PlannerUsageLog[] = plans.map((plan) => {
    const generationMeta = (plan.generationMeta ?? {}) as GenerationMeta
    return {
      id: plan.id,
      title: plan.title,
      model: generationMeta.model ?? 'unknown',
      createdAt: plan.createdAt.toISOString(),
      user: plan.user,
      usage: toSafeUsage(generationMeta),
    }
  })

  const totals = logs.reduce(
    (acc, log) => {
      acc.totalPlans += 1
      acc.totalInputTokens += log.usage.inputTokens
      acc.totalOutputTokens += log.usage.outputTokens
      acc.totalTokens += log.usage.totalTokens
      acc.totalCostUsd += log.usage.totalCostUsd
      acc.totalLatencyMs += log.usage.latencyMs
      return acc
    },
    {
      totalPlans: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      totalLatencyMs: 0,
    }
  )

  const byModel = logs.reduce<Record<string, {
    calls: number
    inputTokens: number
    outputTokens: number
    totalTokens: number
    inputCostUsd: number
    outputCostUsd: number
    totalCostUsd: number
  }>>((acc, log) => {
    const key = log.model
    if (!acc[key]) {
      acc[key] = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCostUsd: 0,
        outputCostUsd: 0,
        totalCostUsd: 0,
      }
    }

    acc[key].calls += 1
    acc[key].inputTokens += log.usage.inputTokens
    acc[key].outputTokens += log.usage.outputTokens
    acc[key].totalTokens += log.usage.totalTokens
    acc[key].inputCostUsd += log.usage.inputCostUsd
    acc[key].outputCostUsd += log.usage.outputCostUsd
    acc[key].totalCostUsd += log.usage.totalCostUsd
    return acc
  }, {})

  const byUser = logs.reduce<Record<string, {
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
  }>>((acc, log) => {
    const key = log.user.id
    if (!acc[key]) {
      acc[key] = {
        userId: log.user.id,
        name: log.user.name,
        email: log.user.email,
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCostUsd: 0,
        outputCostUsd: 0,
        totalCostUsd: 0,
      }
    }
    acc[key].calls += 1
    acc[key].inputTokens += log.usage.inputTokens
    acc[key].outputTokens += log.usage.outputTokens
    acc[key].totalTokens += log.usage.totalTokens
    acc[key].inputCostUsd += log.usage.inputCostUsd
    acc[key].outputCostUsd += log.usage.outputCostUsd
    acc[key].totalCostUsd += log.usage.totalCostUsd
    return acc
  }, {})

  const daily = logs.reduce<Record<string, {
    calls: number
    inputTokens: number
    outputTokens: number
    totalTokens: number
    inputCostUsd: number
    outputCostUsd: number
    totalCostUsd: number
  }>>((acc, log) => {
    const date = log.createdAt.split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCostUsd: 0,
        outputCostUsd: 0,
        totalCostUsd: 0,
      }
    }
    acc[date].calls += 1
    acc[date].inputTokens += log.usage.inputTokens
    acc[date].outputTokens += log.usage.outputTokens
    acc[date].totalTokens += log.usage.totalTokens
    acc[date].inputCostUsd += log.usage.inputCostUsd
    acc[date].outputCostUsd += log.usage.outputCostUsd
    acc[date].totalCostUsd += log.usage.totalCostUsd
    return acc
  }, {})

  return {
    totals: {
      ...totals,
      avgLatencyMs: totals.totalPlans > 0 ? Math.round(totals.totalLatencyMs / totals.totalPlans) : 0,
      avgCostPerPlanUsd: totals.totalPlans > 0 ? totals.totalCostUsd / totals.totalPlans : 0,
      withUsageCount: logs.filter((log) => log.usage.totalTokens > 0 || log.usage.totalCostUsd > 0).length,
    },
    byModel,
    byUser: Object.values(byUser).sort((a, b) => b.totalCostUsd - a.totalCostUsd),
    daily: Object.entries(daily)
      .map(([date, values]) => ({ date, ...values }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    logs,
  }
}
