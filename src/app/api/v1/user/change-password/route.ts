import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
});

/**
 * POST /api/v1/user/change-password
 * Altera a senha do usuário
 */
export async function POST(request: NextRequest) {
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
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message).join(', ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Buscar conta do usuário (Better Auth usa tabela Account)
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: 'credential',
      },
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { error: 'Conta não encontrada ou não usa senha' },
        { status: 404 }
      );
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, account.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 401 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.account.update({
      where: { id: account.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
