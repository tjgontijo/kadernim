import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { headers } from 'next/headers'
import {
  countActiveSubscriptions,
  sendPushToAll,
  sendPushToSubscriptions,
} from '@/services/notification/push-send'
import { listTargetPushSubscriptions } from '@/services/notification/push-debug.service'
import {
  PushPayload,
  TestPushRequest,
  TestPushRequestSchema,
} from '@/schemas/notifications/push-notification-schemas'

const iconMapping: Record<string, string> = {
  bell: '/icons/bell.png',
  gift: '/icons/gift.png',
  star: '/icons/star.png',
  sparkles: '/icons/sparkles.png',
  heart: '/icons/heart.png',
  zap: '/icons/zap.png',
  megaphone: '/icons/megaphone.png',
  party: '/icons/party.png',
  lightbulb: '/icons/lightbulb.png',
  book: '/icons/book.png',
  trophy: '/icons/trophy.png',
  flame: '/icons/flame.png',
}

export async function authorizeTestPushRequest(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const isAdmin = session?.user?.role === 'admin'
  const headerKey = req.headers.get('x-api-key')
  const expectedKey = process.env.WEBHOOK_API_KEY
  const isValidApiKey = Boolean(expectedKey) && headerKey === expectedKey

  if (!isAdmin && !isValidApiKey) {
    return NextResponse.json(
      { error: 'Não autorizado. Use uma sessão de Admin ou x-api-key válida.' },
      { status: 401 }
    )
  }

  return session
}

export async function requireAuthenticatedSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  return session
}

export async function parseTestPushRequest(req: Request) {
  const body = await req.json().catch(() => ({}))
  const parsed = TestPushRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  return parsed.data
}

export function buildTestPushPayload(input: TestPushRequest): PushPayload {
  return {
    title: input.title || 'Teste de Notificação',
    body: input.body || 'Esta é uma notificação de teste do Kadernim!',
    url: input.url || '/',
    tag: 'test-notification',
    icon: (input.icon && iconMapping[input.icon]) || input.icon || '/icon.png',
  }
}

export function testPushServerError(message: string, error: unknown) {
  console.error(message, error)
  return NextResponse.json(
    { error: 'Falha ao processar requisição de push' },
    { status: 500 }
  )
}

export async function executeTestPush(input: TestPushRequest, payload: PushPayload) {
  if (input.role || input.userId) {
    const subscriptions = await listTargetPushSubscriptions({
      role: input.role,
      userId: input.userId,
    })

    if (subscriptions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum dispositivo ativo encontrado para esta audiência',
          message:
            'Certifique-se de que o seu navegador permitiu notificações e que o Service Worker está ativo.',
        },
        { status: 200 }
      )
    }

    return sendPushToSubscriptions(
      subscriptions.map((subscription) => ({
        id: subscription.id,
        endpoint: subscription.endpoint,
        auth: subscription.auth,
        p256dh: subscription.p256dh,
        userId: subscription.userId,
      })),
      payload
    )
  }

  return sendPushToAll(payload)
}

export function serializeTestPushResult(result: {
  total: number
  success: number
  failed: number
  errors: unknown[]
}) {
  return NextResponse.json({
    success: result.success > 0,
    message: `Enviado para ${result.success} de ${result.total} dispositivo(s)`,
    total: result.total,
    sent: result.success,
    failed: result.failed,
    errors: result.errors,
  })
}

export async function getActiveSubscriptionsSummary() {
  return NextResponse.json({
    activeSubscriptions: await countActiveSubscriptions(),
  })
}
