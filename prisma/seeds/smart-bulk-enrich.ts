import { PrismaClient } from '@db/client';

const SUBJECT_CODE_MAP: Record<string, string> = {
  'lingua-portuguesa': 'LP',
  'matematica': 'MA',
  'ciencias': 'CI',
  'historia': 'HI',
  'geografia': 'GE',
  'arte': 'AR',
  'educacao-fisica': 'EF',
  'lingua-inglesa': 'LI'
};

function getYearFromTitle(title: string): string | null {
  const match = title.match(/(\d+)\s*(º|o|°)?\s*ano/i);
  if (match) {
    const year = match[1];
    return year.padStart(2, '0');
  }
  return null;
}

export async function seedSmartEnrich(prisma: PrismaClient) {
  console.log('🚀 Iniciando Bulk Enrichment Inteligente...');

  // 1. Garantir um Autor Padrão Curadoria (Deixando o DB gerar o UUID)
  let curatorAuthor = await prisma.author.findFirst({
    where: { displayName: 'Equipe Pedagógica Kadernim' }
  });

  if (!curatorAuthor) {
    curatorAuthor = await prisma.author.create({
      data: {
        displayName: 'Equipe Pedagógica Kadernim',
        displayRole: 'Curadoria Oficial',
        location: 'Brasil',
        verified: true
      }
    });
  }

  const resources = await prisma.resource.findMany({
    include: {
      subject: true,
      educationLevel: true
    }
  });

  console.log(`📦 Processando ${resources.length} recursos...`);

  let count = 0;
  for (const resource of resources) {
    const year = getYearFromTitle(resource.title);
    const subCode = SUBJECT_CODE_MAP[resource.subject.slug];
    
    let skillsToLink: string[] = [];
    if (year && subCode) {
        // Tenta achar habilidades que começam com EF + ANO + SUBCODE (ex: EF05MA)
        const prefix = `EF${year}${subCode}`;
        const skillsFound = await prisma.bnccSkill.findMany({
            where: { code: { startsWith: prefix } },
            take: 2
        });
        skillsToLink = skillsFound.map(s => s.id);
    }

    // Se for Fundamental mas não achou ano no título, tenta pegar as primeiras da disciplina naquele nível
    if (skillsToLink.length === 0 && subCode) {
        const skillsFound = await prisma.bnccSkill.findMany({
            where: { 
                code: { contains: subCode },
                educationLevelId: resource.educationLevelId 
            },
            take: 2
        });
        skillsToLink = skillsFound.map(s => s.id);
    }

    const description = resource.description || `Explore este recurso completo de ${resource.subject.name} para o ${resource.educationLevel.name}, focado em desenvolver as habilidades essenciais da BNCC através de atividades lúdicas e práticas. Ideal para enriquecer o planejamento semanal do professor.`;

    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        description,
        authorId: resource.authorId || curatorAuthor.id,
        pedagogicalContent: {
            objectives: [
                { id: 'obj1', order: 1, text: `Dominar os conceitos base de ${resource.subject.name} previstos para esta etapa.` },
                { id: 'obj2', order: 2, text: 'Promover a autonomia do estudante através de atividades lúdicas.' }
            ],
            steps: [
                { id: 's1', order: 1, type: 'WARMUP', title: 'Contextualização', duration: '15 min', content: 'Inicie com perguntas disparadoras para identificar o que os alunos já sabem.' },
                { id: 's2', order: 2, type: 'DISTRIBUTION', title: 'Desenvolvimento', duration: '30 min', content: 'Aplique o material impresso/digital seguindo as orientações de cada página.' },
                { id: 's3', order: 3, type: 'CONCLUSION', title: 'Sistematização', duration: '15 min', content: 'Corrija coletivamente e reforce os conceitos principais aprendidos.' }
            ]
        }
      }
    });

    for (const skillId of skillsToLink) {
        await prisma.resourceBnccSkill.upsert({
            where: { resourceId_bnccSkillId: { resourceId: resource.id, bnccSkillId: skillId } },
            update: {},
            create: { resourceId: resource.id, bnccSkillId: skillId }
        });
    }

    count++;
    if (count % 100 === 0) console.log(`✅ ${count} recursos processados...`);
  }

  console.log('🏁 Bulk Enrichment Finalizado com sucesso!');
}
