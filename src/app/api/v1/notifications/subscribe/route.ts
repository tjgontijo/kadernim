import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PushSubscriptionCreateSchema } from '@/lib/schemas/push-notification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar com Zod
    const validation = PushSubscriptionCreateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { endpoint, keys } = validation.data;

    // Criar ou atualizar a inscrição
    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint,
      },
      update: {
        active: true,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
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
