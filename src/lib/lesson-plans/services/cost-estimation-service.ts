export type UsageTokens = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export type ModelPricing = {
  inputPer1MUsd: number
  outputPer1MUsd: number
}

const DEFAULT_MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4o-mini': { inputPer1MUsd: 0.15, outputPer1MUsd: 0.6 },
  'gpt-4o': { inputPer1MUsd: 2.5, outputPer1MUsd: 10 },
}

function envPrice(model: string, field: 'input' | 'output') {
  const normalized = model.toUpperCase().replace(/[^A-Z0-9]/g, '_')
  const key = field === 'input'
    ? `LLM_PRICE_${normalized}_INPUT_PER_1M_USD`
    : `LLM_PRICE_${normalized}_OUTPUT_PER_1M_USD`

  const raw = process.env[key]
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function getModelPricing(model: string): ModelPricing {
  const fallback = DEFAULT_MODEL_PRICING[model] ?? DEFAULT_MODEL_PRICING['gpt-4o-mini']

  return {
    inputPer1MUsd: envPrice(model, 'input') ?? fallback.inputPer1MUsd,
    outputPer1MUsd: envPrice(model, 'output') ?? fallback.outputPer1MUsd,
  }
}

export function estimateCostUsd(model: string, usage: UsageTokens) {
  const pricing = getModelPricing(model)
  const inputCostUsd = (usage.inputTokens / 1_000_000) * pricing.inputPer1MUsd
  const outputCostUsd = (usage.outputTokens / 1_000_000) * pricing.outputPer1MUsd

  return {
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd,
    pricing,
  }
}

export function extractUsageTokens(raw: unknown): UsageTokens {
  const usage = (raw ?? {}) as Record<string, unknown>
  const nestedRaw = (usage.raw ?? {}) as Record<string, unknown>

  const inputTokens = Number(
    usage.inputTokens
    ?? usage.promptTokens
    ?? usage.prompt_tokens
    ?? nestedRaw.input_tokens
    ?? 0
  )

  const outputTokens = Number(
    usage.outputTokens
    ?? usage.completionTokens
    ?? usage.completion_tokens
    ?? nestedRaw.output_tokens
    ?? 0
  )

  const explicitTotal = Number(
    usage.totalTokens
    ?? usage.total_tokens
    ?? nestedRaw.total_tokens
    ?? 0
  )

  const safeInput = Number.isFinite(inputTokens) && inputTokens > 0 ? Math.round(inputTokens) : 0
  const safeOutput = Number.isFinite(outputTokens) && outputTokens > 0 ? Math.round(outputTokens) : 0
  const fallbackTotal = safeInput + safeOutput

  const safeTotal = Number.isFinite(explicitTotal) && explicitTotal > 0
    ? Math.round(explicitTotal)
    : fallbackTotal

  return {
    inputTokens: safeInput,
    outputTokens: safeOutput,
    totalTokens: safeTotal,
  }
}
