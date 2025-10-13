import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id;

    // Verificar se o usuário tem plano ativo
    let hasActivePlan = false;
    if (userId) {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: {
          isActive: true,
          expiresAt: true,
        },
      });
      
      // Verifica se tem assinatura ativa e não expirada
      hasActivePlan = !!(subscription?.isActive && 
        (!subscription.expiresAt || subscription.expiresAt > new Date()));
    }

    // Buscar todos os recursos com suas relações
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        isFree: true,
        subjectId: true,
        educationLevelId: true,
        subject: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        educationLevel: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        files: {
          select: {
            id: true,
          },
        },
        accesses: userId ? {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        } : undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar os dados para o formato esperado pelo cliente
    const formattedResources = resources.map(resource => {
      // Se tem plano ativo, tem acesso a tudo
      // Se não tem plano, só tem acesso aos gratuitos ou comprados individualmente
      const hasIndividualAccess = resource.accesses && resource.accesses.length > 0;
      const hasAccess = hasActivePlan || resource.isFree || hasIndividualAccess;
      
      return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        imageUrl: resource.imageUrl,
        subjectId: resource.subjectId,
        subjectName: resource.subject.name,
        educationLevelId: resource.educationLevelId,
        educationLevelName: resource.educationLevel.name,
        isFree: resource.isFree,
        hasAccess,
        hasActivePlan,
        fileCount: resource.files.length,
      };
    });

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar recursos' },
      { status: 500 }
    );
  }
}
