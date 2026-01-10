# PRD - Push Notifications MVP para Kadernim PWA

**Versão:** 2.0
**Data:** 2026-01-09
**Status:** MVP IMPLEMENTADO - Pronto para Testes
**Autor:** Análise Técnica Automatizada

---

## 1. Resumo Executivo

### 1.1 Situação Atual

O sistema de **Web Push Notifications está 100% implementado para MVP**. Todos os componentes críticos foram restaurados e corrigidos.

**Implementado:**
- Componente UI `PushNotificationSetup.tsx` para solicitar permissão (PWA standalone)
- Lógica cliente para registrar subscription via Push Manager
- Schema Zod `lib/schemas/push-notification.ts`
- Modelo `PushSubscription` no Prisma (tabela criada)
- Endpoint `POST /api/v1/notifications/subscribe`
- Endpoint `POST /api/v1/notifications/unsubscribe`
- Endpoint `POST /api/v1/notifications/test-push` (admin only)
- Service Worker com push listeners (`push`, `notificationclick`)
- Serviço `push-send.ts` para envio via web-push
- Implementação `executeAction` para PUSH_NOTIFICATION no Inngest
- Tratamento de endpoints expirados (410/404)
- VAPID keys configuradas no `.env`

**Para Futuro (não MVP):**
- Modelo `NotificationPreference` (preferências granulares por tipo)
- Logs de entrega detalhados
- Dashboard de métricas

### 1.2 Objetivo

Implementar um sistema de Push Notifications MVP que permita:
1. Usuários optarem por receber notificações push
2. Sistema enviar notificações baseadas em eventos (automações existentes)
3. Usuários gerenciarem suas preferências de notificação
4. Administradores monitorarem entregas e métricas básicas

### 1.3 Escopo MVP

| Incluído | Excluído (Futuro) |
|----------|-------------------|
| Subscribe/Unsubscribe básico | Segmentação avançada por tags |
| Envio via automações Inngest | A/B testing de notificações |
| Preferências básicas por usuário | Rich notifications com imagens |
| Service Worker com push listener | Analytics avançado de engagement |
| Tratamento de endpoints expirados | Agendamento de notificações |
| UI de permissão contextual | Silent push para sync |

---

## 2. Análise do Estado Atual

### 2.1 Arquivos Implementados

#### Cliente
```
src/components/pwa/PushNotificationSetup.tsx   → ✅ UI de permissão (PWA standalone)
src/components/pwa/ServiceWorkerRegister.tsx   → ✅ Update detection
src/lib/schemas/push-notification.ts           → ✅ Schema Zod para validação
```

#### Backend
```
src/app/api/v1/notifications/subscribe/route.ts   → ✅ Registrar subscription
src/app/api/v1/notifications/unsubscribe/route.ts → ✅ Cancelar subscription
src/app/api/v1/notifications/test-push/route.ts   → ✅ Teste (admin only)
src/services/notification/push-send.ts            → ✅ Serviço de envio
src/lib/inngest/functions.ts                      → ✅ PUSH_NOTIFICATION implementado
```

#### Infraestrutura
```
prisma/schema.prisma                           → ✅ Modelo PushSubscription
public/sw-custom.js                            → ✅ Push listeners
.env                                           → ✅ VAPID keys
```

### 2.2 Status dos Componentes

| Componente | Status | Arquivo |
|------------|--------|---------|
| Modelo `PushSubscription` (Prisma) | ✅ | `prisma/schema.prisma` |
| Schema Zod | ✅ | `src/lib/schemas/push-notification.ts` |
| Endpoint subscribe | ✅ | `src/app/api/v1/notifications/subscribe/route.ts` |
| Endpoint unsubscribe | ✅ | `src/app/api/v1/notifications/unsubscribe/route.ts` |
| Endpoint test-push | ✅ | `src/app/api/v1/notifications/test-push/route.ts` |
| Service Worker push listener | ✅ | `public/sw-custom.js` |
| Serviço push-send | ✅ | `src/services/notification/push-send.ts` |
| Inngest PUSH_NOTIFICATION | ✅ | `src/lib/inngest/functions.ts` |
| VAPID keys | ✅ | `.env` |
| UI de permissão | ✅ | `src/components/pwa/PushNotificationSetup.tsx` |
| Tratamento erro 410 | ✅ | `src/services/notification/push-send.ts` |
| Modelo NotificationPreference | ⏳ Futuro | - |
| Logs de entrega | ⏳ Futuro | - |

---

## 3. Especificações Técnicas

### 3.1 Schema do Banco de Dados (Prisma)

```prisma
// Adicionar ao schema.prisma

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Web Push API fields
  endpoint  String   @db.Text
  auth      String   // p256dh authentication secret
  p256dh    String   // User's public key for encryption

  // Management
  isActive    Boolean   @default(true)
  userAgent   String?   // Browser info for debugging
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastUsedAt  DateTime?

  @@unique([userId, endpoint])
  @@index([userId])
  @@index([isActive])
}

model NotificationPreference {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Canais
  emailEnabled Boolean @default(true)
  pushEnabled  Boolean @default(true)

  // Tipos de notificação
  communityUpdates    Boolean @default(true)  // Votos, seleções em requests
  resourceAlerts      Boolean @default(true)  // Novos recursos publicados
  lessonPlanReminders Boolean @default(true)  // Lembretes de planos
  systemAnnouncements Boolean @default(true)  // Anúncios do sistema

  // Horários silenciosos (futuro)
  quietHoursEnabled Boolean @default(false)
  quietHoursStart   String? // "22:00"
  quietHoursEnd     String? // "08:00"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PushNotificationLog {
  id             String   @id @default(cuid())
  subscriptionId String
  subscription   PushSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  // Payload enviado
  title   String
  body    String
  url     String?
  tag     String?

  // Status
  status       String   // pending, sent, delivered, clicked, failed, expired
  sentAt       DateTime?
  deliveredAt  DateTime?
  clickedAt    DateTime?

  // Erros
  errorCode    Int?
  errorMessage String?

  // Tracking
  automationLogId String?
  automationLog   AutomationLog? @relation(fields: [automationLogId], references: [id])

  createdAt DateTime @default(now())

  @@index([subscriptionId])
  @@index([status])
  @@index([createdAt])
}
```

### 3.2 Variáveis de Ambiente

```env
# .env (adicionar)

# VAPID Keys para Web Push
# Gerar com: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUiv...
VAPID_PRIVATE_KEY=UGGDzmLj3H...
VAPID_SUBJECT=mailto:contato@kadernim.com.br
```

### 3.3 Estrutura de Arquivos

```
EXISTENTES (precisam ser completados):
├── src/components/pwa/PushNotificationSetup.tsx  ✅ UI existe (falta schema)
├── .env                                          ✅ VAPID keys existem
└── public/sw-custom.js                           ⚠️ Existe (falta push listeners)

CRIAR:
src/
├── services/
│   └── notification/
│       ├── push-subscription.ts    # CRUD de subscriptions
│       └── push-send.ts            # Envio de push via web-push
│
├── lib/
│   └── schemas/
│       └── push-notification.ts    # Schema Zod (import faltante)
│
├── components/
│   └── client/
│       └── notifications/
│           └── NotificationPreferences.tsx
│
└── app/
    └── api/
        └── v1/
            └── notifications/
                ├── subscribe/route.ts
                ├── unsubscribe/route.ts
                └── preferences/route.ts

ATUALIZAR:
├── prisma/schema.prisma            # Adicionar PushSubscription
├── public/sw-custom.js             # Adicionar push listeners
└── src/lib/inngest/functions.ts    # Implementar PUSH_NOTIFICATION
```

### 3.4 API Endpoints

#### POST `/api/v1/notifications/subscribe`
```typescript
// Request
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "auth": "...",
      "p256dh": "..."
    }
  },
  "userAgent": "Mozilla/5.0..."
}

// Response 201
{
  "success": true,
  "subscriptionId": "clxx..."
}

// Response 409 (já existe)
{
  "success": true,
  "subscriptionId": "clxx...",
  "message": "Subscription already exists"
}
```

#### POST `/api/v1/notifications/unsubscribe`
```typescript
// Request
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}

// Response 200
{
  "success": true
}
```

#### GET/PATCH `/api/v1/notifications/preferences`
```typescript
// GET Response
{
  "emailEnabled": true,
  "pushEnabled": true,
  "communityUpdates": true,
  "resourceAlerts": true,
  "lessonPlanReminders": true,
  "systemAnnouncements": true
}

// PATCH Request
{
  "pushEnabled": false,
  "communityUpdates": false
}
```

### 3.5 Service Worker (sw-custom.js)

```javascript
// Adicionar ao public/sw-custom.js

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'kadernim-notification',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId
    },
    vibrate: [100, 50, 100],
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Procurar janela existente
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Abrir nova janela
        return clients.openWindow(urlToOpen);
      })
  );

  // Reportar click (opcional - analytics)
  if (event.notification.data?.notificationId) {
    fetch('/api/v1/notifications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        action: 'clicked'
      })
    }).catch(() => {}); // Silent fail
  }
});

// Notification close handler (dismissed)
self.addEventListener('notificationclose', (event) => {
  if (event.notification.data?.notificationId) {
    fetch('/api/v1/notifications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: event.notification.data.notificationId,
        action: 'dismissed'
      })
    }).catch(() => {});
  }
});
```

### 3.6 Hook useNotificationPermission

```typescript
// src/hooks/use-notification-permission.ts

import { useState, useEffect, useCallback } from 'react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function useNotificationPermission() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      setIsLoading(false);
      return;
    }

    setPermission(Notification.permission as PermissionState);
    setIsLoading(false);
  }, []);

  const requestPermission = useCallback(async () => {
    if (permission === 'unsupported') return 'unsupported';

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [permission]);

  return {
    permission,
    isLoading,
    isSupported: permission !== 'unsupported',
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
    requestPermission
  };
}
```

### 3.7 Serviço de Envio (push-send.ts)

```typescript
// src/services/notification/push-send.ts

import webpush from 'web-push';
import { prisma } from '@/lib/db';

// Configurar VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  notificationId?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true }
  });

  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushToSubscription(sub, payload))
  );

  return {
    total: subscriptions.length,
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length
  };
}

export async function sendPushToSubscription(
  subscription: { id: string; endpoint: string; auth: string; p256dh: string },
  payload: PushPayload
) {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.auth,
      p256dh: subscription.p256dh
    }
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    // Atualizar lastUsedAt
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { lastUsedAt: new Date() }
    });

    return { success: true };
  } catch (error: any) {
    // Endpoint expirado ou inválido
    if (error.statusCode === 410 || error.statusCode === 404) {
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false }
      });
    }

    throw error;
  }
}
```

### 3.8 Implementação executeAction (Inngest)

```typescript
// Atualizar src/lib/inngest/functions.ts - case PUSH_NOTIFICATION

case 'PUSH_NOTIFICATION': {
  const templateId = config.templateId as string;

  if (!templateId) {
    return { success: false, error: 'Missing templateId' };
  }

  // Buscar template
  const template = await prisma.notificationTemplate.findUnique({
    where: { id: templateId }
  });

  if (!template || template.type !== 'push') {
    return { success: false, error: 'Invalid push template' };
  }

  // Verificar preferências do usuário
  const userId = variables.user?.id;
  if (!userId) {
    return { success: false, error: 'No user context' };
  }

  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId }
  });

  // Respeitar preferências (push habilitado)
  if (preferences && !preferences.pushEnabled) {
    return { success: false, error: 'User disabled push notifications' };
  }

  // Renderizar template
  const title = renderTemplate(template.name, variables);
  const body = renderTemplate(template.body, variables);
  const url = variables.url || '/';

  // Enviar push
  const result = await sendPushToUser(userId, {
    title,
    body,
    url,
    tag: `kadernim-${rule.event}`
  });

  return {
    success: result.success > 0,
    sent: result.success,
    failed: result.failed
  };
}
```

---

## 4. Fluxos de Usuário (UX)

### 4.1 Fluxo de Opt-in (Solicitar Permissão)

```
┌─────────────────────────────────────────────────────────┐
│  QUANDO solicitar permissão (Context-Sensitive)         │
├─────────────────────────────────────────────────────────┤
│  ✓ Após 1º login bem-sucedido (soft prompt)             │
│  ✓ Ao votar em feature request (value-driven)          │
│  ✓ Ao salvar 1º plano de aula                          │
│  ✓ Nas configurações de conta                          │
│  ✗ NUNCA no primeiro acesso/página inicial             │
│  ✗ NUNCA em popup intrusivo                            │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Componente de Permissão (Design)

```
┌────────────────────────────────────────────┐
│  🔔 Quer saber quando seu recurso for     │
│     aprovado ou receber votos?             │
│                                            │
│  Ative as notificações para não perder    │
│  atualizações importantes.                 │
│                                            │
│  [Ativar Notificações]  [Agora não]       │
└────────────────────────────────────────────┘
```

### 4.3 Tela de Preferências

```
┌────────────────────────────────────────────┐
│  Notificações                              │
├────────────────────────────────────────────┤
│                                            │
│  📧 Email                        [✓ ON]   │
│  🔔 Push no navegador            [✓ ON]   │
│                                            │
│  ─────────────────────────────────────────│
│  Quero receber:                           │
│                                            │
│  ✓ Atualizações da comunidade             │
│    Votos e seleções nas suas sugestões    │
│                                            │
│  ✓ Novos recursos                         │
│    Quando recursos do seu interesse       │
│    forem publicados                        │
│                                            │
│  ✓ Lembretes de planos                    │
│    Notificações sobre seus planos de aula │
│                                            │
│  ✓ Anúncios do sistema                    │
│    Novidades e atualizações importantes   │
│                                            │
└────────────────────────────────────────────┘
```

---

## 5. Eventos que Disparam Push

### 5.1 MVP - Eventos Prioritários

| Evento | Descrição | Template Sugerido |
|--------|-----------|-------------------|
| `community.request.voted` | Alguém votou na sua sugestão | "{{voter.name}} votou na sua sugestão '{{request.title}}'" |
| `community.request.selected` | Sua sugestão foi selecionada | "Boa notícia! Sua sugestão '{{request.title}}' foi selecionada para implementação" |
| `community.request.completed` | Sugestão implementada | "A funcionalidade '{{request.title}}' já está disponível!" |
| `resource.published` | Recurso aprovado | "Seu recurso '{{resource.title}}' foi aprovado e publicado" |

### 5.2 Futuro - Mais Eventos

| Evento | Descrição |
|--------|-----------|
| `lesson-plan.reminder` | Lembrete de plano próximo |
| `resource.favorited` | Alguém favoritou seu recurso |
| `subscription.expiring` | Assinatura expirando |
| `user.achievement` | Conquista desbloqueada |

---

## 6. Métricas de Sucesso (KPIs)

### 6.1 Métricas Técnicas

| Métrica | Meta MVP | Como Medir |
|---------|----------|------------|
| Taxa de permissão aceita | > 40% | `granted / (granted + denied)` |
| Taxa de entrega | > 95% | `sent / (sent + failed)` |
| Taxa de endpoints expirados | < 10% | `inactive / total` por mês |
| Latência de envio | < 2s | P95 do tempo Inngest |

### 6.2 Métricas de Engajamento

| Métrica | Meta MVP | Como Medir |
|---------|----------|------------|
| CTR (Click-Through Rate) | > 15% | `clicked / delivered` |
| Taxa de opt-out | < 5%/mês | `unsubscribed / active` |
| Retenção D7 com push | +20% vs sem | Comparar cohorts |

---

## 7. Considerações de Segurança

### 7.1 VAPID Keys
- Gerar keys únicas para produção
- NUNCA versionar private key
- Rotacionar se comprometida

### 7.2 Rate Limiting
- Máximo 10 push/usuário/hora
- Máximo 1000 push/minuto global
- Circuit breaker em falhas

### 7.3 Validação
- Validar subscription endpoint (URL válida)
- Sanitizar payloads (XSS)
- Validar origem do Service Worker

### 7.4 Privacidade
- Não enviar dados sensíveis no payload
- Respeitar preferências do usuário
- Permitir opt-out completo

---

## 8. Plano de Implementação

### Fase 1: Fundação (Crítico) - Completar Backend

**O que já existe:**
- ✅ VAPID keys configuradas no `.env`
- ✅ Componente `PushNotificationSetup.tsx` com UI e lógica cliente

**Tarefas para completar:**
1. Criar schema Zod `src/lib/schemas/push-notification.ts` (import faltante no componente)
2. Criar migration Prisma com modelo `PushSubscription`
3. Implementar endpoint `POST /api/v1/notifications/subscribe`
4. Implementar endpoint `POST /api/v1/notifications/unsubscribe`
5. Atualizar `sw-custom.js` com push listeners (`push`, `notificationclick`)

### Fase 2: Integração (Importante) - Envio de Push

**Tarefas:**
1. Criar serviço `src/services/notification/push-send.ts` usando `web-push`
2. Implementar case `PUSH_NOTIFICATION` no Inngest (`src/lib/inngest/functions.ts`)
3. Criar templates de push no banco (seed ou admin)
4. Testar fluxo completo: evento → Inngest → push → Service Worker → notificação

### Fase 3: Preferências (Importante)

**Tarefas:**
1. Criar migration para modelo `NotificationPreference`
2. Implementar endpoints GET/PATCH `/api/v1/notifications/preferences`
3. Criar componente `NotificationPreferences`
4. Adicionar seção de preferências em `/account`
5. Respeitar preferências no envio (verificar antes de enviar)

### Fase 4: Qualidade (Desejável)

**Tarefas:**
1. Criar modelo `PushNotificationLog` para tracking
2. Implementar endpoint `/api/v1/notifications/track` (click/dismiss)
3. Criar dashboard admin básico de métricas
4. Adicionar testes unitários
5. Documentar API

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Browsers bloqueando push | Média | Alto | Fallback para email |
| VAPID key comprometida | Baixa | Crítico | Rotação imediata + re-subscribe |
| Endpoint expiração em massa | Média | Médio | Cleanup job + re-engage via email |
| Usuários reportando spam | Baixa | Alto | Rate limiting + preferências |
| Safari não suportando | N/A | Médio | Safari agora suporta (iOS 16.4+) |

---

## 10. Checklist de Lançamento

### Pré-Lançamento
- [ ] VAPID keys geradas e configuradas
- [ ] Migration executada em produção
- [ ] Service Worker atualizado e testado
- [ ] Endpoints funcionando em staging
- [ ] Templates de push criados
- [ ] Preferências padrão definidas

### Lançamento
- [ ] Feature flag para rollout gradual (10% → 50% → 100%)
- [ ] Monitoramento de erros ativo (Sentry/similar)
- [ ] Rate limiting configurado
- [ ] Logs de envio ativos

### Pós-Lançamento
- [ ] Dashboard de métricas
- [ ] Alertas para taxa de erro > 5%
- [ ] Processo de rotação de VAPID keys
- [ ] Runbook para incidentes

---

## 11. Glossário

| Termo | Definição |
|-------|-----------|
| VAPID | Voluntary Application Server Identification - protocolo para identificar servidor push |
| Endpoint | URL única do navegador para receber push |
| p256dh | Chave pública do usuário para criptografia |
| auth | Segredo compartilhado para autenticação |
| Tag | Identificador para colapsar notificações duplicadas |
| 410 Gone | Status HTTP indicando endpoint expirado |

---

## 12. Referências

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Spec](https://datatracker.ietf.org/doc/html/rfc8292)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm](https://www.npmjs.com/package/web-push)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)

---

## Aprovação

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Product Owner | | | |
| Tech Lead | | | |
| Security | | | |

---

*Documento gerado automaticamente com base na análise do código existente.*
