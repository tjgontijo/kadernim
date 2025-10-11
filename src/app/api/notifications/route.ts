import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Obter o usuário autenticado usando Better Auth
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unread') === 'true';
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');

    // Build the query
    const where: {
      userId: string;
      read?: boolean;
      type?: string;
      category?: string;
    } = { userId };
    
    if (unreadOnly) {
      where.read = false;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (category) {
      where.category = category;
    }

    // Obter contagem total para paginação
    const totalCount = await prisma.notification.count({ where });
    
    // Obter notificações com paginação
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        sentAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar notificações' },
      { status: 500 }
    );
  }
}
