import 'dotenv/config';
import { PrismaClient } from '../../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../../src/lib/database/prisma-pg-config';

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
});

// ADICIONE SEU EMAIL AQUI PARA NÃO SER APAGADO
const PROTECTED_EMAILS = [
  'thiago@kadernim.com.br', // Exemplo
  // adicione outros se necessário
];

async function main() {
  console.log('🧹 Iniciando limpeza de dados fakes...');

  try {
    // 1. Apagar todas as avaliações
    const reviewsDeleted = await prisma.review.deleteMany({});
    console.log(`✅ ${reviewsDeleted.count} avaliações removidas.`);

    // 2. Apagar usuários que NÃO estão na lista de protegidos
    // E que não são admins (por segurança extra)
    const usersDeleted = await prisma.user.deleteMany({
      where: {
        AND: [
          { email: { notIn: PROTECTED_EMAILS } },
          { role: { not: 'admin' } }
        ]
      }
    });
    console.log(`✅ ${usersDeleted.count} usuários removidos.`);

    // 3. Resetar contadores nos recursos (opcional, mas recomendado)
    await prisma.resource.updateMany({
      data: {
        reviewCount: 0,
        averageRating: 0
      }
    });
    console.log('✅ Contadores de recursos resetados.');

    console.log('\n✨ Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
