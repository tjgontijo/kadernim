import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    // Validar sessão
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { whatsapp } = body;

    // Validar formato (12 dígitos com 55: 556182493200)
    if (whatsapp) {
      if (!/^\d{12}$/.test(whatsapp)) {
        return NextResponse.json(
          { error: 'WhatsApp deve ter 12 dígitos (ex: 556182493200)' },
          { status: 400 }
        );
      }

      // Validar que começa com 55 (Brasil)
      if (!whatsapp.startsWith('55')) {
        return NextResponse.json(
          { error: 'WhatsApp deve começar com 55 (código do Brasil)' },
          { status: 400 }
        );
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { whatsapp: whatsapp || null },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar WhatsApp' },
      { status: 500 }
    );
  }
}
