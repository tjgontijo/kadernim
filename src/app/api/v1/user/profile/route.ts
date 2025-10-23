import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { normalizeWhatsApp } from '@/lib/helpers/phone';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema de validação
const updateProfileSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .trim(),
  whatsapp: z.string()
    .transform((val) => val || '')
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      const numbers = val.replace(/\D/g, '');
      return numbers.length >= 10 && numbers.length <= 11;
    }, {
      message: 'WhatsApp inválido. Use o formato: (DD) DDDDD-DDDD'
    })
    .optional()
});

/**
 * PATCH /api/v1/user/profile
 * Atualiza parcialmente os dados do perfil do usuário autenticado
 * Permite atualizar apenas nome e/ou whatsapp
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parsear e validar body com Zod
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => err.message).join(', ');
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { name, whatsapp } = validationResult.data;

    // Preparar dados para atualização
    const updateData: {
      name: string;
      whatsapp?: string | null;
    } = {
      name, // Zod já fez o trim
    };

    // Normalizar WhatsApp se fornecido
    if (whatsapp && whatsapp.length > 0) {
      updateData.whatsapp = normalizeWhatsApp(whatsapp);
    } else {
      // Se WhatsApp estiver vazio, definir como null
      updateData.whatsapp = null;
    }

    // Atualizar usuário no banco
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        role: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/user/profile
 * Retorna os dados do perfil do usuário autenticado
 */
export async function GET() {
  try {
    // Verificar autenticação
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        role: true,
        subscriptionTier: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}
