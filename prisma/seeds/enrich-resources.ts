import { PrismaClient } from '@db/client';
import { fakerPT_BR as faker } from '@faker-js/faker';

export async function seedEnrichResources(prisma: PrismaClient) {
  console.log('🌟 Iniciando Enriquecimento Inteligente de Materiais...');

  // 1. Criar alguns autores fictícios premium
  const authors = [];
  for (let i = 0; i < 5; i++) {
    const author = await prisma.author.create({
      data: {
        displayName: faker.person.fullName(),
        displayRole: faker.helpers.arrayElement([
          'Professora de Educação Infantil',
          'Pedagoga e Escritora',
          'Especialista em Alfabetização',
          'Mestre em Educação Matemática',
          'Coordenadora Pedagógica'
        ]),
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
        verified: faker.datatype.boolean(0.8),
      }
    });
    authors.push(author);
  }

  // 2. Localizar recursos específicos para enriquecer
  const resourcesToEnrich = [
    {
      title: '40 Páginas de Atividades de Matemática para 5º ANO',
      description: 'Um guia completo para o 5º ano cobrindo números decimais, frações, geometria e lógica. Ideal para reforço escolar e preparação para avaliações.',
      skills: ['EF05MA01', 'EF05MA07', 'EF05MA15'],
      objectives: [
        'Resolver problemas com números naturais e decimais.',
        'Identificar frações equivalentes em diferentes contextos.',
        'Desenvolver o raciocínio lógico através de desafios matemáticos.'
      ]
    },
    {
      title: 'Alfabeto em Pixel Art',
      description: 'Uma abordagem lúdica e visual para o reconhecimento das letras. Unindo tecnologia (base do sistema binário/pixel) com alfabetização tradicional.',
      skills: ['EF01LP04', 'EF01LP10'],
      objectives: [
        'Reconhecer as letras do alfabeto e seus sons.',
        'Diferenciar letras de outros símbolos.',
        'Promover a coordenação motora fina através do preenchimento de pixels.'
      ]
    },
    {
      title: 'Fração em Pixel Art',
      description: 'Transforme o aprendizado de frações em uma experiência visual incrível. Os alunos pintam pixels para representar partes de um todo.',
      skills: ['EF04MA09', 'EF05MA03'],
      objectives: [
        'Representar frações visualmente.',
        'Comparar frações com denominadores diferentes.',
        'Associar a representação pictórica à numérica.'
      ]
    }
  ];

  for (const item of resourcesToEnrich) {
    const resource = await prisma.resource.findFirst({
        where: { title: item.title }
    });

    if (resource) {
        console.log(`✨ Enriquecendo: ${item.title}`);
        
        // Link Author
        const randomAuthor = faker.helpers.arrayElement(authors);
        
        // Find Skills in DB
        const skillsFound = await prisma.bnccSkill.findMany({
            where: { code: { in: item.skills } }
        });

        // Update Resource
        await prisma.resource.update({
            where: { id: resource.id },
            data: {
                description: item.description,
                authorId: randomAuthor.id,
                pedagogicalContent: {
                    objectives: item.objectives.map((text, i) => ({ id: `obj-${i}`, order: i + 1, text })),
                    steps: [
                        { id: 's1', order: 1, type: 'WARMUP', title: 'Introdução', duration: '15 min', content: 'Inicie com uma conversa sobre o tema, levantando conhecimentos prévios.' },
                        { id: 's2', order: 2, type: 'DISTRIBUTION', title: 'Mão na Massa', duration: '30 min', content: 'Aplique as folhas de atividades propostas neste material.' },
                        { id: 's3', order: 3, type: 'CONCLUSION', title: 'Encerramento', duration: '15 min', content: 'Socialize os resultados e tire dúvidas finais.' }
                    ]
                }
            }
        });

        // Link BNCC Skills
        for (const skill of skillsFound) {
            await prisma.resourceBnccSkill.upsert({
                where: { resourceId_bnccSkillId: { resourceId: resource.id, bnccSkillId: skill.id } },
                update: {},
                create: { resourceId: resource.id, bnccSkillId: skill.id }
            });
        }

        // Add 3-5 Reviews
        for (let j = 0; j < faker.number.int({ min: 3, max: 7 }); j++) {
            const user = await prisma.user.findFirst({ skip: faker.number.int({ min: 0, max: 10 }) });
            if (user) {
                await prisma.review.upsert({
                    where: { resourceId_userId: { resourceId: resource.id, userId: user.id } },
                    update: {},
                    create: {
                        resourceId: resource.id,
                        userId: user.id,
                        rating: faker.number.int({ min: 4, max: 5 }),
                        comment: faker.helpers.arrayElement([
                            'Material maravilhoso! Meus alunos adoraram.',
                            'Muito prático e direto ao ponto. Recomendo.',
                            'Excelente qualidade pedagógica. Parabéns ao autor!',
                            'Salvou meu planejamento da semana!',
                            'As ilustrações são lindas e o conteúdo muito bem organizado.'
                        ]),
                        status: 'APPROVED'
                    }
                });
            }
        }
    }
  }

  console.log('✅ Enriquecimento concluído!');
}
