import { NextRequest, NextResponse } from 'next/server';
import { UnsubscribePushSchema } from '@/schemas/notifications/push-notification-schemas';
import { deactivatePushSubscription } from '@/services/notification/push-subscription.service';

/**
 * POST /api/v1/notifications/unsubscribe
 *
 * Desativa uma subscription de push notification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = UnsubscribePushSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await deactivatePushSubscription(validation.data);


    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Subscription not found') {
      return NextResponse.json(
        { error: 'Subscription não encontrada' },
        { status: 404 }
      );
    }

    console.error('[Push] Erro ao cancelar subscription:', error);
    return NextResponse.json(
      { error: 'Falha ao cancelar subscription' },
      { status: 500 }
    );
  }
}
