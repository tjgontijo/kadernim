import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { headers } from 'next/headers';
import { sendPushToAll, sendPushToSubscriptions, countActiveSubscriptions } from '@/services/notification/push-send';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/notifications/test-push
 *
 * Envia uma notificação push de teste.
 * Pode ser para todos, por role ou por userId específico.
 * Requer autenticação de admin.
 */
export async function POST(req: Request) {
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

    const { title, body, url, icon, role, userId } = await req.json().catch(() => ({}));

    const payload = {
      title: title || 'Teste de Notificação',
      body: body || 'Esta é uma notificação de teste do Kadernim!',
      url: url || '/',
      tag: 'test-notification',
      icon: icon || undefined
    };

    let result;

    if (role || userId) {
      // Buscar subscriptions específicas de forma mais direta
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          active: true,
          OR: [
            userId ? { userId } : {},
            role ? { user: { role } } : {}
          ].filter(f => Object.keys(f).length > 0)
        }
      });

      if (subscriptions.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Nenhum dispositivo ativo encontrado para esta audiência',
            message: 'Certifique-se de que o seu navegador permitiu notificações e que o Service Worker está ativo.'
          },
          { status: 200 }
        );
      }

      result = await sendPushToSubscriptions(
        subscriptions.map(s => ({
          id: s.id,
          endpoint: s.endpoint,
          auth: s.auth,
          p256dh: s.p256dh,
          userId: s.userId
        })),
        payload
      );
    } else {
      // Enviar para todos
      result = await sendPushToAll(payload);
    }

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
