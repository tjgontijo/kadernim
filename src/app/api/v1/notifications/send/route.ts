import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import webpush from 'web-push';

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

    // Verificar se o usuário é admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Proibido: Acesso de admin necessário' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validar o corpo da requisição
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Determinar usuários alvo
    let userIds: string[] = [];
    if (body.userIds === 'all') {
      // Obter todos os IDs de usuários
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      userIds = users.map((user: { id: string }) => user.id);
    } else if (Array.isArray(body.userIds) && body.userIds.length > 0) {
      userIds = body.userIds;
    } else {
      return NextResponse.json(
        { error: 'userIds inválido' },
        { status: 400 }
      );
    }

    // Preparar dados da notificação
    const notificationData = {
      title: body.title,
      body: body.body,
      icon: body.icon || '/icon.png',
      image: body.image,
      badge: body.badge,
      data: body.data || {},
      type: body.type || 'info',
      category: body.category,
      clickAction: body.data?.url,
      requireInteraction: body.requireInteraction || false,
      expiresAt: body.scheduleAt ? new Date(body.scheduleAt) : null,
    };

    // Verificar se é uma notificação agendada
    const shouldSendNow = !notificationData.expiresAt || 
      notificationData.expiresAt <= new Date();

    // Criar notificações no banco de dados
    const notificationIds = [];
    for (const userId of userIds) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: notificationData.title,
          body: notificationData.body,
          icon: notificationData.icon,
          image: notificationData.image,
          badge: notificationData.badge,
          data: notificationData.data,
          type: notificationData.type,
          category: notificationData.category,
          clickAction: notificationData.clickAction,
          expiresAt: notificationData.expiresAt,
        },
      });
      notificationIds.push(notification.id);

    }

    // Enviar notificações push para todos os dispositivos ativos quando não estiver agendado
    if (shouldSendNow) {
      await sendPushNotification(notificationData);
    }

    return NextResponse.json(
      { 
        success: true, 
        ids: notificationIds,
        scheduled: !shouldSendNow
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return NextResponse.json(
      { error: 'Falha ao enviar notificações' },
      { status: 500 }
    );
  }
}

// Função auxiliar para enviar notificações push para os dispositivos de um usuário
async function sendPushNotification(
  notification: {
    title: string;
    body: string;
    icon: string;
    image?: string;
    badge?: string;
    data: Record<string, unknown>;
    requireInteraction?: boolean;
  }
) {
  try {
    // Obter todas as inscrições ativas
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        active: true,
      },
    });

    // Enviar notificação push para cada inscrição
    const sendPromises = subscriptions.map(async (subscription) => {
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
            title: notification.title,
            body: notification.body,
            icon: notification.icon,
            image: notification.image,
            badge: notification.badge,
            data: notification.data,
            tag: `kadernim-notification-${Date.now()}`,
            requireInteraction: notification.requireInteraction,
            vibrate: [200, 100, 200],
          })
        );
        return { success: true, subscriptionId: subscription.id };
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
        return { 
          success: false, 
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
    });

    return Promise.all(sendPromises);
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
    throw error;
  }
}
