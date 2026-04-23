import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../src/lib/database/prisma-pg-config';
import { orchestrateResourceEnrichment } from '../src/mastra/agents/enrichment';
import { fakerPT_BR as faker } from '@faker-js/faker';

const prisma = new PrismaClient({
  adapter: new PrismaPg(createPrismaPgPoolConfig(process.env.DATABASE_URL!)),
});

async function main() {
  console.log('🚀 Iniciando Pipeline de Enriquecimento (Mastra Workflow)...');

  try {
    // SETUP: Autor e Dados Básicos
    let curatorAuthor = await prisma.author.findFirst({ where: { displayName: 'Equipe Pedagógica Kadernim' } });
    if (!curatorAuthor) {
      curatorAuthor = await prisma.author.create({
        data: { displayName: 'Equipe Pedagógica Kadernim', displayRole: 'Curadoria Oficial', location: 'Brasil', verified: true }
      });
    }

    const resources = await prisma.resource.findMany({ include: { subject: true, educationLevel: true } });
    const allGrades = await prisma.grade.findMany({ select: { id: true, slug: true } });
    const gradeSlugs = allGrades.map(g => g.slug);

    console.log(`📦 Processando ${resources.length} recursos...`);

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      console.log(`\n[${i + 1}/${resources.length}] 🛠️  Processando: "${resource.title}"`);

      try {
        // 1. RODAR ORQUESTRADOR DE AGENTES (Seguindo o padrão lesson-plans)
        const result = await orchestrateResourceEnrichment({
          resourceTitle: resource.title,
          subjectName: resource.subject.name,
          educationLevelName: resource.educationLevel.name,
          availableGrades: gradeSlugs
        });

        const pedagogicalData = result.pedagogical;
        const reviewsData = result.reviews;

        if (!pedagogicalData || !reviewsData) continue;

        // 2. PERSISTÊNCIA (Limpeza Cirúrgica)
        await prisma.$transaction([
          prisma.resourceBnccSkill.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceGrade.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceObjective.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceStep.deleteMany({ where: { resourceId: resource.id } }),
          prisma.review.deleteMany({ where: { resourceId: resource.id } }),
        ]);

        // Mapear Skills Únicas no Banco
        const skillsInDb = await prisma.bnccSkill.findMany({
          where: { code: { in: pedagogicalData.bnccCodes } },
          select: { id: true, code: true }
        });
        const uniqueSkillsIds = Array.from(new Map(skillsInDb.map(s => [s.code, s.id])).values());
        const gradesInDb = allGrades.filter(g => pedagogicalData.grades.includes(g.slug));

        // Update Resource
        await prisma.resource.update({
          where: { id: resource.id },
          data: {
            description: pedagogicalData.description,
            authorId: curatorAuthor.id,
            objectives: { create: pedagogicalData.objectives.map((text: string, idx: number) => ({ order: idx + 1, text })) },
            steps: { create: pedagogicalData.steps.map((step: any, idx: number) => ({ order: idx + 1, type: step.type, title: step.title, duration: step.duration, content: step.content })) },
            bnccSkills: { create: uniqueSkillsIds.map((id: string) => ({ bnccSkillId: id })) },
            grades: { create: gradesInDb.map((g: any) => ({ gradeId: g.id })) }
          }
        });

        console.log(`   ✅ Conteúdo e BNCC (${uniqueSkillsIds.length}) salvos.`);

        // Criar Reviews e Usuários
        for (const rev of reviewsData) {
          const reviewDate = faker.date.between({ from: '2026-01-01T00:00:00.000Z', to: new Date() });
          const isFemale = Math.random() < 0.9;
          const firstName = isFemale ? faker.person.firstName('female') : faker.person.firstName('male');
          const lastName = faker.person.lastName();
          const email = faker.internet.email({ firstName, lastName }).toLowerCase();
          const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: { 
              name: `${firstName} ${lastName}`, 
              email, 
              location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`, 
              image: faker.image.avatar(),
              createdAt: reviewDate
            }
          });

          await prisma.review.create({
            data: { 
              resourceId: resource.id, 
              userId: user.id, 
              rating: rev.rating, 
              comment: rev.comment, 
              status: 'APPROVED',
              createdAt: reviewDate
            }
          });
        }
        console.log(`   💬 ${reviewsData.length} avaliações reais criadas.`);

      } catch (err) {
        console.error(`   ❌ Erro ao processar "${resource.title}":`, err);
      }
    }

    console.log('\n🏁 Pipeline finalizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro Crítico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
