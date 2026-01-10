import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UnsubscribePushSchema } from '@/lib/schemas/push-notification';

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

    const { endpoint } = validation.data;

    // Buscar a subscription pelo endpoint
    const subscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription não encontrada' },
        { status: 404 }
      );
    }

    // Marcar como inativa
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: { active: false },
    });

    console.log(`[Push] Subscription desativada: ${subscription.id}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Push] Erro ao cancelar subscription:', error);
    return NextResponse.json(
      { error: 'Falha ao cancelar subscription' },
      { status: 500 }
    );
  }
}
