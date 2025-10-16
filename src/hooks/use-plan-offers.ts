'use client'

import { useEffect, useMemo, useState } from 'react'
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

type PlanOffers = {
  plans: NormalizedPlan[]
  isLoading: boolean
  error: Error | null
  primaryPlan?: NormalizedPlan
  annualPlan?: NormalizedPlan
  entryPlan?: NormalizedPlan
}

export function usePlanOffers(): PlanOffers {
  const [plans, setPlans] = useState<NormalizedPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function fetchPlans() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/v1/plans', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data: PlanPublic[] = await response.json()
        if (!active) return

        const normalized = data.map(normalizePlan)
        setPlans(normalized)
        setError(null)
      } catch (err) {
        if (!active) return
        if ((err as Error).name === 'AbortError') return
        setError(err as Error)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchPlans()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const { primaryPlan, annualPlan, entryPlan } = useMemo(() => {
    if (!plans.length) return { primaryPlan: undefined, annualPlan: undefined, entryPlan: undefined }

    const sortedByPriceDesc = [...plans].sort((a, b) => b.price - a.price)
    const sortedByPriceAsc = [...plans].sort((a, b) => a.price - b.price)

    const annual = plans.find((plan) => plan.durationDays && plan.durationDays >= 360)
    const primary = annual ?? sortedByPriceDesc[0]
    const entry = sortedByPriceAsc[0]

    return { primaryPlan: primary, annualPlan: annual, entryPlan: entry }
  }, [plans])

  return {
    plans,
    isLoading,
    error,
    primaryPlan,
    annualPlan,
    entryPlan
  }
}
