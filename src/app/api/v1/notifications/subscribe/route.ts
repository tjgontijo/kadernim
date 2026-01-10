import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PushSubscriptionCreateSchema } from '@/lib/schemas/push-notification';
import { auth } from '@/server/auth';

/**
 * POST /api/v1/notifications/subscribe
 *
 * Registra uma nova subscription de push notification vinculada ao usuário autenticado.
 * Requer autenticação via Better Auth.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para ativar notificações.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Validar payload
    const body = await req.json();
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

    // 3. Criar ou atualizar a subscription (vinculada ao userId)
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        active: true,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId, // Atualiza o userId caso o endpoint já exista
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId,
        active: true,
      },
    });

    console.log(`[Push] Subscription registrada para usuário ${userId}: ${subscription.id}`);

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
