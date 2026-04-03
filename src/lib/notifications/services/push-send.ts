import webpush from 'web-push'
import { prisma } from '@/lib/db'
import type { PushPayload } from '@/lib/notifications/schemas'

const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contato@kadernim.com.br'
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

let vapidConfigured = false
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
    vapidConfigured = true
  } catch (error) {
    console.error('[Push] Erro ao configurar VAPID:', error)
  }
} else {
  console.warn('[Push] VAPID keys não configuradas - push notifications não funcionarão')
}

export async function sendPushToSubscription(
  subscription: { id: string; endpoint: string; auth: string; p256dh: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  if (!vapidConfigured) {
    console.error('[Push] Tentativa de envio sem VAPID configurado')
    return {
      success: false,
      error: 'VAPID não configurado - impossível enviar push notifications',
    }
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      auth: subscription.auth,
      p256dh: subscription.p256dh,
    },
  }

  const payloadData = {
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    tag: payload.tag || `kadernim-${Date.now()}`,
    icon: payload.icon || '/images/icons/apple-icon.png',
    badge: payload.badge || '/pwa/manifest-icon-192.maskable.png',
    image: payload.image || undefined,
  }

  try {
    await webpush.sendNotification(pushSubscription, JSON.stringify(payloadData))

    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { updatedAt: new Date() },
    })

    return { success: true }
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string; body?: string }

    console.error(`[Push] Erro ao enviar para ${subscription.id}:`, {
      statusCode: err.statusCode,
      message: err.message,
      body: err.body,
    })

    if (err.statusCode === 410 || err.statusCode === 404) {
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { active: false },
      })
    }

    return {
      success: false,
      error: `[${err.statusCode || 'unknown'}] ${err.message || 'Erro desconhecido ao enviar push'}`,
    }
  }
}

export async function sendPushToAll(payload: PushPayload) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { active: true },
  })

  if (subscriptions.length === 0) {
    return { total: 0, success: 0, failed: 0, errors: [] as string[] }
  }

  const results = await Promise.allSettled(
    subscriptions.map((subscription: any) =>
      sendPushToSubscription(
        {
          id: subscription.id,
          endpoint: subscription.endpoint,
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
        payload
      )
    )
  )

  const errors: string[] = []
  let successCount = 0
  let failedCount = 0

  results.forEach((result: any, index: number) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++
    } else {
      failedCount++
      const errorMsg = result.status === 'rejected' ? result.reason?.message : result.value?.error
      if (errorMsg) {
        errors.push(`${subscriptions[index].id}: ${errorMsg}`)
      }
    }
  })

  return {
    total: subscriptions.length,
    success: successCount,
    failed: failedCount,
    errors,
  }
}

export async function sendPushToSubscriptions(
  subscriptions: Array<{
    id: string
    endpoint: string
    auth: string
    p256dh: string
    userId: string
  }>,
  payload: PushPayload
) {
  if (subscriptions.length === 0) {
    return {
      total: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
      userResults: {} as Record<string, boolean>,
      uniqueUsersCount: 0,
    }
  }

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendPushToSubscription(
        {
          id: subscription.id,
          endpoint: subscription.endpoint,
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
        payload
      )
    )
  )

  const errors: string[] = []
  const userResults: Record<string, boolean> = {}
  let successCount = 0
  let failedCount = 0

  results.forEach((result, index) => {
    const subscription = subscriptions[index]
    const isSuccess = result.status === 'fulfilled' && result.value.success

    if (!userResults[subscription.userId] || isSuccess) {
      userResults[subscription.userId] = isSuccess
    }

    if (isSuccess) {
      successCount++
    } else {
      failedCount++
      const errorMsg = result.status === 'rejected' ? result.reason?.message : result.value?.error
      if (errorMsg) {
        errors.push(`${subscription.id} (userId: ${subscription.userId}): ${errorMsg}`)
      }
    }
  })

  return {
    total: subscriptions.length,
    success: successCount,
    failed: failedCount,
    errors,
    userResults,
    uniqueUsersCount: Object.keys(userResults).length,
  }
}

export async function countActiveSubscriptions(): Promise<number> {
  return prisma.pushSubscription.count({
    where: { active: true },
  })
}
