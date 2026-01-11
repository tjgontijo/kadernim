import { PrismaClient } from '@db/client';

export async function seedSystemConfig(prisma: PrismaClient) {
  console.log('⚙️  Criando configurações do sistema...');

  const configs = [
    // ============================================
    // COMMUNITY - Votos por Role
    // ============================================
    {
      key: 'community.votes.subscriber',
      value: '5',
      type: 'number' as const,
      category: 'community',
      label: 'Votos por mês (assinante)',
      description: 'Número máximo de votos mensais para usuários assinantes'
    },
    {
      key: 'community.votes.editor',
      value: '10',
      type: 'number' as const,
      category: 'community',
      label: 'Votos por mês (editor)',
      description: 'Número máximo de votos mensais para editores'
    },
    {
      key: 'community.votes.manager',
      value: '20',
      type: 'number' as const,
      category: 'community',
      label: 'Votos por mês (gerente)',
      description: 'Número máximo de votos mensais para gerentes'
    },
    {
      key: 'community.votes.admin',
      value: '999',
      type: 'number' as const,
      category: 'community',
      label: 'Votos por mês (admin)',
      description: 'Número máximo de votos mensais para administradores'
    },

    // ============================================
    // COMMUNITY - Solicitações
    // ============================================
    {
      key: 'community.requests.limit',
      value: '1',
      type: 'number' as const,
      category: 'community',
      label: 'Solicitações por mês',
      description: 'Número máximo de solicitações que um usuário pode criar por mês'
    },
    {
      key: 'community.requests.minVotes',
      value: '1',
      type: 'number' as const,
      category: 'community',
      label: 'Votos mínimos para criar',
      description: 'Número mínimo de votos necessários antes de poder criar uma solicitação'
    },

    // ============================================
    // COMMUNITY - Uploads
    // ============================================
    {
      key: 'community.uploads.maxFiles',
      value: '5',
      type: 'number' as const,
      category: 'community',
      label: 'Máx arquivos por solicitação',
      description: 'Número máximo de arquivos que podem ser enviados por solicitação'
    },
    {
      key: 'community.uploads.maxSizeMB',
      value: '2',
      type: 'number' as const,
      category: 'community',
      label: 'Máx tamanho por arquivo (MB)',
      description: 'Tamanho máximo permitido por arquivo em megabytes'
    },

    // ============================================
    // COMMUNITY - BNCC
    // ============================================
    {
      key: 'community.bncc.maxSkills',
      value: '5',
      type: 'number' as const,
      category: 'community',
      label: 'Máx habilidades BNCC',
      description: 'Número máximo de habilidades BNCC que podem ser selecionadas por solicitação'
    },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      create: config,
      update: {
        value: config.value,
        type: config.type,
        label: config.label,
        description: config.description,
        category: config.category,
      }
    });
  }

  console.log(`✅ ${configs.length} configurações criadas/atualizadas`);
}
