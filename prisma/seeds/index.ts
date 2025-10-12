import { PrismaClient } from '@prisma/client';
import { subjects } from './seed-subjects';
import { educationLevels } from './seed-education-levels';
import { seedBNCC } from './seed-bncc';
import { seedUsers } from './seed-users';
import { seedResources } from './seed-resources';
import { plansData } from './data-plans';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Usar TRUNCATE CASCADE para limpar todas as tabelas de uma vez
  // Ignora erros se as tabelas não existirem ainda
  try {
    await prisma.$executeRaw`
      TRUNCATE TABLE 
        "resource_bncc_code",
        "resource_file",
        "external_product_mapping",
        "user_resource_access",
        "resource",
        "bncc_code",
        "subject",
        "education_level",
        "push_subscription",
        "notification",
        "invitation",
        "member",
        "organization",
        "subscription",
        "plan",
        "session",
        "account",
        "verification",
        "user"
      CASCADE;
    `;
  } catch (error) {
    // Se as tabelas não existirem ainda, ignora o erro
    console.log('⚠️  Algumas tabelas ainda não existem (primeira execução)');
  }
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

    await prisma.plan.createMany({
      data: plansData
    });
    console.log('✅ Planos criados');
    
    await seedBNCC(prisma);
    
    await seedUsers(prisma);
    
    await seedResources(prisma);
    
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
