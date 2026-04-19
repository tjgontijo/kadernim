import { PrismaClient } from '@db/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

export async function seedRelatedResources(prisma: PrismaClient) {
  console.log('🔗 Gerando Recursos Relacionados (Combina com...)...');

  const resources = await prisma.resource.findMany({ take: 100 });
  const adminUser = await prisma.user.findFirst({
    where: { role: { in: ['admin', 'manager', 'editor'] } }
  });

  if (resources.length < 2 || !adminUser) {
    console.log('⚠️  Sem recursos ou admin para criar relações. Pulando...');
    return;
  }

  let relationCount = 0;
  const relationTypes = ['COMPLEMENTS', 'PREREQUISITE', 'ADVANCED', 'RELATED_TOPIC'];

  // Para cada recurso, criar 2-4 relacionamentos
  for (let i = 0; i < Math.min(resources.length, 50); i++) {
    const sourceResource = resources[i];
    const relatedCount = faker.number.int({ min: 2, max: 4 });

    // Pegar recursos relacionados (excluindo o próprio)
    const possibleTargets = resources.filter(
      (r, idx) => idx !== i && Math.abs(idx - i) <= 20 // Próximos na lista para similaridade
    );

    if (possibleTargets.length === 0) continue;

    const selectedTargets = faker.helpers.arrayElements(possibleTargets, relatedCount);

    for (const targetResource of selectedTargets) {
      try {
        await prisma.relatedResource.create({
          data: {
            sourceResourceId: sourceResource.id,
            targetResourceId: targetResource.id,
            relationType: faker.helpers.arrayElement(
              relationTypes
            ) as 'COMPLEMENTS' | 'PREREQUISITE' | 'ADVANCED' | 'RELATED_TOPIC',
            relevanceScore: faker.number.int({ min: 2, max: 5 }),
            createdBy: adminUser.id
          }
        });
        relationCount++;
      } catch (err) {
        // Ignorar duplicatas (unique constraint)
        if ((err as any)?.code !== 'P2002') {
          console.error('Erro ao criar relação:', err);
        }
      }
    }
  }

  console.log(`✅ ${relationCount} relacionamentos criados!`);
}
