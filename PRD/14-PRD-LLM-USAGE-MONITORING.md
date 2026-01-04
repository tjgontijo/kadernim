# PRD 14: Sistema Centralizado de Monitoramento e Auditoria de LLM

## 1. Visão Geral

### 1.1 O que é?
Sistema centralizado para **monitorar, auditar e controlar** todos os gastos com modelos de linguagem (LLM) no Kadernim. Inclui logging automático, dashboard admin, alertas de custo e analytics de uso.

### 1.2 Por que fazer?
- **Controle de custos**: LLMs têm custo variável por token - sem monitoramento, gastos podem explodir
- **Auditoria**: Rastrear quem usou, quando, quanto custou e para qual feature
- **Otimização**: Identificar prompts caros, usuários abusivos, features problemáticas
- **Previsibilidade**: Projetar custos mensais com base em uso real
- **Compliance**: Log completo para debug, suporte e questões legais

### 1.3 Escopo
**Features cobertas atualmente:**
- ✅ Geração de planos de aula (lesson plans)
- ✅ Refinamento de temas (lesson plans)

**Features futuras que usarão LLM:**
- 🔮 Chat com IA (assistente pedagógico)
- 🔮 Resumo de recursos educacionais
- 🔮 Correção de atividades
- 🔮 Sugestões de aulas
- 🔮 Tradução de conteúdo

---

## 2. Regras de Negócio

### 2.1 Logging Obrigatório
- **TODA** chamada de LLM deve ser logada (sem exceções)
- Log deve ser **atômico** com a operação (mesma transação se possível)
- Falha no log **não deve** bloquear a operação (log assíncrono em caso de erro)

### 2.2 Retenção de Dados
| Dado | Período de Retenção |
|------|---------------------|
| Logs completos (ultimos 90 dias) | 90 dias |
| Agregados diários | 2 anos |
| Agregados mensais | Permanente |

### 2.3 Acesso
- **Admins**: Acesso total ao dashboard
- **Usuários**: Não veem custos (privacidade)
- **Sistema**: API interna para logging (não exposta publicamente)

### 2.4 Alertas
| Tipo | Condição | Ação |
|------|----------|------|
| **Alerta Amarelo** | Custo diário > $10 | Email para admin |
| **Alerta Vermelho** | Custo diário > $50 | Email + notificação no dashboard |
| **Alerta Crítico** | Custo mensal > $500 | Email urgente + considerar pausar features |

---

## 3. Modelo de Dados

### 3.1 Schema Prisma

```prisma
// prisma/schema.prisma

/// Log de uso de LLM (todas as chamadas)
model LlmUsageLog {
  id String @id @default(cuid())

  // Contexto da chamada
  userId        String?  // Opcional: se chamada é anônima/sistema
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  feature       String   // "lesson-plan-generation", "theme-refinement", "chat", etc
  operation     String   // Descrição da operação (ex: "Gerar plano de aula EF 3º ano Matemática")

  // Modelo e tokens
  model         String   // "gpt-4o-mini", "gpt-4o", "gpt-4-turbo", etc
  provider      String   @default("openai") // "openai", "anthropic", etc

  inputTokens   Int      // Tokens do prompt
  outputTokens  Int      // Tokens da resposta
  totalTokens   Int      // Total (input + output)

  // Custo calculado (em USD)
  inputCost     Float    // Custo do input (baseado no pricing do modelo)
  outputCost    Float    // Custo do output
  totalCost     Float    // Custo total em USD

  // Métricas de performance
  latencyMs     Int?     // Tempo de resposta em ms

  // Status
  status        String   // "success", "error", "timeout"
  errorMessage  String?  // Se status = error

  // Metadata adicional (JSON flexível)
  metadata      Json?    // { planId, theme, skillsCount, etc }

  // Timestamps
  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([feature])
  @@index([createdAt])
  @@index([status])
  @@map("llm_usage_log")
}

/// Agregados diários (pré-calculados para performance)
model LlmUsageDaily {
  id String @id @default(cuid())

  date          DateTime @db.Date // Data (sem hora)
  feature       String           // "lesson-plan-generation", etc
  model         String           // "gpt-4o-mini", etc

  // Agregados
  totalCalls    Int              // Total de chamadas
  successCalls  Int              // Chamadas bem-sucedidas
  errorCalls    Int              // Chamadas com erro

  totalTokens   BigInt           // Total de tokens
  totalCost     Float            // Custo total em USD

  avgLatencyMs  Float?           // Latência média

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([date, feature, model])
  @@index([date])
  @@index([feature])
  @@map("llm_usage_daily")
}
```

### 3.2 Relações
```
User (1) ──< (N) LlmUsageLog
```

---

## 4. Service Layer

### 4.1 LLM Usage Service

```typescript
// src/services/llm/llm-usage-service.ts

import { prisma } from '@/lib/db';

export interface LogLlmUsageParams {
  userId?: string;
  feature: string;
  operation: string;
  model: string;
  provider?: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs?: number;
  status: 'success' | 'error' | 'timeout';
  errorMessage?: string;
  metadata?: Record<string, any>;
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
    const { inputCost, outputCost, totalCost } = calculateCost(
      params.model,
      params.inputTokens,
      params.outputTokens
    );

    const totalTokens = params.inputTokens + params.outputTokens;

    await prisma.llmUsageLog.create({
      data: {
        userId: params.userId,
        feature: params.feature,
        operation: params.operation,
        model: params.model,
        provider: params.provider || 'openai',
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        totalTokens,
        inputCost,
        outputCost,
        totalCost,
        latencyMs: params.latencyMs,
        status: params.status,
        errorMessage: params.errorMessage,
        metadata: params.metadata || {},
      },
    });

    // Log para facilitar debug
    console.log(`[LLM Usage] ${params.feature} | ${params.model} | ${totalTokens} tokens | $${totalCost.toFixed(4)}`);
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
      acc[key] = { totalCalls: 0, totalTokens: 0, totalCost: 0 };
    }
    acc[key].totalCalls++;
    acc[key].totalTokens += log.totalTokens;
    acc[key].totalCost += log.totalCost;
    return acc;
  }, {} as Record<string, { totalCalls: number; totalTokens: number; totalCost: number }>);

  // Agregar por modelo
  const byModel = logs.reduce((acc, log) => {
    const key = log.model;
    if (!acc[key]) {
      acc[key] = { totalCalls: 0, totalTokens: 0, totalCost: 0 };
    }
    acc[key].totalCalls++;
    acc[key].totalTokens += log.totalTokens;
    acc[key].totalCost += log.totalCost;
    return acc;
  }, {} as Record<string, { totalCalls: number; totalTokens: number; totalCost: number }>);

  // Totais gerais
  const totals = logs.reduce(
    (acc, log) => {
      acc.totalCalls++;
      acc.totalTokens += log.totalTokens;
      acc.totalCost += log.totalCost;
      if (log.status === 'success') acc.successCalls++;
      if (log.status === 'error') acc.errorCalls++;
      return acc;
    },
    { totalCalls: 0, successCalls: 0, errorCalls: 0, totalTokens: 0, totalCost: 0 }
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
```

---

## 5. API Endpoints

### 5.1 Admin - Dashboard de Uso

```typescript
// src/app/api/admin/llm-usage/route.ts

GET /api/admin/llm-usage?period=30d&feature=lesson-plan-generation

Query params:
- period: "7d" | "30d" | "90d" | "12m" (padrão: 30d)
- feature: string (opcional) - filtrar por feature
- userId: string (opcional) - filtrar por usuário

Response: {
  success: true,
  data: {
    totals: {
      totalCalls: 1234,
      successCalls: 1200,
      errorCalls: 34,
      totalTokens: 3456789,
      totalCost: 5.67 // USD
    },
    byFeature: {
      "lesson-plan-generation": {
        totalCalls: 800,
        totalTokens: 2400000,
        totalCost: 3.24
      },
      "theme-refinement": {
        totalCalls: 434,
        totalTokens: 868000,
        totalCost: 1.43
      }
    },
    byModel: {
      "gpt-4o-mini": {
        totalCalls: 1234,
        totalTokens: 3456789,
        totalCost: 5.67
      }
    },
    daily: [
      { date: "2026-01-15", calls: 45, tokens: 135000, cost: 0.20 },
      { date: "2026-01-16", calls: 52, tokens: 156000, cost: 0.23 },
      ...
    ],
    alerts: {
      level: "warning", // "ok" | "warning" | "critical"
      cost: 12.34,
      message: "Custo diário alto: $12.34"
    }
  }
}
```

### 5.2 Admin - Logs Detalhados

```typescript
// src/app/api/admin/llm-usage/logs/route.ts

GET /api/admin/llm-usage/logs?page=1&limit=50&feature=lesson-plan-generation

Query params:
- page: number (padrão: 1)
- limit: number (padrão: 50, max: 100)
- feature: string (opcional)
- userId: string (opcional)
- status: "success" | "error" | "timeout" (opcional)
- startDate: ISO string (opcional)
- endDate: ISO string (opcional)

Response: {
  success: true,
  data: {
    logs: [
      {
        id: "cuid",
        userId: "user123",
        user: { name: "Maria Silva", email: "maria@escola.com" },
        feature: "lesson-plan-generation",
        operation: "Gerar plano EF 3º ano Matemática - Frações",
        model: "gpt-4o-mini",
        inputTokens: 1234,
        outputTokens: 2345,
        totalTokens: 3579,
        totalCost: 0.00162,
        latencyMs: 2340,
        status: "success",
        createdAt: "2026-01-15T14:23:45Z"
      },
      ...
    ],
    pagination: {
      page: 1,
      limit: 50,
      total: 1234,
      totalPages: 25
    }
  }
}
```

---

## 6. UI/UX - Dashboard Admin

### 6.1 Layout da Página

```
/admin/llm-usage

┌────────────────────────────────────────────────────────────┐
│  ← Admin              Monitoramento de IA                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📊 RESUMO GERAL (Últimos 30 dias)                         │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  1.234       │  │  3.456.789   │  │  $5.67       │     │
│  │  Chamadas    │  │  Tokens      │  │  Custo Total │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  97.2%       │  │  2.1s        │  │  ⚠️ Alerta   │     │
│  │  Taxa Sucesso│  │  Latência    │  │  Custo Alto  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📈 CUSTO DIÁRIO                                           │
│                                                            │
│  [Gráfico de linha mostrando custo por dia]               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🎯 POR FEATURE                                            │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Geração de Planos de Aula                         │   │
│  │  800 chamadas · 2.4M tokens · $3.24                │   │
│  │  ████████████████████░░░░░░  65%                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Refinamento de Temas                              │   │
│  │  434 chamadas · 868K tokens · $1.43                │   │
│  │  ████████░░░░░░░░░░░░░░░░░░  35%                   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📋 LOGS RECENTES                                          │
│                                                            │
│  [Filtros: Feature, Status, Data]                         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 15/01 14:23 · maria@escola.com                     │   │
│  │ Plano EF 3º Matemática · 3.5K tokens · $0.00162   │   │
│  │ ✅ 2.3s                                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 15/01 14:20 · joao@escola.com                      │   │
│  │ Refinar tema "frações" · 1.2K tokens · $0.00054   │   │
│  │ ✅ 1.1s                                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  [Ver todos os logs →]                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.2 Componentes

```typescript
// src/app/admin/llm-usage/page.tsx

'use client';

import { StatsCard } from '@/components/admin/stats-card';
import { LineChart } from '@/components/admin/charts/line-chart';
import { ProgressBar } from '@/components/admin/progress-bar';
import { LogsTable } from '@/components/admin/llm-usage/logs-table';
import { useLlmUsage } from '@/hooks/use-llm-usage';

export default function LlmUsagePage() {
  const { data, isLoading } = useLlmUsage({ period: '30d' });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-8">
      {/* Alertas */}
      {data.alerts?.level !== 'ok' && (
        <Alert variant={data.alerts.level === 'critical' ? 'destructive' : 'warning'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Alerta de Custo</AlertTitle>
          <AlertDescription>{data.alerts.message}</AlertDescription>
        </Alert>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total de Chamadas"
          value={data.totals.totalCalls.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="Tokens Usados"
          value={data.totals.totalTokens.toLocaleString()}
          icon={Database}
        />
        <StatsCard
          title="Custo Total"
          value={`$${data.totals.totalCost.toFixed(2)}`}
          icon={DollarSign}
          variant={data.alerts?.level === 'critical' ? 'destructive' : 'default'}
        />
      </div>

      {/* Gráfico de custo diário */}
      <Card>
        <CardHeader>
          <CardTitle>Custo Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={data.daily}
            xKey="date"
            yKey="cost"
            valueFormatter={(value) => `$${value.toFixed(2)}`}
          />
        </CardContent>
      </Card>

      {/* Breakdown por feature */}
      <Card>
        <CardHeader>
          <CardTitle>Uso por Feature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(data.byFeature).map(([feature, stats]) => (
            <div key={feature}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{formatFeatureName(feature)}</span>
                <span className="text-muted-foreground">
                  ${stats.totalCost.toFixed(2)}
                </span>
              </div>
              <ProgressBar
                value={(stats.totalCost / data.totals.totalCost) * 100}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalCalls} chamadas · {(stats.totalTokens / 1000).toFixed(1)}K tokens
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabela de logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <LogsTable />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7. Integração com Features Existentes

### 7.1 Lesson Plans - Geração

```typescript
// src/services/lesson-plans/generate-content.ts

import { logLlmUsage } from '@/services/llm/llm-usage-service';

export async function generateLessonPlanContent(params: GenerateLessonPlanParams) {
  const startTime = Date.now();

  try {
    const { object, usage } = await generateObject({
      model: openai('gpt-4o-mini'),
      // ... resto do código
    });

    // ✅ LOG DE SUCESSO
    await logLlmUsage({
      userId: params.userId, // Adicionar userId nos params
      feature: 'lesson-plan-generation',
      operation: `Gerar plano ${params.educationLevelSlug} - ${params.title}`,
      model: 'gpt-4o-mini',
      provider: 'openai',
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: {
        educationLevel: params.educationLevelSlug,
        grade: params.gradeSlug,
        subject: params.subjectSlug,
        numberOfClasses: params.numberOfClasses,
        skillsCount: params.bnccSkills.length,
      },
    });

    return object;
  } catch (error) {
    // ✅ LOG DE ERRO
    await logLlmUsage({
      userId: params.userId,
      feature: 'lesson-plan-generation',
      operation: `Gerar plano ${params.educationLevelSlug} - ${params.title}`,
      model: 'gpt-4o-mini',
      provider: 'openai',
      inputTokens: 0, // Não sabemos
      outputTokens: 0,
      latencyMs: Date.now() - startTime,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
```

### 7.2 Lesson Plans - Refinamento de Tema

```typescript
// src/app/api/v1/lesson-plans/refine-theme/route.ts

import { logLlmUsage } from '@/services/llm/llm-usage-service';

export async function POST(request: Request) {
  const session = await auth.api.getSession({...});
  const startTime = Date.now();

  try {
    const { object, usage } = await generateObject({
      model: openai('gpt-4o-mini'),
      // ... resto
    });

    // ✅ LOG
    await logLlmUsage({
      userId: session?.user?.id,
      feature: 'theme-refinement',
      operation: `Refinar tema: "${validated.rawTheme}"`,
      model: 'gpt-4o-mini',
      inputTokens: usage.promptTokens,
      outputTokens: usage.completionTokens,
      latencyMs: Date.now() - startTime,
      status: 'success',
      metadata: {
        rawTheme: validated.rawTheme,
        educationLevel: validated.educationLevelSlug,
        seed: validated.seed,
      },
    });

    return NextResponse.json({...});
  } catch (error) {
    // ✅ LOG DE ERRO
    await logLlmUsage({
      userId: session?.user?.id,
      feature: 'theme-refinement',
      operation: `Refinar tema: "${validated.rawTheme}"`,
      model: 'gpt-4o-mini',
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startTime,
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
```

---

## 8. Alertas e Notificações

### 8.1 Sistema de Alertas

```typescript
// src/services/llm/alert-service.ts

import { checkCostAlerts } from './llm-usage-service';
import { sendEmail } from '@/services/email';

/**
 * Verifica alertas e envia notificações
 * Executar via cron job diário (ex: Vercel Cron)
 */
export async function checkAndNotifyAlerts() {
  const alert = await checkCostAlerts();

  if (!alert) return; // Sem alertas

  // Buscar admins
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { email: true, name: true },
  });

  // Enviar emails
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: `[${alert.level.toUpperCase()}] Alerta de Custo de IA - Kadernim`,
      html: `
        <h2>Alerta de Custo de IA</h2>
        <p><strong>Nível:</strong> ${alert.level === 'critical' ? '🔴 CRÍTICO' : '⚠️ AVISO'}</p>
        <p><strong>Custo do dia:</strong> $${alert.cost.toFixed(2)}</p>
        <p><strong>Mensagem:</strong> ${alert.message}</p>
        <p><a href="https://app.kadernim.com/admin/llm-usage">Ver dashboard completo</a></p>
      `,
    });
  }

  console.log(`[Alert Service] Enviados ${admins.length} emails de alerta ${alert.level}`);
}
```

### 8.2 Cron Job (Vercel)

```json
// vercel.json

{
  "crons": [
    {
      "path": "/api/cron/check-llm-alerts",
      "schedule": "0 23 * * *"
    }
  ]
}
```

```typescript
// src/app/api/cron/check-llm-alerts/route.ts

import { checkAndNotifyAlerts } from '@/services/llm/alert-service';

export async function GET(request: Request) {
  // Verificar token de autenticação do Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await checkAndNotifyAlerts();

  return Response.json({ success: true });
}
```

---

## 9. Métricas de Sucesso

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **100% das chamadas logadas** | 100% | Comparar count de LessonPlan criados vs LlmUsageLog |
| **Custo mensal previsível** | Variação < 20% mês a mês | Comparar custo real vs projetado |
| **Tempo de resposta do log** | < 100ms | Medir latency do logLlmUsage() |
| **Zero falhas por falta de log** | 0 falhas | Logs não devem bloquear operações |
| **Alertas funcionais** | 100% entregues | Verificar emails enviados |

---

## 10. Roadmap de Implementação

### Fase 1: Core (2-3 dias)
- [ ] Criar schema Prisma (LlmUsageLog, LlmUsageDaily)
- [ ] Migração do banco
- [ ] Criar llm-usage-service.ts
- [ ] Integrar em generateLessonPlanContent
- [ ] Integrar em refine-theme

### Fase 2: Dashboard Admin (2-3 dias)
- [ ] API GET /admin/llm-usage
- [ ] API GET /admin/llm-usage/logs
- [ ] Página /admin/llm-usage
- [ ] Componentes de charts e tabelas
- [ ] Filtros e paginação

### Fase 3: Alertas (1 dia)
- [ ] Sistema de alertas (alert-service.ts)
- [ ] Cron job Vercel
- [ ] Templates de email
- [ ] Testes de alertas

### Fase 4: Otimizações (1 dia)
- [ ] Agregados diários (job de pré-cálculo)
- [ ] Índices de performance
- [ ] Cache de queries frequentes

**Total: 6-8 dias**

---

## 11. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Log falhar e quebrar operação | Log assíncrono com try/catch |
| Volume alto de logs (escalabilidade) | Agregados diários + retenção de 90 dias |
| Pricing da OpenAI mudar | Tabela de pricing configurável |
| Alertas spammando emails | Rate limit de 1 email/dia por nível |

---

## 12. Anexos

### 12.1 Features do Sistema (Mapeamento)

| Feature Slug | Descrição | Modelo Usado |
|--------------|-----------|--------------|
| `lesson-plan-generation` | Geração de plano de aula | gpt-4o-mini |
| `theme-refinement` | Refinamento de tema | gpt-4o-mini |
| `chat-assistant` | Chat com IA (futuro) | gpt-4o |
| `resource-summary` | Resumo de recursos (futuro) | gpt-4o-mini |

### 12.2 Exemplo de Log Completo

```json
{
  "id": "clxyz123",
  "userId": "user_abc",
  "feature": "lesson-plan-generation",
  "operation": "Gerar plano EF 3º ano Matemática - Introdução às Frações",
  "model": "gpt-4o-mini",
  "provider": "openai",
  "inputTokens": 1234,
  "outputTokens": 2345,
  "totalTokens": 3579,
  "inputCost": 0.00018,
  "outputCost": 0.00141,
  "totalCost": 0.00159,
  "latencyMs": 2340,
  "status": "success",
  "metadata": {
    "planId": "plan_xyz",
    "educationLevel": "ensino-fundamental-1",
    "grade": "ef1-3-ano",
    "subject": "matematica",
    "numberOfClasses": 2,
    "skillsCount": 2
  },
  "createdAt": "2026-01-15T14:23:45.123Z"
}
```

---

**Versão:** 1.0
**Atualizado:** Janeiro 2026
**Autor:** Kadernim Team
