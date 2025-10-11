import { PrismaClient } from '@prisma/client';
import { subjects } from './seed-subjects';
import { educationLevels } from './seed-education-levels';
import { seedBNCC } from './seed-bncc';
import { seedUsers } from './seed-users';

const prisma = new PrismaClient();

async function cleanDatabase() {  
  await prisma.resourceBNCCCode.deleteMany();
  await prisma.resourceFile.deleteMany();
  await prisma.externalProductMapping.deleteMany();
  await prisma.userResourceAccess.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.bNCCCode.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.educationLevel.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.member.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

async function createInitialData() {
  console.log('🌱 Iniciando população do banco de dados...');
  
  try {    
    console.log('🧹 Limpando banco de dados...');
    await cleanDatabase();
    console.log('✅ Banco de dados limpo.');
        
    await prisma.educationLevel.createMany({
      data: educationLevels
    });
    console.log('✅ Níveis de ensino criados');
    
    await prisma.subject.createMany({
      data: subjects
    });
    console.log('✅ Disciplinas criadas');
    
    // Inserir códigos BNCC usando a função otimizada
    await seedBNCC(prisma);
    
    // Inserir usuários
    await seedUsers(prisma);
    
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
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com o banco de dados encerrada.');
  }
}

if (require.main === module) {
  main();
}
