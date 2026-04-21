import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../src/lib/database/prisma-pg-config';
import { seedTaxonomy } from '../prisma/seeds/seed-taxonomy';

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
});

async function main() {
  console.log('🚀 Iniciando atualização isolada das Cores das Disciplinas...');
  try {
    await seedTaxonomy(prisma);
    console.log('✅ Cores e Taxonomia atualizadas com sucesso sem afetar outros dados!');
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
