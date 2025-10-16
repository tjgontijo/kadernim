import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { updatePreferencesSchema, parsePreferences } from '@/lib/schemas/user-preferences';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/user/preferences
 * Retorna as preferências do usuário
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Parseia e valida as preferências
    const preferences = parsePreferences(user.preferences);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar preferências' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/user/preferences
 * Atualiza parcialmente as preferências do usuário
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = updatePreferencesSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message).join(', ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    // Buscar preferências atuais
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Mesclar preferências existentes com as novas
    const currentPreferences = parsePreferences(user.preferences);
    const updatedPreferences = {
      ...currentPreferences,
      ...validationResult.data,
    };

    // Atualizar no banco
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: updatedPreferences,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar preferências' },
      { status: 500 }
    );
  }
}
