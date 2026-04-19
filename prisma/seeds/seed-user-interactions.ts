import { PrismaClient } from '@db/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

export async function seedUserInteractions(prisma: PrismaClient) {
  console.log('💾 Gerando Interações de Usuários (Salvos, Planejados)...');

  const users = await prisma.user.findMany({ take: 15 });
  const resources = await prisma.resource.findMany({ take: 80 });

  if (users.length === 0 || resources.length === 0) {
    console.log('⚠️  Sem usuários ou recursos para criar interações. Pulando...');
    return;
  }

  let interactionCount = 0;

  for (const user of users) {
    // 1. Cada usuário salva 5-15 recursos
    const savedCount = faker.number.int({ min: 5, max: 15 });
    const savedResources = faker.helpers.arrayElements(resources, savedCount);

    for (const resource of savedResources) {
      await prisma.userResourceInteraction.upsert({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id }
        },
        update: {
          isSaved: true,
          savedAt: faker.date.past({ years: 1 })
        },
        create: {
          userId: user.id,
          resourceId: resource.id,
          isSaved: true,
          savedAt: faker.date.past({ years: 1 })
        }
      });
      interactionCount++;
    }

    // 2. Cada usuário planeja 3-8 recursos para datas futuras
    const plannedCount = faker.number.int({ min: 3, max: 8 });
    const plannedResources = faker.helpers.arrayElements(
      resources.filter(r => !savedResources.some(s => s.id === r.id)),
      plannedCount
    );

    for (const resource of plannedResources) {
      await prisma.userResourceInteraction.upsert({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id }
        },
        update: {
          isPlanned: true,
          plannedFor: faker.date.soon({ days: 30 })
        },
        create: {
          userId: user.id,
          resourceId: resource.id,
          isPlanned: true,
          plannedFor: faker.date.soon({ days: 30 })
        }
      });
      interactionCount++;
    }

    // 3. Alguns recursos têm ambas (salvo E planejado)
    const bothCount = faker.number.int({ min: 2, max: 5 });
    const bothResources = faker.helpers.arrayElements(
      resources.filter(
        r =>
          !savedResources.some(s => s.id === r.id) &&
          !plannedResources.some(p => p.id === r.id)
      ),
      bothCount
    );

    for (const resource of bothResources) {
      await prisma.userResourceInteraction.upsert({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id }
        },
        update: {
          isSaved: true,
          isPlanned: true,
          savedAt: faker.date.past({ years: 1 }),
          plannedFor: faker.date.soon({ days: 30 })
        },
        create: {
          userId: user.id,
          resourceId: resource.id,
          isSaved: true,
          isPlanned: true,
          savedAt: faker.date.past({ years: 1 }),
          plannedFor: faker.date.soon({ days: 30 })
        }
      });
      interactionCount++;
    }

    // 4. Simular alguns downloads (20% dos recursos interagidos)
    const downloadResources = faker.helpers.arrayElements(
      [...savedResources, ...plannedResources, ...bothResources],
      Math.floor(([...savedResources, ...plannedResources, ...bothResources].length * 0.2) || 1)
    );

    for (const resource of downloadResources) {
      const downloadCount = faker.number.int({ min: 1, max: 5 });
      await prisma.userResourceInteraction.upsert({
        where: {
          userId_resourceId: { userId: user.id, resourceId: resource.id }
        },
        update: {
          hasDownloaded: true,
          downloadedAt: faker.date.past({ years: 1 }),
          downloadCount: { increment: downloadCount }
        },
        create: {
          userId: user.id,
          resourceId: resource.id,
          hasDownloaded: true,
          downloadedAt: faker.date.past({ years: 1 }),
          downloadCount
        }
      });
      interactionCount++;
    }
  }

  console.log(`✅ ${interactionCount} interações criadas!`);
}
