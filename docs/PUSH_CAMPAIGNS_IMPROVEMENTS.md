# 🚀 Push Campaigns: Melhorias Implementadas

## ✅ O Que Foi Implementado

### 1. **Vinculação de Push Subscriptions ao Usuário** ✓

**Antes:**
- Push subscriptions eram device-based (sem userId)
- Impossível saber qual usuário recebeu a notificação
- Sem possibilidade de segmentação

**Depois:**
- Subscriptions vinculadas ao `userId`
- Dialog de permissão **só aparece após login**
- Endpoint `/api/v1/notifications/subscribe` exige autenticação

**Arquivos Modificados:**
- `prisma/schema.prisma` - Adicionado userId + relação com User
- `src/app/api/v1/notifications/subscribe/route.ts` - Validação de auth
- `src/components/pwa/PushNotificationSetup.tsx` - Verificação de sessão
- `prisma/migrations/add_user_to_push_subscription.sql` - SQL de migração

---

### 2. **Serviço de Segmentação de Audiência** ✓

**Novo Arquivo:** `src/services/notification/audience-segmentation.ts`

**Funcionalidades:**
```typescript
// Filtrar usuários por critérios
interface AudienceFilter {
  roles?: string[]                  // ['user', 'subscriber', 'editor']
  hasSubscription?: 'all' | 'subscribers' | 'non-subscribers'
  activeInDays?: number             // Ativos nos últimos X dias
  inactiveForDays?: number          // Inativos há X dias
}

// Funções disponíveis
getSegmentedPushSubscriptions(audience)  // Busca subscriptions filtradas
countAudienceUsers(audience)             // Conta usuários no filtro
previewAudience(audience)                // Preview para admin
```

**Exemplos de Uso:**
```typescript
// Enviar apenas para assinantes ativos nos últimos 7 dias
const audience = {
  hasSubscription: 'subscribers',
  activeInDays: 7
}

// Enviar para usuários inativos (re-engagement)
const audience = {
  inactiveForDays: 30
}

// Enviar para roles específicos
const audience = {
  roles: ['subscriber', 'editor']
}
```

---

### 3. **Envio Segmentado de Campanhas** ✓

**Arquivo Modificado:** `src/services/notification/push-send.ts`

**Nova Função:**
```typescript
sendPushToSubscriptions(
  subscriptions: Array<{
    id: string
    endpoint: string
    auth: string
    p256dh: string
    userId: string
  }>,
  payload: PushPayload
): Promise<{
  total: number
  success: number
  failed: number
  errors: string[]
  userResults: Map<string, boolean>  // userId -> success
}>
```

**Benefícios:**
- Retorna mapping de userId -> success
- Logs mais informativos com userId
- Conta usuários únicos alcançados

---

### 4. **Handler de Campanhas com Segmentação** ✓

**Arquivo Modificado:** `src/lib/inngest/functions.ts`

**Função:** `handleCampaignScheduled`

**Fluxo Melhorado:**
1. ✅ Aguarda horário agendado (se houver)
2. ✅ Busca dados da campanha
3. ✅ Atualiza status para `SENDING`
4. ✅ **Aplica filtros de segmentação do campo `audience`**
5. ✅ Envia para subscriptions filtradas
6. ✅ Atualiza status para `SENT` com métricas
7. ✅ Retorna `uniqueUsers` alcançados

**Exemplo de Log:**
```
[Campaign] Aplicando segmentação: {"roles":["subscriber"],"hasSubscription":"subscribers"}
[Campaign] Filtro aplicado - 45 subscriptions encontradas
[Campaign] Enviando push para 45 subscriptions
[Push] Enviado para 43/45 subscriptions (43 usuários únicos)
```

---

### 5. **Tracking de Cliques por Usuário** ✓

**Novo Endpoint:** `src/app/api/v1/campaigns/track/route.ts`

**Funcionalidades:**
- POST `/api/v1/campaigns/track`
- Registra clique com `userId` (se autenticado)
- Incrementa contador `totalClicked` na campanha
- User agent tracking
- Suporta cliques anônimos (userId null)

**Uso no Service Worker:**
```javascript
// Quando usuário clica na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Extrair campaignId da notificação
  const campaignId = event.notification.data.campaignId

  // Registrar clique
  fetch('/api/v1/campaigns/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ campaignId })
  })

  // Abrir URL
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
```

---

### 6. **Analytics com Métricas de Usuário** ✓

**Arquivo Modificado:** `src/app/api/v1/admin/campaigns/analytics/route.ts`

**Novas Métricas:**
```typescript
kpis: {
  // Métricas existentes
  totalCampaigns: number
  sentCampaigns: number
  totalSent: number
  totalClicked: number
  ctr: string

  // ✨ NOVAS métricas user-based
  totalUsersWithPush: number        // Usuários com subscriptions ativas
  uniqueUsersClicked: number        // Usuários únicos que clicaram
  userEngagementRate: string        // % de usuários que clicaram
}

// ✨ NOVO ranking
topEngagedUsers: Array<{
  userId: string
  userName: string
  clickCount: number                // Total de cliques do usuário
}>
```

**Queries Otimizadas:**
```sql
-- Usuários únicos que clicaram
SELECT user_id, COUNT(*) as clickCount
FROM push_campaign_clicks
WHERE clicked_at >= '2026-01-01'
AND user_id IS NOT NULL
GROUP BY user_id

-- Top usuários engajados
SELECT pcc.user_id, u.name, COUNT(*) as clickCount
FROM push_campaign_clicks pcc
INNER JOIN "user" u ON u.id = pcc.user_id
WHERE pcc.clicked_at >= '2026-01-01'
GROUP BY pcc.user_id, u.name
ORDER BY clickCount DESC
LIMIT 5
```

---

## 📊 Sugestões para Página de Analytics

### Novos KPI Cards

Adicionar à página `src/app/admin/campaigns/analytics/page.tsx`:

```tsx
{/* Card 1: Total de Usuários com Push */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Usuários com Push</CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {data.kpis.totalUsersWithPush?.toLocaleString() || 0}
    </div>
    <p className="text-xs text-muted-foreground">
      Push habilitado
    </p>
  </CardContent>
</Card>

{/* Card 2: Usuários Únicos Engajados */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Usuários Engajados</CardTitle>
    <UserCheck className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">
      {data.kpis.uniqueUsersClicked?.toLocaleString() || 0}
    </div>
    <p className="text-xs text-muted-foreground">
      {data.kpis.userEngagementRate || '0.00'}% de engajamento
    </p>
  </CardContent>
</Card>
```

### Nova Seção: Top Usuários Engajados

```tsx
{/* Ranking de Usuários Mais Engajados */}
<Card>
  <CardHeader>
    <CardTitle>Usuários Mais Engajados</CardTitle>
    <CardDescription>Usuários que mais clicaram em notificações</CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead className="text-right">Total de Cliques</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.topEngagedUsers && data.topEngagedUsers.length > 0 ? (
          data.topEngagedUsers.map((user) => (
            <TableRow key={user.userId}>
              <TableCell className="font-medium">{user.userName}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline">{user.clickCount}</Badge>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
              Nenhum clique registrado ainda.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

---

## 🎯 Benefícios Finais

### ✅ Segmentação Precisa
- Enviar apenas para assinantes: `hasSubscription: 'subscribers'`
- Re-engajamento de inativos: `inactiveForDays: 30`
- Campanha para usuários ativos: `activeInDays: 7`
- Filtro por role: `roles: ['editor', 'manager']`

### ✅ Analytics Profundos
- **Taxa de engajamento de usuários** (não apenas dispositivos)
- **Top usuários engajados** (identificar power users)
- **Tracking de cliques por usuário** (não apenas anônimo)

### ✅ Queries Otimizadas
- JOIN `PushSubscription` → `User` com índices
- `@@index([userId])` na PushSubscription
- Aggregations eficientes com `groupBy`

### ✅ Multi-Dispositivo
- Mesmo usuário pode ter subscriptions em vários devices
- Sistema conta usuários únicos corretamente
- Envio para todos os dispositivos do usuário

---

## 🔄 Próximos Passos (Opcionais)

### 1. **Preview de Audiência no Admin**
Adicionar botão "Preview Audiência" no formulário de campanha:

```tsx
<Button
  variant="outline"
  onClick={async () => {
    const preview = await fetch('/api/v1/admin/campaigns/audience-preview', {
      method: 'POST',
      body: JSON.stringify({ audience: form.watch('audience') })
    }).then(r => r.json())

    alert(`
      Total de usuários: ${preview.totalUsers}
      Com push ativo: ${preview.withPushSubscriptions}
    `)
  }}
>
  Preview Audiência
</Button>
```

### 2. **A/B Testing de Campanhas**
- Criar variantes de uma campanha
- Dividir audiência em grupos de teste
- Comparar CTR entre variantes

### 3. **Notificações Agendadas Recorrentes**
- Campaigns semanais/mensais
- Cron patterns para agendamento
- Auto-criação de campanhas

### 4. **Rich Notifications**
- Imagens maiores
- Action buttons
- Badges personalizados

---

## 📝 Checklist de Migração do Banco

```sql
-- Aplicar no Neon Console ou via Prisma Migrate

-- 1. Adicionar coluna userId
ALTER TABLE "push_subscription" ADD COLUMN "userId" TEXT;

-- 2. Deletar subscriptions antigas sem vínculo
DELETE FROM "push_subscription" WHERE "userId" IS NULL;

-- 3. Tornar userId obrigatório
ALTER TABLE "push_subscription" ALTER COLUMN "userId" SET NOT NULL;

-- 4. Adicionar foreign key
ALTER TABLE "push_subscription"
ADD CONSTRAINT "push_subscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE;

-- 5. Criar índice para userId
CREATE INDEX "push_subscription_userId_idx" ON "push_subscription"("userId");
```

---

## 🎉 Conclusão

Com essas melhorias, o sistema de push campaigns do Kadernim agora:

✅ **Sabe exatamente quem recebeu cada notificação**
✅ **Segmenta campanhas com precisão cirúrgica**
✅ **Rastreia engajamento real de usuários**
✅ **Otimiza custos enviando apenas para quem importa**
✅ **Identifica power users e comportamentos**
✅ **Suporta multi-dispositivo por usuário**

🚀 **Sistema pronto para escala e marketing avançado!**
