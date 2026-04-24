import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../src/lib/database/prisma-pg-config';

async function checkDates() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
  });
  
  const resourceId = 'c835b7f9-4e3a-4bea-a80d-abe070af6710';
  
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        title: true,
        curatedAt: true,
        updatedAt: true,
        createdAt: true
      }
    });

    console.log(JSON.stringify(resource, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDates();
