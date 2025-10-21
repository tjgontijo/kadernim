import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:contato@kadernim.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

/**
 * POST /api/v1/notifications/test-push
 * Envia uma notificação push de teste para o usuário atual
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar inscrições ativas (modelo simplificado por dispositivo)
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        active: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { 
          error: 'Nenhuma inscrição de push encontrada',
          message: 'Você precisa permitir notificações primeiro'
        },
        { status: 404 }
      );
    }

    // Criar notificação no banco
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: '🎉 Notificação de Teste',
        body: 'Esta é uma notificação push de teste do Kadernim!',
        icon: '/images/icons/icon.png',
        type: 'info',
        category: 'test',
        data: {
          url: '/notifications',
          timestamp: new Date().toISOString(),
        },
      },
    });

    // Enviar push para todas as inscrições
    const results = [];
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: '🎉 Notificação de Teste',
            body: 'Esta é uma notificação push de teste do Kadernim!',
            icon: '/images/icons/icon.png',
            badge: '/images/icons/icon.png',
            data: {
              url: '/notifications',
              notificationId: notification.id,
            },
            tag: `test-notification-${Date.now()}`,
            requireInteraction: false,
            vibrate: [200, 100, 200],
          })
        );

        results.push({ 
          success: true, 
          subscriptionId: subscription.id 
        });
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        
        // Se a inscrição não é mais válida, desativar
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { active: false },
          });
        }

        results.push({ 
          success: false, 
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Notificação enviada para ${successCount} de ${subscriptions.length} dispositivo(s)`,
      notificationId: notification.id,
      results,
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar notificação de teste' },
      { status: 500 }
    );
  }
}
