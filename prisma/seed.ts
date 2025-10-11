import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/user";
import { seedBase } from "./seeds/base";
import { seedBNCC } from "./seeds/bncc";
import { seedResources } from "./seeds/resources";

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando população do banco de dados...');
    
    try {
        // 1. Criar usuários
        await seedUsers(prisma);
        
        // 2. Criar dados base (níveis de ensino e disciplinas)
        await seedBase(prisma);
        
        // 3. Criar códigos BNCC
        await seedBNCC(prisma);
        
        // 4. Criar recursos pedagógicos
        await seedResources(prisma);
        
        console.log('✅ População do banco de dados concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao popular o banco de dados:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
