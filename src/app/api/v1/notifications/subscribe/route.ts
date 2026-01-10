import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PushSubscriptionCreateSchema } from '@/lib/schemas/push-notification';

/**
 * POST /api/v1/notifications/subscribe
 *
 * Registra uma nova subscription de push notification.
 * Modelo simplificado por dispositivo (não vinculado a usuário).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar com Zod
    const validation = PushSubscriptionCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { endpoint, keys } = validation.data;

    // Criar ou atualizar a inscrição (upsert por endpoint)
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        active: true,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        active: true,
      },
    });

    console.log(`[Push] Subscription registrada: ${subscription.id}`);

    return NextResponse.json(
      { id: subscription.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Push] Erro ao registrar subscription:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar subscription' },
      { status: 500 }
    );
  }
}
