import { prisma } from '@/lib/db'
import type { PushSubscriptionCreate, UnsubscribePush } from '@/lib/notifications/schemas'

export async function upsertPushSubscription(userId: string, input: PushSubscriptionCreate) {
  return prisma.pushSubscription.upsert({
    where: {
      endpoint: input.endpoint,
    },
    update: {
      active: true,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userId,
    },
    create: {
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userId,
      active: true,
    },
  })
}

export async function deactivatePushSubscription(input: UnsubscribePush) {
  const subscription = await prisma.pushSubscription.findUnique({
    where: { endpoint: input.endpoint },
    select: { id: true },
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  await prisma.pushSubscription.update({
    where: { id: subscription.id },
    data: { active: false },
  })
}
