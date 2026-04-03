import { NextResponse } from 'next/server';
import { getPushDebugStatus } from '@/lib/notifications/services';
import { auth } from '@/server/auth/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/notifications/debug
 *
 * Endpoint de debug para verificar o status do sistema de push notifications.
 * Requer autenticação de admin.
 */
export async function GET() {
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

    // Verificar configuração VAPID
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
    const vapidSubject = process.env.VAPID_SUBJECT || '';

    const {
      userSubscriptions,
      totalActiveSubscriptions,
      staleSubscriptions,
    } = await getPushDebugStatus(session.user.id);

    return NextResponse.json({
      vapid: {
        publicKeyConfigured: vapidPublicKey.length > 0,
        publicKeyLength: vapidPublicKey.length,
        publicKeyPreview: vapidPublicKey.substring(0, 20) + '...',
        privateKeyConfigured: vapidPrivateKey.length > 0,
        privateKeyLength: vapidPrivateKey.length,
        subjectConfigured: vapidSubject.length > 0,
        subject: vapidSubject,
      },
      subscriptions: {
        totalActive: totalActiveSubscriptions,
        stale: staleSubscriptions,
        currentUser: {
          count: userSubscriptions.length,
          items: userSubscriptions.map(s => ({
            id: s.id,
            endpointPreview: s.endpoint.substring(0, 60) + '...',
            endpointDomain: new URL(s.endpoint).hostname,
            active: s.active,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          }))
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    console.error('[Push Debug] Erro:', error);
    return NextResponse.json(
      { error: 'Falha ao obter status de debug' },
      { status: 500 }
    );
  }
}
