import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UnsubscribePushSchema } from '@/lib/schemas/push-notification';

export async function POST(req: NextRequest) {
  try {
    // Obter o usuário autenticado usando Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

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

    // Encontrar a inscrição
    const subscription = await prisma.pushSubscription.findUnique({
      where: {
        endpoint,
      },
    });

    // Verificar se a inscrição existe e pertence ao usuário
    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    // Marcar a inscrição como inativa
    await prisma.pushSubscription.update({
      where: {
        id: subscription.id,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao cancelar inscrição de notificações:', error);
    return NextResponse.json(
      { error: 'Falha ao cancelar inscrição de notificações' },
      { status: 500 }
    );
  }
}
