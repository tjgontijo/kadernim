// app/api/v1/resources/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { UserRoleType } from '@/types/user-role'
import { auth } from '@/lib/auth/auth'
import { isAdmin } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'

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

    // Otimização: Buscar dados em paralelo quando possível
    const [resource, subscription, user] = await Promise.all([
      // Query principal do recurso com includes otimizados
      prisma.resource.findUnique({
        where: { id },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          educationLevel: {
            select: {
              id: true,
              name: true,
            },
          },
          files: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              storageType: true,
              externalUrl: true,
              storageKey: true,
              metadata: true,
            },
          },
          externalMappings: {
            select: {
              id: true,
              productId: true,
              store: true,
            },
          },
          ...(userId && {
            accesses: {
              where: { 
                userId,
                isActive: true,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } }
                ]
              },
              select: {
                id: true,
                isActive: true,
                expiresAt: true,
              },
              take: 1, // Só precisamos saber se tem acesso
            },
          }),
        },
      }),
      
      // Query da subscription em paralelo se o usuário estiver logado
      userId
        ? prisma.subscription.findUnique({
            where: { userId },
            select: {
              id: true,
              isActive: true,
              expiresAt: true,
              plan: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          })
        : null,

      // Query do usuário para verificar role e subscription tier
      userId
        ? prisma.user.findUnique({
            where: { id: userId },
            select: {
              role: true,
              subscriptionTier: true,
            },
          })
        : null,
    ]);

    if (!resource) {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 });
    }

    // Determinar se o usuário tem acesso
    // Dentro da função onde isAdmin é usado
    const userIsAdmin = isAdmin(user?.role as UserRoleType);
    const isPremium = userIsAdmin || 
      user?.subscriptionTier === 'premium' ||
      (subscription?.isActive && 
        (!subscription.expiresAt || subscription.expiresAt > new Date()) &&
        subscription.plan?.slug !== 'free');
    
    const hasIndividualAccess = resource.accesses && resource.accesses.length > 0;
    const hasAccess = resource.isFree || isPremium || hasIndividualAccess;

    return NextResponse.json(
      { 
        resource: {
          ...resource,
          hasAccess
        }, 
        subscription,
        userInfo: {
          isAdmin: userIsAdmin,
          isPremium,
          hasAccess
        }
      },
      { 
        headers: { 
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=300'
        } 
      }
    );
  } catch (error) {
    console.error('Erro ao buscar recurso:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar o recurso' },
      { status: 500 }
    );
  }
}