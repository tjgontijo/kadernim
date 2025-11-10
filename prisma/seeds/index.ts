import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seed-users';
import { seedResources } from './seed-resources';
import { seedResourceFiles } from './seed-resource-files';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Usar deleteMany para limpar cada tabela (mais seguro que TRUNCATE)
  // Respeita as FK e não falha se tabelas não existem
  try {
    await prisma.resourceFile.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.user.deleteMany()
    await prisma.organization.deleteMany()
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    throw error;
  }
}

async function createInitialData() {
  console.log('🌱 Iniciando população do banco de dados...');

  try {
    console.log('🧹 Limpando banco de dados...');
    await cleanDatabase();
    console.log('✅ Banco de dados limpo.');

    await seedUsers(prisma);
    await seedResources(prisma);
    await seedResourceFiles(prisma);

    console.log('✅ População do banco de dados concluída com sucesso!');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Erro ao popular o banco de dados: ${error.message}`);
      console.error(error.stack);
    } else {
      console.error(`❌ Erro desconhecido ao popular o banco de dados: ${String(error)}`);
    }
    throw error;
  }
}

// Exportar a função main para ser usada em seed.ts
export async function main() {
  try {
    await createInitialData();
  } catch (error) {
    console.error('❌ Falha na execução do seed');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com o banco de dados encerrada.');
  }
}

if (require.main === module) {
  main();
}
