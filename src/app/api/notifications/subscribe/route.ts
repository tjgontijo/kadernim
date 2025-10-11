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
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes' },
        { status: 400 }
      );
    }

    // Criar ou atualizar a inscrição
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: body.endpoint,
      },
      update: {
        active: true,
        lastUsedAt: new Date(),
        userAgent: body.userAgent,
        deviceName: body.deviceName,
      },
      create: {
        userId,
        endpoint: body.endpoint,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        userAgent: body.userAgent,
        deviceName: body.deviceName,
        active: true,
      },
    });

    return NextResponse.json(
      { id: subscription.id, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao se inscrever para notificações:', error);
    return NextResponse.json(
      { error: 'Falha ao se inscrever para notificações' },
      { status: 500 }
    );
  }
}
