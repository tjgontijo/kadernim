import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

type PushSendResult = {
  success: boolean;
  subscriptionId: string;
  error?: string;
};

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:contato@kadernim.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

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
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Criar uma notificação de teste
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: body.title,
        body: body.body,
        icon: body.icon || '/icon.png',
        type: body.type || 'info',
        category: body.category || 'test',
        data: body.data || { test: true },
      },
    });

    // Obter todas as inscrições ativas do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        active: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma inscrição ativa encontrada para este usuário',
        notificationId: notification.id,
      });
    }

    // Enviar notificação push para cada inscrição
    const results: PushSendResult[] = [];
    await Promise.all(
      subscriptions.map(async (subscription) => {
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
              title: body.title,
              body: body.body,
              icon: body.icon || '/icon.png',
              data: body.data || { test: true },
              tag: `kadernim-test-${Date.now()}`,
              requireInteraction: body.requireInteraction || false,
              vibrate: [200, 100, 200],
            })
          );

          results.push({
            success: true,
            subscriptionId: subscription.id,
          });
        } catch (error) {
          // Verificar se a inscrição não é mais válida
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            // Marcar inscrição como inativa
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
      })
    );

    return NextResponse.json({
      success: true,
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
