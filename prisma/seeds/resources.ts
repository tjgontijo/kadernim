import { PrismaClient } from '@prisma/client';

type ResourceData = {
  title: string;
  description: string;
  imageUrl: string;
  isFree: boolean;
  featured: boolean;
  subjectSlug: string;
  educationLevelSlug: string;
  externalId: string;
  bnccCodes: string[];
  link?: string;
};

// Lista de recursos pedagógicos
const resourcesData: ResourceData[] = [
  {
    title: "Traçando os Números",
    description: "Atividade para traçar números para educação infantil.",
    imageUrl: "https://placehold.co/600x400?text=Traçando+os+Números",
    isFree: true,
    featured: false,
    subjectSlug: "matematica",
    educationLevelSlug: "educacao-infantil",
    externalId: "TRACAR001",
    bnccCodes: ["EI03ET03", "EI03ET05"],
    link: "https://drive.google.com/file/d/example1"
  },
  {
    title: "Cartaz Número do dia",
    description: "Cartaz para trabalhar o número do dia na educação infantil.",
    imageUrl: "https://placehold.co/600x400?text=Cartaz+Número+do+dia",
    isFree: true,
    featured: false,
    subjectSlug: "matematica",
    educationLevelSlug: "educacao-infantil",
    externalId: "CARTAZ001",
    bnccCodes: ["EI03ET02", "EI03ET05"],
    link: "https://drive.google.com/file/d/example2"
  },
  {
    title: "Alfabeto na Caixa",
    description: "Atividade para trabalhar o alfabeto na educação infantil.",
    imageUrl: "https://placehold.co/600x400?text=Alfabeto+na+Caixa",
    isFree: true,
    featured: false,
    subjectSlug: "portugues",
    educationLevelSlug: "educacao-infantil",
    externalId: "ALFCAIXA001",
    bnccCodes: ["EI03EF03", "EI03EF04"],
    link: "https://drive.google.com/file/d/example3"
  },
  {
    title: "Atividade Eu sou assim",
    description: "Atividade para trabalhar autoconhecimento na educação infantil.",
    imageUrl: "https://placehold.co/600x400?text=Atividade+Eu+sou+assim",
    isFree: true,
    featured: false,
    subjectSlug: "ciencias",
    educationLevelSlug: "educacao-infantil",
    externalId: "EUSOU001",
    bnccCodes: ["EI03EO01", "EI03EO02"],
    link: "https://drive.google.com/file/d/example4"
  },
  {
    title: "Baú dos Tesouros",
    description: "Atividade socioemocional para educação infantil.",
    imageUrl: "https://placehold.co/600x400?text=Baú+dos+Tesouros",
    isFree: false,
    featured: true,
    subjectSlug: "socioemocional",
    educationLevelSlug: "educacao-infantil",
    externalId: "BAUTESOURO001",
    bnccCodes: ["EI03EO03", "EI03EO04"],
    link: "https://drive.google.com/file/d/example5"
  },
  {
    title: "Manual dos Relatórios",
    description: "Manual para elaboração de relatórios para docentes.",
    imageUrl: "https://placehold.co/600x400?text=Manual+dos+Relatórios",
    isFree: false,
    featured: true,
    subjectSlug: "administrativo",
    educationLevelSlug: "docente",
    externalId: "MANUAL001",
    bnccCodes: [],
    link: "https://drive.google.com/file/d/example6"
  }
];

// Função auxiliar para criar recursos
async function createResource(prisma: PrismaClient, data: ResourceData) {
  if (!data.subjectSlug || !data.educationLevelSlug) {
    console.error(`Erro ao criar recurso ${data.title}: disciplina ou nível de ensino não encontrado`);
    return null;
  }

  const subject = await prisma.subject.findUnique({
    where: { slug: data.subjectSlug }
  });

  const educationLevel = await prisma.educationLevel.findUnique({
    where: { slug: data.educationLevelSlug }
  });

  if (!subject || !educationLevel) {
    console.error(`Erro ao criar recurso ${data.title}: disciplina ou nível de ensino não encontrado`);
    return null;
  }

  // Verificar se o recurso já existe
  let resource = await prisma.resource.findFirst({
    where: { title: data.title }
  });

  if (!resource) {
    // Criar o recurso se não existir
    resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isFree: data.isFree,
        subjectId: subject.id,
        educationLevelId: educationLevel.id,
        featured: data.featured
      }
    });
  } else {
    // Atualizar o recurso existente
    resource = await prisma.resource.update({
      where: { id: resource.id },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        isFree: data.isFree,
        subjectId: subject.id,
        educationLevelId: educationLevel.id,
        featured: data.featured
      }
    });
  }

  // Criar ou atualizar o mapeamento externo
  if (data.externalId) {
    await (prisma as any)['ExternalProductMapping'].upsert({
      where: {
        externalId_platform_storeId: {
          externalId: data.externalId,
          platform: 'yampi',
          storeId: 'loja01'
        }
      },
      update: {
        resourceId: resource.id
      },
      create: {
        externalId: data.externalId,
        platform: 'yampi',
        storeId: 'loja01',
        resourceId: resource.id
      }
    });
  }

  // Adicionar códigos BNCC
  if (data.bnccCodes && data.bnccCodes.length > 0) {
    for (const codeStr of data.bnccCodes) {
      const bnccCode = await (prisma as any)['BNCCCode'].findUnique({
        where: { code: codeStr }
      });

      if (bnccCode) {
        await (prisma as any)['ResourceBNCCCode'].upsert({
          where: {
            id: `${resource.id}-${bnccCode.id}`
          },
          update: {},
          create: {
            id: `${resource.id}-${bnccCode.id}`,
            resourceId: resource.id,
            bnccCodeId: bnccCode.id
          }
        });
      }
    }
  }

  // Adicionar arquivo padrão ao recurso
  await (prisma as any)['ResourceFile'].upsert({
    where: {
      id: `${resource.id}-file1`
    },
    update: {
      fileName: `${data.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      fileType: 'application/pdf',
      externalUrl: data.link || 'https://drive.google.com/file/d/example'
    },
    create: {
      id: `${resource.id}-file1`,
      fileName: `${data.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
      fileType: 'application/pdf',
      externalUrl: data.link || 'https://drive.google.com/file/d/example',
      resourceId: resource.id
    }
  });

  return resource;
}

export async function seedResources(prisma: PrismaClient) {
  console.log('🌱 Populando recursos pedagógicos...');
  
  // Criar os recursos
  for (const resourceData of resourcesData) {
    const resource = await createResource(prisma, resourceData);
    if (resource) {
      console.log(`Recurso criado/atualizado: ${resourceData.title}`);
    }
  }
  
  console.log('✅ Recursos pedagógicos populados com sucesso!');
}
