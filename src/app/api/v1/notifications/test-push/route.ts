import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { headers } from 'next/headers';
import { sendPushToAll, countActiveSubscriptions } from '@/services/notification/push-send';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/notifications/test-push
 *
 * Envia uma notificação push de teste para todos os dispositivos.
 * Requer autenticação de admin.
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const activeCount = await countActiveSubscriptions();

    if (activeCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhuma subscription ativa encontrada',
          message: 'Instale o PWA e permita notificações primeiro'
        },
        { status: 404 }
      );
    }

    const result = await sendPushToAll({
      title: 'Teste de Notificação',
      body: 'Esta é uma notificação de teste do Kadernim!',
      url: '/',
      tag: 'test-notification'
    });

    return NextResponse.json({
      success: result.success > 0,
      message: `Enviado para ${result.success} de ${result.total} dispositivo(s)`,
      total: result.total,
      sent: result.success,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    console.error('[Push] Erro ao enviar teste:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar notificação de teste' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/notifications/test-push
 *
 * Retorna contagem de subscriptions ativas.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const count = await countActiveSubscriptions();

    return NextResponse.json({
      activeSubscriptions: count
    });
  } catch (error) {
    console.error('[Push] Erro ao contar subscriptions:', error);
    return NextResponse.json(
      { error: 'Falha ao contar subscriptions' },
      { status: 500 }
    );
  }
}
