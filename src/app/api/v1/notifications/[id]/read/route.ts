import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obter o usuário autenticado usando Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Encontrar a notificação
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    // Verificar se a notificação existe e pertence ao usuário
    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Marcar a notificação como lida
    await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json(
      { error: 'Falha ao marcar notificação como lida' },
      { status: 500 }
    );
  }
}
