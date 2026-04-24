import { prisma } from './src/lib/db';

async function main() {
  const resources = await prisma.resource.findMany({
    where: {
      externalId: {
        in: [30356018, 38102381]
      }
    },
    select: {
      externalId: true,
      title: true,
      googleDriveUrl: true
    }
  });

  console.log(JSON.stringify(resources, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
