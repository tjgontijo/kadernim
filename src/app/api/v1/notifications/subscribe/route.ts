import { NextRequest, NextResponse } from 'next/server';
import { PushSubscriptionCreateSchema } from '@/schemas/notifications/push-notification-schemas';
import { upsertPushSubscription } from '@/services/notification/push-subscription.service';
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

    const subscription = await upsertPushSubscription(userId, validation.data);


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
