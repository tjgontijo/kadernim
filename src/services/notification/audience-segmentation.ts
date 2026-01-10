import { prisma } from '@/lib/db';
import { Prisma } from '../../prisma/generated/prisma';

/**
 * Audience Segmentation Service
 *
 * Constrói queries complexas para filtrar usuários baseado em critérios de segmentação.
 * Usado para campanhas de push notifications e outros tipos de notificações.
 */

export interface AudienceFilter {
  roles?: string[]; // ['user', 'subscriber', 'editor']
  hasSubscription?: 'all' | 'subscribers' | 'non-subscribers';
  activeInDays?: number | null; // Ativos nos últimos X dias
  inactiveForDays?: number | null; // Inativos há mais de X dias
}

/**
 * Constrói o filtro Prisma para o modelo User baseado nos critérios de audiência
 */
export function buildUserFilter(audience: AudienceFilter): Prisma.UserWhereInput {
  const filters: Prisma.UserWhereInput = {
    banned: false, // Sempre excluir usuários banidos
  };

  // Filtro por roles
  if (audience.roles && audience.roles.length > 0) {
    filters.role = {
      in: audience.roles as any[],
    };
  }

  // Filtro por assinatura
  if (audience.hasSubscription === 'subscribers') {
    filters.subscription = {
      isNot: null,
      isActive: true,
    };
  } else if (audience.hasSubscription === 'non-subscribers') {
    filters.OR = [
      { subscription: null },
      { subscription: { isActive: false } },
    ];
  }

  // Filtro por atividade recente
  if (audience.activeInDays && audience.activeInDays > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - audience.activeInDays);

    filters.sessions = {
      some: {
        createdAt: {
          gte: cutoffDate,
        },
      },
    };
  }

  // Filtro por inatividade
  if (audience.inactiveForDays && audience.inactiveForDays > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - audience.inactiveForDays);

    // Usuários que NÃO têm sessões recentes
    filters.sessions = {
      none: {
        createdAt: {
          gte: cutoffDate,
        },
      },
    };
  }

  return filters;
}

/**
 * Busca IDs de usuários que atendem os critérios de segmentação
 */
export async function getAudienceUserIds(audience: AudienceFilter): Promise<string[]> {
  const userFilter = buildUserFilter(audience);

  const users = await prisma.user.findMany({
    where: userFilter,
    select: { id: true },
  });

  return users.map((u) => u.id);
}

/**
 * Conta quantos usuários atendem os critérios de segmentação
 */
export async function countAudienceUsers(audience: AudienceFilter): Promise<number> {
  const userFilter = buildUserFilter(audience);
  return prisma.user.count({ where: userFilter });
}

/**
 * Busca subscriptions ativas de push para usuários segmentados
 *
 * Retorna apenas subscriptions de usuários que atendem os critérios de audiência
 */
export async function getSegmentedPushSubscriptions(audience: AudienceFilter) {
  const userFilter = buildUserFilter(audience);

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      active: true,
      user: userFilter, // JOIN com User aplicando os filtros de segmentação
    },
    select: {
      id: true,
      endpoint: true,
      auth: true,
      p256dh: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return subscriptions;
}

/**
 * Preview da audiência - útil para mostrar no admin quantos usuários serão atingidos
 */
export async function previewAudience(audience: AudienceFilter) {
  const [totalUsers, withPushSubscriptions, userFilter] = await Promise.all([
    countAudienceUsers(audience),
    prisma.pushSubscription.count({
      where: {
        active: true,
        user: buildUserFilter(audience),
      },
    }),
    buildUserFilter(audience),
  ]);

  // Amostra de usuários (primeiros 5)
  const sampleUsers = await prisma.user.findMany({
    where: userFilter,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    take: 5,
  });

  return {
    totalUsers,
    withPushSubscriptions,
    sampleUsers,
    filters: audience,
  };
}
