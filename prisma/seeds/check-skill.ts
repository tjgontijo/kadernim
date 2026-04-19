import 'dotenv/config';
import { PrismaClient } from '@db/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../../src/lib/database/prisma-pg-config';

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
});

async function main() {
  const skill = await prisma.bnccSkill.findFirst({
    where: { code: 'EF69AR16' },
  });
  console.log(JSON.stringify(skill, null, 2));
}

main().finally(() => prisma.$disconnect());
