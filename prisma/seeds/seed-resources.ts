import { PrismaClient } from '@prisma/client';
import { resourcesData } from './data-resources';

export async function seedResources(prisma: PrismaClient) {
  console.log('🌱 Populando recursos...');
  
  for (const resourceData of resourcesData) {
    const { subjectSlug, educationLevelSlug, files, externalMappings, ...resourceFields } = resourceData;
    
    // Buscar subject e educationLevel
    const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug } });
    const educationLevel = await prisma.educationLevel.findUnique({ where: { slug: educationLevelSlug } });
    
    if (!subject || !educationLevel) {
      console.error(`❌ Subject ou EducationLevel não encontrado para ${resourceData.title}`);
      continue;
    }
    
    // Criar recurso
    const resource = await prisma.resource.create({
      data: {
        ...resourceFields,
        subjectId: subject.id,
        educationLevelId: educationLevel.id
      }
    });
    
    // Criar arquivos
    if (files && files.length > 0) {
      await prisma.resourceFile.createMany({
        data: files.map((file: any) => ({
          resourceId: resource.id,
          storageType: file.storageType as any,
          externalUrl: file.externalUrl,
          fileName: file.fileName,
          fileType: file.fileType,
          storageKey: file.storageKey,
          metadata: file.metadata
        }))
      });
    }
    
    // Criar mapeamentos externos
    if (externalMappings && externalMappings.length > 0) {
      await prisma.externalProductMapping.createMany({
        data: externalMappings.map(mapping => ({
          resourceId: resource.id,
          ...mapping
        }))
      });
    }
    
    console.log(`✅ Recurso criado: ${resource.title}`);
  }
  
  console.log('✅ Recursos populados com sucesso!');
}
