import { PrismaClient } from '@db/client';

export async function seedSystemConfig(prisma: PrismaClient) {
  console.log('⚙️  Criando configurações do sistema...');

  const configs = [
    // ============================================
    // COMMUNITY - Solicitações
    // ============================================
    {
      key: 'community.requests.limit',
      value: '10',
      type: 'number' as const,
      category: 'community',
      label: 'Solicitações por mês',
      description: 'Número máximo de solicitações que um usuário pode criar por mês'
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
