import { PrismaClient, Subject, EducationLevel, StorageType, Prisma } from '@prisma/client';
import { resourcesData } from './data-resources';

// Helper para delay entre operações
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper para processar em batches
async function processBatch<T>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));
    
    // Delay entre batches para evitar sobrecarga
    if (i + batchSize < items.length) {
      await delay(100);
    }
  }
}

export async function seedResources(prisma: PrismaClient) {
  console.log('🌱 Populando recursos...');
  console.log(`Preparando ${resourcesData.length} recursos...`);
  
  // Cache de subjects e education levels para evitar queries repetidas
  const subjects = await prisma.subject.findMany();
  const educationLevels = await prisma.educationLevel.findMany();

  const subjectMap = new Map(subjects.map((s: Subject) => [s.name, s]));
  const educationLevelMap = new Map(educationLevels.map((e: EducationLevel) => [e.name, e]));
  
  let successCount = 0;
  let errorCount = 0;
  
  // Processar em batches de 10 recursos por vez
  await processBatch(resourcesData, 10, async (resourceData) => {
    try {
      const { subjectName, educationLevelName, files, externalMappings, ...resourceFields } = resourceData;

      // Buscar do cache
      const subject = subjectMap.get(subjectName);
      const educationLevel = educationLevelMap.get(educationLevelName);
      
      if (!subject || !educationLevel) {
        console.error(`❌ Subject ou EducationLevel não encontrado para ${resourceData.title}`);
        errorCount++;
        return;
      }
      
      // Criar recurso
      const resource = await prisma.resource.create({
        data: {
          ...resourceFields,
          subjectId: subject.id,
          educationLevelId: educationLevel.id
        }
      });
      
      // Criar arquivos (se houver)
      if (files && files.length > 0) {
        await prisma.resourceFile.createMany({
          data: files.map((file: unknown) => {
            const f = file as { storageType: string; externalUrl?: string | null; fileName?: string | null; fileType?: string | null; storageKey?: string | null; metadata?: Prisma.InputJsonValue };
            return {
              resourceId: resource.id,
              storageType: f.storageType as StorageType,
              externalUrl: f.externalUrl ?? null,
              fileName: f.fileName ?? null,
              fileType: f.fileType ?? null,
              storageKey: f.storageKey ?? null,
              metadata: f.metadata ?? undefined
            };
          }),
          skipDuplicates: true
        });
      }
      
      // Criar mapeamentos externos (se houver)
      if (externalMappings && externalMappings.length > 0) {
        await prisma.externalProductMapping.createMany({
          data: externalMappings.map(mapping => ({
            resourceId: resource.id,
            productId: mapping.productId || null,
            store: mapping.store || null
          })),
          skipDuplicates: true
        });
      }
      
      successCount++;
      console.log(`✅ Recurso criado: ${resource.title}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao criar recurso ${resourceData.title}:`, error);
    }
  });
  
  console.log(`✅ Recursos populados: ${successCount} sucesso, ${errorCount} erros`);
}
