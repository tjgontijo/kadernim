# PRD: Campanhas de Push Notifications

## Objetivo

Permitir que o admin envie **push notifications de marketing** para usuários segmentados, com **analytics completo** (cliques, CTR) e um dashboard visual no padrão do "Monitoramento de IA".

---

## Diferenciais Técnicos

- **Infra Agnostic (Inngest):** O sistema de background jobs e agendamento (cron) usará Inngest. Isso garante portabilidade total (Vercel, Dokyu, VPS) sem depender de infra local de cron.
- **Padrão CRUD:** A gestão das campanhas seguirá rigorosamente o componente `CrudPageShell` do projeto.
- **Visual Premium:** O dashboard de analytics seguirá o estilo de cards, gráficos Recharts e tabelas detalhadas do Monitoramento de IA.

---

## Estrutura de Páginas

| Página | Rota | Descrição | Estilo Visual |
|--------|------|-----------|---------------|
| **Gestão de Campanhas** | `/admin/campaigns` | CRUD (Rascunho, Agendamento, Envio) | `CrudPageShell` |
| **Analytics Push** | `/admin/campaigns/analytics` | Dashboard de Desempenho | Estilo `llm-usage` |

---

## Funcionalidades de Analytics

### KPIs Principais (Cards)
- **Alcance Total:** Quantos usuários únicos receberam pushs no período.
- **Taxa de Engajamento (CTR):** Porcentagem de cliques sobre envios.
- **Top Campanha:** Qual campanha teve melhor performance.
- **Novos Inscritos Push:** Crescimento da base habilitada para push.

### Visualização de Dados
- **Gráfico Temporal:** Envios vs Cliques por dia (Recharts LineChart).
- **Ranking de Performance:** Tabela de campanhas ordenável por taxa de conversão.
- **Logs de Cliques:** Lista detalhada dos últimos cliques registrados.

---

## Fluxo de Agendamento e Envio

### 1. Inngest Scheduler (Cron)
- Rodará a cada minuto verificando campanhas com `status: SCHEDULED` e `scheduledAt <= now`.
- Dispara o evento `push/campaign.send`.

### 2. Inngest Sender
- Recebe o ID da campanha.
- Segmenta a audiência.
- Envia em batches (ex: 50 usuários por vez) para evitar timeouts.
- Atualiza métricas desnormalizadas na `PushCampaign`.

---

## Tracking de Cliques (Redirect)

Para evitar dependência de scripts externos e ter dados 100% precisos:
1. O Push aponta para `/api/v1/track/push/{campaignId}?u={userId}&dest={targetUrl}`.
2. A API incrementa `PushCampaign.totalClicked`.
3. A API cria um registro em `PushCampaignClick`.
4. A API redireciona o usuário para o destino final com UTMs injetadas.

---

## Checklist de Dados (Prisma)

```prisma
model PushCampaign {
  id          String   @id @default(cuid())
  name        String
  title       String   @db.VarChar(100)
  body        String   @db.VarChar(255)
  url         String?  // Destino final
  
  // Status
  status      CampaignStatus @default(DRAFT)
  scheduledAt DateTime?
  sentAt      DateTime?
  
  // Analytics Desnormalizado
  totalSent    Int @default(0)
  totalClicked Int @default(0)
}

model PushCampaignClick {
  id          String   @id @default(cuid())
  campaignId  String
  userId      String?
  clickedAt   DateTime @default(now())
}
```
