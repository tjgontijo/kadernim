import 'dotenv/config';
import { PrismaClient } from '@db/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../../src/lib/database/prisma-pg-config';

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
});

async function main() {
  console.log('🌱 Criando recurso de demonstração realístico...');

  // 1. Garantir Taxonomia
  const fund1 = await prisma.educationLevel.upsert({
    where: { slug: 'ensino-fundamental-1' },
    update: {},
    create: { name: 'Ensino Fundamental I', slug: 'ensino-fundamental-1' },
  });

  const mat = await prisma.subject.upsert({
    where: { slug: 'matematica' },
    update: {},
    create: { name: 'Matemática', slug: 'matematica' },
  });

  const grade = await prisma.grade.upsert({
    where: { slug: '2-ano' },
    update: {},
    create: { 
      name: '2º Ano', 
      slug: '2-ano',
      educationLevelId: fund1.id
    },
  });

  // 2. Criar Autor
  const author = await prisma.author.upsert({
    where: { id: 'a1111111-1111-1111-1111-111111111111' },
    update: {
      displayName: 'Beatriz Lisboa',
      displayRole: 'Professora de Ensino Fundamental',
      location: 'Belo Horizonte, MG',
      verified: true,
    },
    create: {
      id: 'a1111111-1111-1111-1111-111111111111',
      displayName: 'Beatriz Lisboa',
      displayRole: 'Professora de Ensino Fundamental',
      location: 'Belo Horizonte, MG',
      verified: true,
    },
  });

  // 3. Habilidades BNCC
  const skill1 = await prisma.bnccSkill.upsert({
    where: { code_gradeId: { code: 'EF02MA17', gradeId: grade.id } },
    update: {},
    create: { 
      code: 'EF02MA17', 
      description: 'Estimar, medir e comparar capacidades e massas, utilizando unidades de medida não-padronizadas.',
      educationLevelId: fund1.id,
      gradeId: grade.id
    },
  });

  const skill2 = await prisma.bnccSkill.upsert({
    where: { code_gradeId: { code: 'EF02MA19', gradeId: grade.id } },
    update: {},
    create: { 
      code: 'EF02MA19', 
      description: 'Medir a duração de um intervalo de tempo por meio de relógio digital.',
      educationLevelId: fund1.id,
      gradeId: grade.id
    },
  });

  // 4. Criar Recurso Central
  const resourceId = 'b2222222-2222-2222-2222-222222222222';
  const resource = await prisma.resource.upsert({
    where: { id: resourceId },
    update: {
      title: 'Dominó das frações equivalentes',
      slug: 'domino-das-fracoes-equivalentes',
      description: 'Uma atividade lúdica e dinâmica para consolidar o conceito de frações equivalentes. Os alunos devem associar representações visuais (pizzas, barras) às suas notações numéricas em um jogo de dominó coletivo.',
      educationLevelId: fund1.id,
      subjectId: mat.id,
      authorId: author.id,
      isCurated: true,
      curatedAt: new Date(),
      resourceType: 'PRINTABLE_ACTIVITY',
      pagesCount: 6,
      estimatedDurationMinutes: 50,
      isFree: false,
      pedagogicalContent: {
        objectives: [
          { id: 'obj1', order: 1, text: 'Reconhecer representações pictóricas de frações usuais em contextos do cotidiano.' },
          { id: 'obj2', order: 2, text: 'Associar a representação visual de uma fração à sua notação numérica correspondente.' },
          { id: 'obj3', order: 3, text: 'Comunicar oralmente o raciocínio utilizado para identificar a fração sorteada.' }
        ],
        steps: [
          { 
            id: 'step1', 
            order: 1, 
            type: 'DISCUSSION', 
            title: 'Aquecimento coletivo', 
            duration: '10 min', 
            content: 'Pergunte à turma e introduza meio, um terço e um quarto usando exemplos reais como frutas ou chocolate.' 
          },
          { 
            id: 'step2', 
            order: 2, 
            type: 'ACTIVITY', 
            title: 'Distribuição das cartelas', 
            duration: '5 min', 
            content: 'Entregue uma cartela e 12 fichas para cada estudante. Explique as regras do bingo de frações.' 
          },
          { 
            id: 'step3', 
            order: 3, 
            type: 'ACTIVITY', 
            title: 'Rodadas de bingo', 
            duration: '25 min', 
            content: 'Sorteie um cartão de chamada e apresente a fração visualmente. Os alunos devem identificar o correspondente numérico.' 
          },
          { 
            id: 'step4', 
            order: 4, 
            type: 'REFLECTION', 
            title: 'Conversa de fechamento', 
            duration: '10 min', 
            content: 'Pergunte qual fração foi mais difícil de identificar e por quê. Reforce os conceitos aprendidos.' 
          }
        ]
      }
    },
    create: {
      id: resourceId,
      slug: 'domino-das-fracoes-equivalentes',
      title: 'Dominó das frações equivalentes',
      description: 'Uma atividade lúdica e dinâmica para consolidar o conceito de frações equivalentes.',
      educationLevelId: fund1.id,
      subjectId: mat.id,
      authorId: author.id,
      isCurated: true,
      curatedAt: new Date(),
      resourceType: 'PRINTABLE_ACTIVITY',
      pagesCount: 6,
      estimatedDurationMinutes: 50,
      isFree: false,
      pedagogicalContent: {}
    }
  });

  // 5. Vincular BNCC
  await prisma.resourceBnccSkill.upsert({
    where: { 
      resourceId_bnccSkillId: { resourceId: resource.id, bnccSkillId: skill1.id } 
    },
    update: {},
    create: { resourceId: resource.id, bnccSkillId: skill1.id }
  });

  await prisma.resourceBnccSkill.upsert({
    where: { 
      resourceId_bnccSkillId: { resourceId: resource.id, bnccSkillId: skill2.id } 
    },
    update: {},
    create: { resourceId: resource.id, bnccSkillId: skill2.id }
  });

  // 6. Adicionar Reviews
  const demoUsers = await prisma.user.findMany({ take: 3 });
  if (demoUsers.length > 0) {
    for (let i = 0; i < demoUsers.length; i++) {
        const userId = demoUsers[i].id;
      await prisma.review.upsert({
        where: { 
           resourceId_userId: { resourceId: resource.id, userId: userId } 
        },
        update: {
          rating: 5 - i,
          comment: i === 0 ? 'Excelente material, usei na minha aula e os alunos adoraram!' : 'Muito bom, recomendo.',
          status: 'APPROVED'
        },
        create: {
          resourceId: resource.id,
          userId: userId,
          rating: 5 - i,
          comment: 'Ótimo material!',
          status: 'APPROVED'
        }
      });
    }

    // 7. Criar Recursos Relacionados
    const rel1 = await prisma.resource.upsert({
      where: { id: 'c3333333-3333-3333-3333-333333333333' },
      update: {},
      create: {
        id: 'c3333333-3333-3333-3333-333333333333',
        title: 'Bingo das quatro operações',
        slug: 'bingo-quatro-operacoes',
        educationLevelId: fund1.id,
        subjectId: mat.id,
        resourceType: 'GAME',
        isFree: true,
      }
    });

    const rel2 = await prisma.resource.upsert({
      where: { id: 'd4444444-4444-4444-4444-444444444444' },
      update: {},
      create: {
        id: 'd4444444-4444-4444-4444-444444444444',
        title: 'Trilha do sistema monetário',
        slug: 'trilha-sistema-monetario',
        educationLevelId: fund1.id,
        subjectId: mat.id,
        resourceType: 'GAME',
        isFree: false,
      }
    });

    await prisma.relatedResource.upsert({
      where: { sourceResourceId_targetResourceId: { sourceResourceId: resource.id, targetResourceId: rel1.id } },
      update: {},
      create: { 
        sourceResourceId: resource.id, 
        targetResourceId: rel1.id, 
        relationType: 'COMPLEMENTS',
        createdBy: demoUsers[0].id
      }
    });

    await prisma.relatedResource.upsert({
      where: { sourceResourceId_targetResourceId: { sourceResourceId: resource.id, targetResourceId: rel2.id } },
      update: {},
      create: { 
        sourceResourceId: resource.id, 
        targetResourceId: rel2.id, 
        relationType: 'RELATED_TOPIC',
        createdBy: demoUsers[0].id
      }
    });
  }

  // 8. Atualizar Cache de Notas
  const stats = await prisma.review.aggregate({
    where: { resourceId: resource.id, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.resource.update({
    where: { id: resource.id },
    data: {
      averageRating: stats._avg.rating || 4.8,
      reviewCount: stats._count.id || 47,
      downloadCount: 1240,
    }
  });

  console.log(`✅ Recurso "${resource.title}" populado com sucesso!`);
  console.log(`🔗 ID do recurso: ${resource.id}`);
  console.log(`🔗 Slug do recurso: ${resource.slug}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
