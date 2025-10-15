import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Obter o usuário autenticado usando Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validar o corpo da requisição
    if (!body.endpoint) {
      return NextResponse.json(
        { error: 'Endpoint ausente' },
        { status: 400 }
      );
    }

    // Encontrar a inscrição
    const subscription = await prisma.pushSubscription.findUnique({
      where: {
        endpoint: body.endpoint,
      },
    });

    // Verificar se a inscrição existe e pertence ao usuário
    if (!subscription) {
      return NextResponse.json(
        { error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    if (subscription.userId !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
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
