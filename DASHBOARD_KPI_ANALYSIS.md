# Análise Geral de Dashboards e KPIs - Kadernim

## 📊 Resumo Executivo

Esta análise mapeia todos os dashboards e KPIs existentes na plataforma Kadernim, identificando oportunidades de otimização, consistência e expansão.

---

## 🎯 Dashboards Existentes

### 1. **Dashboard Principal Admin** (`/admin/page.tsx`)
**Endpoint**: `/api/v1/admin/stats`

#### KPIs Atuais:
- **Total de Recursos**: Recursos cadastrados
- **Recursos Gratuitos**: Disponíveis gratuitamente
- **Recursos Premium**: Apenas para assinantes
- **Usuários Ativos**: Com acesso à plataforma

#### ✅ Pontos Fortes:
- Visão clara da distribuição free vs premium
- KPIs simples e diretos

#### ⚠️ Oportunidades de Melhoria:
- **Falta contexto temporal**: Não mostra tendências (crescimento semanal/mensal)
- **Falta métricas de engajamento**: Não mostra usuários ativos vs inativos
- **Falta métricas de receita**: Não relaciona assinantes com valor
- **Dados estáticos**: Não tem período selecionável (7d, 30d, 90d)

---

### 2. **Dashboard de Usuários** (`/admin/users/page.tsx`)
**Endpoint**: `/api/v1/admin/users` (CRUD, não analytics)

#### Features Atuais:
- Filtros por cargo, status de assinatura, email verificado
- Visualização de acessos por usuário
- Badge de assinatura ativa/inativa

#### ✅ Pontos Fortes:
- Filtros robustos e combinados
- Visualização de "Acessos" (recursos acessados)

#### ⚠️ Oportunidades de Melhoria:
- **Não é um dashboard analítico**: É uma página CRUD, sem KPIs consolidados
- **Falta painel de métricas**: Poderia ter:
  - Taxa de conversão free → subscriber
  - Churn rate (assinantes que cancelaram)
  - Lifetime value (LTV) por segmento
  - Usuários ativos nos últimos 7/30/90 dias
  - Taxa de verificação de email

---

### 3. **Dashboard de LLM Usage** (`/admin/llm-usage/page.tsx`)
**Endpoint**: `/api/v1/admin/llm-usage`

#### KPIs Atuais:
- **Chamadas Totais**: Total de requests LLM
- **Tokens Consumidos**: Input/Output separados
- **Custo Total**: Estimado em USD
- **Modelos Ativos**: Quantos modelos diferentes estão em uso

#### Analytics Adicionais:
- Histórico de custos (LineChart)
- Uso por funcionalidade (BarChart)
- Distribuição detalhada por feature
- Logs recentes com paginação
- Alertas de custo (warning/critical)

#### ✅ Pontos Fortes:
- **Dashboard completo e maduro**
- Período selecionável (7d, 30d, 90d)
- Visualizações gráficas claras
- Detalhamento granular (feature, model, user)
- Sistema de alertas configurado

#### ⚠️ Oportunidades de Melhoria:
- **Falta análise de ROI**: Custo LLM vs valor gerado para usuários
- **Falta previsão de gastos**: Projeção mensal baseada em uso atual
- **Falta comparação de modelos**: Qual modelo tem melhor custo-benefício?
- **Falta análise por usuário**: Top usuários que consomem mais LLM

---

### 4. **Dashboard de Campanhas Push** (`/admin/campaigns/analytics/page.tsx`)
**Endpoint**: `/api/v1/admin/campaigns/analytics`

#### KPIs Atuais:
- **Total Enviados**: Notificações enviadas
- **Total de Cliques**: Clicks nas notificações
- **Taxa de Engajamento (CTR)**: Click-through rate
- **Melhor Campanha**: Campanha com maior CTR

#### Analytics Adicionais:
- Histórico de performance (LineChart: sent vs clicked)
- Ranking de campanhas (Top 10 por CTR)

#### ✅ Pontos Fortes:
- Dashboard bem estruturado com período selecionável
- Gráfico de tendência clara
- Ranking de performance

#### ⚠️ Oportunidades de Melhoria (RESOLVIDAS na sessão anterior):
- ~~**Falta métricas de usuários únicos**: Só rastreia devices~~
- ~~**Falta segmentação**: Não mostra performance por audiência~~
- ~~**Falta tracking de usuários engajados**: Não identifica power users~~

#### ✅ KPIs Adicionados (Sessão Anterior):
Baseado nas melhorias implementadas, agora o endpoint `/api/v1/admin/campaigns/analytics` retorna:

```typescript
{
  kpis: {
    // ... KPIs existentes
    totalUsersWithPush: number,        // Total de usuários com push ativo
    uniqueUsersClicked: number,        // Usuários únicos que clicaram
    userEngagementRate: string,        // % de usuários que clicaram
  },
  topEngagedUsers: [                   // Top 5 usuários mais engajados
    {
      userId: string,
      userName: string,
      clickCount: number
    }
  ]
}
```

---

## 🎨 Proposta de Otimização Global

### **1. Dashboard Principal Admin - Expansão**

#### Novos KPIs Sugeridos:

```typescript
interface AdminDashboardStats {
  // Existentes
  totalResources: number
  totalUsers: number
  freeResources: number
  paidResources: number

  // NOVOS - Crescimento
  usersGrowth: {
    total: number
    weekOverWeek: number  // % de crescimento vs semana anterior
    monthOverMonth: number
  }

  // NOVOS - Engajamento
  activeUsers: {
    last7days: number
    last30days: number
    last90days: number
  }

  // NOVOS - Receita
  revenue: {
    activeSubscribers: number
    subscribersGrowth: number  // % vs mês anterior
    churnRate: number  // % de cancelamentos
    mrr: number  // Monthly Recurring Revenue (se tiver Stripe)
  }

  // NOVOS - Conteúdo
  contentStats: {
    avgResourcesPerUser: number
    mostAccessedResourceId: string
    mostAccessedResourceTitle: string
    totalAccesses: number
  }

  // NOVOS - Comunicação
  pushNotifications: {
    totalUsersWithPush: number
    lastCampaignCTR: string
    totalCampaignsSent: number
  }
}
```

#### Layout Sugerido:
```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard Administrativo                              [Período]│
├────────────────────────────────────────────────────────────────┤
│  📊 VISÃO GERAL                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Usuários │ │ Recursos │ │Assinantes│ │   MRR    │          │
│  │  1.234   │ │   567    │ │    89    │ │ $2,450  │          │
│  │  +12%    │ │  +5%     │ │   +8%    │ │  +15%    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                │
│  📈 CRESCIMENTO (30d)                                          │
│  [Gráfico de linha: Usuários novos + Assinantes novos]       │
│                                                                │
│  💎 TOP RECURSOS MAIS ACESSADOS                                │
│  [Tabela com top 5 recursos por total de acessos]            │
│                                                                │
│  📲 ÚLTIMAS CAMPANHAS                                          │
│  [Card com resumo das últimas 3 campanhas push enviadas]     │
└────────────────────────────────────────────────────────────────┘
```

---

### **2. Dashboard de Usuários - Transformação Analítica**

#### Criar `/admin/users/analytics` com:

```typescript
interface UserAnalytics {
  kpis: {
    totalUsers: number
    activeUsersLast30d: number
    newUsersLast30d: number
    conversionRate: string  // free → subscriber
    churnRate: string
    avgResourceAccessPerUser: number
  }

  // Segmentação
  byRole: {
    user: number
    subscriber: number
    editor: number
    admin: number
  }

  // Comportamento
  engagement: {
    highlyActive: number     // >10 acessos/mês
    moderatelyActive: number // 3-10 acessos/mês
    lowActivity: number      // 1-2 acessos/mês
    dormant: number          // 0 acessos/mês
  }

  // Cohort Analysis
  cohorts: Array<{
    month: string
    newUsers: number
    retained30d: number
    retained60d: number
    retained90d: number
  }>

  // Top Usuários
  topUsers: Array<{
    userId: string
    name: string
    totalAccesses: number
    role: string
  }>
}
```

---

### **3. Dashboard de LLM - Melhorias Incrementais**

#### Novos KPIs:

```typescript
interface LlmAnalyticsEnhanced {
  // ... existentes

  // NOVO - ROI
  roi: {
    totalCost: number
    estimatedValueGenerated: number  // Ex: num de planos criados * valor médio
    costPerUser: number
    costPerFeatureUse: number
  }

  // NOVO - Previsão
  forecast: {
    projectedMonthlyCost: number
    projectedMonthlyGrowth: number
    budgetUtilization: number  // % do budget usado
  }

  // NOVO - Top Usuários
  topUsersByUsage: Array<{
    userId: string
    userName: string
    totalCalls: number
    totalCost: number
  }>

  // NOVO - Comparação de Modelos
  modelComparison: Array<{
    model: string
    avgLatency: number
    avgCost: number
    successRate: number
    costEfficiencyScore: number  // tokens/dollar
  }>
}
```

---

### **4. Dashboard de Campanhas Push - Implementação dos Novos KPIs**

#### KPIs para Adicionar na UI (Backend já implementado):

```typescript
// Já disponível no endpoint, falta só UI
interface CampaignAnalyticsUI {
  // ... KPIs existentes

  // ADICIONAR na UI
  totalUsersWithPush: number
  uniqueUsersClicked: number
  userEngagementRate: string
  topEngagedUsers: Array<{
    userId: string
    userName: string
    clickCount: number
  }>
}
```

#### Cards Adicionais Sugeridos:

**Card 1: Usuários com Push**
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Usuários com Push</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {data.kpis.totalUsersWithPush.toLocaleString()}
    </div>
    <p className="text-xs text-muted-foreground">
      Subscriptions ativas
    </p>
  </CardContent>
</Card>
```

**Card 2: Taxa de Engajamento de Usuários**
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Engajamento de Usuários</CardTitle>
    <UserCheck className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{data.kpis.userEngagementRate}%</div>
    <p className="text-xs text-muted-foreground">
      {data.kpis.uniqueUsersClicked} usuários únicos clicaram
    </p>
  </CardContent>
</Card>
```

**Seção Adicional: Top Usuários Engajados**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Top Usuários Engajados</CardTitle>
    <CardDescription>Usuários que mais interagem com campanhas</CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead className="text-right">Cliques Totais</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.topEngagedUsers.map((user) => (
          <TableRow key={user.userId}>
            <TableCell className="font-medium">{user.userName}</TableCell>
            <TableCell className="text-right">
              <Badge variant="outline">{user.clickCount}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

## 📋 Migration SQL para Push Subscriptions (Verificar se há necessidade de rodar antes. Só rodar se o schema do prisma não estiver com essas alterações.)

```sql
-- Migration: add_user_to_push_subscription.sql
-- Adiciona userId às subscriptions de push para tracking de usuários

BEGIN;

-- 1. Adicionar coluna userId (nullable temporariamente)
ALTER TABLE "push_subscription" ADD COLUMN "user_id" TEXT;

-- 2. Deletar subscriptions órfãs (sem vínculo de usuário possível)
DELETE FROM "push_subscription" WHERE "user_id" IS NULL;

-- 3. Tornar userId obrigatório
ALTER TABLE "push_subscription" ALTER COLUMN "user_id" SET NOT NULL;

-- 4. Adicionar foreign key
ALTER TABLE "push_subscription"
ADD CONSTRAINT "push_subscription_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Criar índice para userId (performance)
CREATE INDEX "push_subscription_user_id_idx" ON "push_subscription"("user_id");

-- 6. Comentários para documentação
COMMENT ON COLUMN "push_subscription"."user_id" IS 'ID do usuário autenticado que possui esta subscription';
COMMENT ON INDEX "push_subscription_user_id_idx" IS 'Índice para otimizar queries por userId';

COMMIT;
```

---

## 🎯 KPIs Específicos para Campanhas Push

### **Métricas de Alcance**
1. **Total de Usuários com Push Ativo** (`totalUsersWithPush`)
   - Usuários que autorizaram notificações e têm subscription ativa
   - Indica potencial de alcance máximo

2. **Taxa de Habilitação de Push** (`pushEnablementRate`)
   - `(usuários com push / total usuários) * 100`
   - Mede sucesso em obter permissão de notificação

### **Métricas de Engajamento**
3. **Usuários Únicos Clicados** (`uniqueUsersClicked`)
   - Número de usuários distintos que clicaram
   - Mais preciso que contagem de dispositivos

4. **Taxa de Engajamento de Usuários** (`userEngagementRate`)
   - `(usuários únicos clicados / usuários com push) * 100`
   - Mede qualidade do targeting e conteúdo

5. **Cliques por Usuário** (`clicksPerUser`)
   - `total de cliques / usuários únicos clicados`
   - Identifica usuários multi-dispositivo ou re-engajamento

### **Métricas de Performance**
6. **CTR Médio por Segmento** (novo)
   - CTR separado por: roles, subscription status, activity level
   - Identifica quais audiências respondem melhor

7. **Taxa de Conversão** (futuro)
   - Usuários que clicaram e completaram ação desejada
   - Requer tracking de conversão pós-click

### **Métricas de Retenção**
8. **Usuários Recorrentes** (novo)
   - Usuários que clicaram em 2+ campanhas
   - Indica lealdade e interesse consistente

9. **Taxa de Desinscrição** (futuro)
   - `(subscriptions desativadas / total ativas) * 100`
   - Mede fadiga de notificação

### **Métricas de Segmentação**
10. **Performance por Audiência** (já implementado no backend)
    - CTR por: roles, hasSubscription, activeInDays
    - Valida eficácia da segmentação

---

## 🚀 Roadmap de Implementação Sugerido

### **Fase 1: Quick Wins (1-2 semanas)**
- ✅ Adicionar migration de userId (solicitado)
- ✅ Implementar novos KPIs no dashboard de campanhas (UI)
- [ ] Adicionar período selecionável no dashboard principal admin
- [ ] Criar endpoint `/api/v1/admin/stats/growth` para métricas temporais

### **Fase 2: Analytics Avançado (2-4 semanas)**
- [ ] Criar dashboard de analytics de usuários (`/admin/users/analytics`)
- [ ] Implementar cohort analysis
- [ ] Adicionar previsão de custos LLM
- [ ] Implementar ROI tracking para features LLM

### **Fase 3: Otimização de Campanhas (4-6 semanas)**
- [ ] Implementar A/B testing de campanhas
- [ ] Criar heatmap de melhor horário para envio
- [ ] Adicionar análise de fadiga (frequência ótima)
- [ ] Implementar recomendação automática de audiência

### **Fase 4: Inteligência de Negócio (6-8 semanas)**
- [ ] Dashboard executivo consolidado (CEO view)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Alertas automáticos (Slack/Email) para métricas críticas
- [ ] Machine learning para previsão de churn

---

## 📊 Resumo de KPIs por Dashboard

| Dashboard | KPIs Atuais | KPIs Propostos | Prioridade |
|-----------|-------------|----------------|------------|
| **Admin Principal** | 4 | 15+ | 🔴 Alta |
| **Usuários** | 0 (CRUD) | 12+ | 🟡 Média |
| **LLM Usage** | 4 | 8+ | 🟢 Baixa |
| **Campanhas Push** | 4 | 10+ | 🔴 Alta |

---

## 💡 Conclusões e Recomendações

### Principais Gaps Identificados:
1. **Falta de métricas temporais** na maioria dos dashboards (crescimento, tendências)
2. **Dashboard de usuários é puramente CRUD**, sem analytics
3. **Falta correlação entre dashboards** (ex: custo LLM vs engajamento)
4. **Métricas de receita inexistentes** (MRR, LTV, churn)

### Recomendações Prioritárias:
1. **Implementar UI dos novos KPIs de campanhas** (backend já pronto)
2. **Adicionar migration SQL** para userId em push_subscription
3. **Criar dashboard de growth** no admin principal com períodos
4. **Desenvolver analytics de usuários** separado do CRUD

### Benefícios Esperados:
- **Decisões data-driven** baseadas em tendências reais
- **Identificação proativa de problemas** (churn, custos LLM)
- **Otimização de campanhas** com métricas granulares
- **Visibilidade de ROI** para features de IA

---

**Próximos Passos**: Quer que eu implemente alguma dessas otimizações? Posso começar pelos KPIs de campanhas push (já temos o backend pronto) ou pela migration SQL que você solicitou.
