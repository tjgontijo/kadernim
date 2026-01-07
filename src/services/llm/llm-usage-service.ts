import { prisma } from '@/lib/db';

export interface LogLlmUsageParams {
    userId?: string;
    feature: string;
    operation: string;
    model: string;
    provider?: string;
    inputTokens?: number;  // Opcional se passar rawUsage
    outputTokens?: number; // Opcional se passar rawUsage
    latencyMs?: number;
    status: 'success' | 'error' | 'timeout';
    errorMessage?: string;
    metadata?: Record<string, any>;
    rawUsage?: any;        // Objeto de usage vindo do SDK
}

/**
 * PRICING por modelo (USD por 1M tokens)
 * Atualizado em: Janeiro 2026
 */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
    // Adicionar outros modelos conforme necessário
};

/**
 * Extrai tokens de forma resiliente de diferentes formatos de objeto usage
 */
function extractTokens(params: LogLlmUsageParams) {
    const usage = params.rawUsage || {};

    // Prioridade 1: Valores passados explicitamente
    let input = params.inputTokens;
    let output = params.outputTokens;

    // Prioridade 2: Nomes comuns no SDK da Vercel (novos e antigos)
    if (input === undefined || input === 0) {
        input = usage.inputTokens ?? usage.promptTokens ?? usage.prompt_tokens ?? (usage.raw?.input_tokens) ?? 0;
    }
    if (output === undefined || output === 0) {
        output = usage.outputTokens ?? usage.completionTokens ?? usage.completion_tokens ?? (usage.raw?.output_tokens) ?? 0;
    }

    return { input, output };
}

/**
 * Calcula custo baseado no modelo e tokens
 */
function calculateCost(model: string, inputTokens: number, outputTokens: number) {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o-mini']; // Fallback

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    const totalCost = inputCost + outputCost;

    return { inputCost, outputCost, totalCost };
}

/**
 * Loga uso de LLM de forma centralizada
 *
 * IMPORTANTE: Chamar APÓS sucesso da operação (para ter tokens exatos)
 */
export async function logLlmUsage(params: LogLlmUsageParams) {
    try {
        const extracted = extractTokens(params);
        const inputTokens = extracted.input as number;
        const outputTokens = extracted.output as number;

        const { inputCost, outputCost, totalCost } = calculateCost(
            params.model,
            inputTokens,
            outputTokens
        );

        const totalTokens = inputTokens + outputTokens;

        await prisma.llmUsageLog.create({
            data: {
                userId: params.userId,
                feature: params.feature,
                operation: params.operation,
                model: params.model,
                provider: params.provider || 'openai',
                inputTokens,
                outputTokens,
                totalTokens,
                inputCost,
                outputCost,
                totalCost,
                latencyMs: params.latencyMs,
                status: params.status,
                errorMessage: params.errorMessage,
                metadata: {
                    ...(params.metadata || {}),
                    // Debug se continuar vindo zerado
                    ...(totalTokens === 0 && params.rawUsage ? {
                        debug_usage_keys: Object.keys(params.rawUsage),
                        debug_usage_raw: params.rawUsage
                    } : {})
                },
            },
        });

        // Debug no terminal se tokens forem encontrados
        if (totalTokens > 0) {
            console.log(`[LLM Usage] ${params.feature} | ${params.model} | IN: ${inputTokens} | OUT: ${outputTokens} | $${totalCost.toFixed(4)}`);
        } else if (params.rawUsage) {
            console.log('[LLM DEBUG] Falha ao extrair tokens do objeto:', JSON.stringify(params.rawUsage, null, 2));
        }
    } catch (error) {
        // NUNCA quebrar operação por falha no log
        console.error('[LLM Usage Service] Erro ao logar:', error);
    }
}

/**
 * Busca uso agregado por período
 */
export async function getLlmUsageByPeriod(params: {
    startDate: Date;
    endDate: Date;
    feature?: string;
    userId?: string;
}) {
    const { startDate, endDate, feature, userId } = params;

    const logs = await prisma.llmUsageLog.findMany({
        where: {
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
            ...(feature && { feature }),
            ...(userId && { userId }),
        },
        select: {
            feature: true,
            model: true,
            totalTokens: true,
            totalCost: true,
            status: true,
            createdAt: true,
        },
    });

    // Agregar por feature
    const byFeature = logs.reduce((acc, log) => {
        const key = log.feature;
        if (!acc[key]) {
            acc[key] = { totalCalls: 0, totalTokens: 0, totalCost: 0, inputTokens: 0, outputTokens: 0 };
        }
        acc[key].totalCalls++;
        acc[key].totalTokens += log.totalTokens;
        acc[key].totalCost += log.totalCost;
        acc[key].inputTokens += (log as any).inputTokens || 0;
        acc[key].outputTokens += (log as any).outputTokens || 0;
        return acc;
    }, {} as Record<string, { totalCalls: number; totalTokens: number; totalCost: number; inputTokens: number; outputTokens: number }>);

    // Agregar por modelo
    const byModel = logs.reduce((acc, log) => {
        const key = log.model;
        if (!acc[key]) {
            acc[key] = { totalCalls: 0, totalTokens: 0, totalCost: 0, inputTokens: 0, outputTokens: 0 };
        }
        acc[key].totalCalls++;
        acc[key].totalTokens += log.totalTokens;
        acc[key].totalCost += log.totalCost;
        acc[key].inputTokens += (log as any).inputTokens || 0;
        acc[key].outputTokens += (log as any).outputTokens || 0;
        return acc;
    }, {} as Record<string, { totalCalls: number; totalTokens: number; totalCost: number; inputTokens: number; outputTokens: number }>);

    // Totais gerais
    const totals = logs.reduce(
        (acc, log) => {
            acc.totalCalls++;
            acc.totalTokens += log.totalTokens;
            acc.totalCost += log.totalCost;
            acc.inputTokens += (log as any).inputTokens || 0;
            acc.outputTokens += (log as any).outputTokens || 0;
            if (log.status === 'success') acc.successCalls++;
            if (log.status === 'error') acc.errorCalls++;
            return acc;
        },
        { totalCalls: 0, successCalls: 0, errorCalls: 0, totalTokens: 0, totalCost: 0, inputTokens: 0, outputTokens: 0 }
    );

    return {
        totals,
        byFeature,
        byModel,
    };
}

/**
 * Busca uso diário (últimos N dias)
 */
export async function getDailyUsage(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.llmUsageLog.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: startDate,
            },
        },
        _sum: {
            totalTokens: true,
            totalCost: true,
            inputTokens: true,
            outputTokens: true,
        },
        _count: {
            id: true,
        },
    });

    // Formatar para série temporal
    return logs.map((log) => ({
        date: log.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
        calls: log._count.id,
        tokens: log._sum.totalTokens || 0,
        cost: log._sum.totalCost || 0,
        inputTokens: (log._sum as any).inputTokens || 0,
        outputTokens: (log._sum as any).outputTokens || 0,
    }));
}

/**
 * Verifica se atingiu threshold de alerta
 */
export async function checkCostAlerts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsage = await getLlmUsageByPeriod({
        startDate: today,
        endDate: new Date(),
    });

    const dailyCost = todayUsage.totals.totalCost;

    // Alertas
    if (dailyCost > 50) {
        return { level: 'critical', cost: dailyCost, message: `Custo diário crítico: $${dailyCost.toFixed(2)}` };
    }
    if (dailyCost > 10) {
        return { level: 'warning', cost: dailyCost, message: `Custo diário alto: $${dailyCost.toFixed(2)}` };
    }

    return null; // Sem alertas
}
