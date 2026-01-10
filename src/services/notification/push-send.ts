import webpush from 'web-push';
import { prisma } from '@/lib/db';
import type { PushPayload } from '@/lib/schemas/push-notification';

// Configurar VAPID
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@kadernim.com.br';
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * Envia push notification para uma subscription específica
 */
export async function sendPushToSubscription(
  subscription: { id: string; endpoint: string; auth: string; p256dh: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
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
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/',
        tag: payload.tag || `kadernim-${Date.now()}`,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image || undefined
      })
    );

    // Atualizar timestamp de último uso
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { updatedAt: new Date() }
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };

    // Endpoint expirado (410) ou não encontrado (404)
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log(`[Push] Subscription expirada, desativando: ${subscription.id}`);
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { active: false }
      });
    }

    return {
      success: false,
      error: err.message || 'Erro desconhecido ao enviar push'
    };
  }
}

/**
 * Envia push notification para todas as subscriptions ativas
 */
export async function sendPushToAll(payload: PushPayload): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { active: true }
  });

  if (subscriptions.length === 0) {
    return { total: 0, success: 0, failed: 0, errors: [] };
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub: any) =>
      sendPushToSubscription(
        {
          id: sub.id,
          endpoint: sub.endpoint,
          auth: sub.auth,
          p256dh: sub.p256dh
        },
        payload
      )
    )
  );

  const errors: string[] = [];
  let successCount = 0;
  let failedCount = 0;

  results.forEach((result: any, index: number) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failedCount++;
      const errorMsg =
        result.status === 'rejected'
          ? result.reason?.message
          : result.value?.error;
      if (errorMsg) {
        errors.push(`${subscriptions[index].id}: ${errorMsg}`);
      }
    }
  });

  console.log(
    `[Push] Enviado para ${successCount}/${subscriptions.length} subscriptions`
  );

  return {
    total: subscriptions.length,
    success: successCount,
    failed: failedCount,
    errors
  };
}

/**
 * Envia push notification para subscriptions específicas (com suporte a segmentação)
 *
 * @param subscriptions Lista de subscriptions filtradas (ex: por audience)
 * @param payload Conteúdo da notificação
 * @returns Métricas de envio + mapping userId -> success
 */
export async function sendPushToSubscriptions(
  subscriptions: Array<{
    id: string;
    endpoint: string;
    auth: string;
    p256dh: string;
    userId: string;
  }>,
  payload: PushPayload
): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
  userResults: Record<string, boolean>; // userId -> success
  uniqueUsersCount: number;
}> {
  if (subscriptions.length === 0) {
    return {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
      userResults: {},
      uniqueUsersCount: 0
    };
  }

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      sendPushToSubscription(
        {
          id: sub.id,
          endpoint: sub.endpoint,
          auth: sub.auth,
          p256dh: sub.p256dh
        },
        payload
      )
    )
  );

  const errors: string[] = [];
  const userResults: Record<string, boolean> = {};
  let successCount = 0;
  let failedCount = 0;

  results.forEach((result, index) => {
    const subscription = subscriptions[index];
    const isSuccess = result.status === 'fulfilled' && result.value.success;

    // Se o usuário tem múltiplas subscriptions, consideramos sucesso se pelo menos uma funcionar
    if (!userResults[subscription.userId] || isSuccess) {
      userResults[subscription.userId] = isSuccess;
    }

    if (isSuccess) {
      successCount++;
    } else {
      failedCount++;
      const errorMsg =
        result.status === 'rejected'
          ? result.reason?.message
          : result.value?.error;
      if (errorMsg) {
        errors.push(`${subscription.id} (userId: ${subscription.userId}): ${errorMsg}`);
      }
    }
  });

  const uniqueUsersCount = Object.keys(userResults).length;

  console.log(
    `[Push] Enviado para ${successCount}/${subscriptions.length} subscriptions (${uniqueUsersCount} usuários únicos)`
  );

  return {
    total: subscriptions.length,
    success: successCount,
    failed: failedCount,
    errors,
    userResults,
    uniqueUsersCount
  };
}

/**
 * Conta subscriptions ativas
 */
export async function countActiveSubscriptions(): Promise<number> {
  return prisma.pushSubscription.count({
    where: { active: true }
  });
}
