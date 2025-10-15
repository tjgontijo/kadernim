// app/api/v1/resources/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id || null;
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        subject: true,
        educationLevel: true,
        files: true,
        externalMappings: true,
        bnccCodes: {
          include: {
            bnccCode: true,
          },
        },
        ...(userId && {
          accesses: {
            where: { userId },
            select: {
              id: true,
              isActive: true,
              expiresAt: true,
            },
          },
        }),
      },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
    }

    const subscription = userId
      ? await prisma.subscription.findUnique({
          where: { userId },
          include: {
            plan: {
              select: {
                slug: true,
              },
            },
          },
        })
      : null;

    return NextResponse.json(
      { resource, subscription },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Erro ao buscar recurso:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar o recurso' },
      { status: 500 }
    );
  }
}