'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import type { PlanPublic } from '@/lib/schemas/plan'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2
})

type NormalizedPlan = PlanPublic & {
  priceFormatted: string
  monthlyFormatted?: string
  durationLabel?: string
}

function normalizePlan(plan: PlanPublic): NormalizedPlan {
  const durationLabel = getDurationLabel(plan.durationDays)
  const monthly = plan.priceMonthly ?? deriveMonthly(plan.price, plan.durationDays)
  return {
    ...plan,
    priceFormatted: currencyFormatter.format(plan.price),
    monthlyFormatted: monthly ? currencyFormatter.format(monthly) : undefined,
    durationLabel
  }
}

function deriveMonthly(price: number, durationDays?: number | null) {
  if (!durationDays) return null
  const months = durationDays / 30
  if (!Number.isFinite(months) || months <= 0) return null
  return price / months
}

function getDurationLabel(durationDays?: number | null) {
  if (!durationDays) return undefined
  if (durationDays % 30 !== 0) {
    const months = Math.round(durationDays / 30)
    return `${months} mês${months > 1 ? 'es' : ''}`
  }
  const months = durationDays / 30
  if (months >= 12) {
    const years = months / 12
    if (Number.isInteger(years)) {
      return `${years} ano${years > 1 ? 's' : ''}`
    }
  }
  return `${months} mês${months > 1 ? 'es' : ''}`
}

const fetcher = async (url: string): Promise<PlanPublic[]> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return response.json()
}

type PlanOffers = {
  plans: NormalizedPlan[]
  isLoading: boolean
  error: Error | undefined
  primaryPlan?: NormalizedPlan
  annualPlan?: NormalizedPlan
  entryPlan?: NormalizedPlan
}

export function usePlanOffers(): PlanOffers {
  const { data, error, isLoading } = useSWR('/api/v1/plans', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 5, // 5 minutos
  })

  const normalizedPlans = useMemo(() => (data ? data.map(normalizePlan) : []), [data])

  const { primaryPlan, annualPlan, entryPlan } = useMemo(() => {
    if (!normalizedPlans.length) return { primaryPlan: undefined, annualPlan: undefined, entryPlan: undefined }

    const sortedByPriceDesc = [...normalizedPlans].sort((a, b) => b.price - a.price)
    const sortedByPriceAsc = [...normalizedPlans].sort((a, b) => a.price - b.price)

    const annual = normalizedPlans.find((plan) => plan.durationDays && plan.durationDays >= 360)
    const primary = annual ?? sortedByPriceDesc[0]
    const entry = sortedByPriceAsc[0]

    return { primaryPlan: primary, annualPlan: annual, entryPlan: entry }
  }, [normalizedPlans])

  return {
    plans: normalizedPlans,
    isLoading,
    error,
    primaryPlan,
    annualPlan,
    entryPlan,
  }
}
