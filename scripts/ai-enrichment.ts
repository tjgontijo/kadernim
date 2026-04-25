import 'dotenv/config';
import { PrismaClient } from '../prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaPgPoolConfig } from '../src/lib/database/prisma-pg-config';
import { orchestrateResourceEnrichment } from '../src/mastra/agents/enrichment';

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
          subjectName: resource.subject?.name || 'Geral',
          educationLevelName: resource.educationLevel?.name || 'Geral',
          availableGrades: gradeSlugs
        });

        const pedagogicalData = result.pedagogical;

        if (!pedagogicalData) continue;

        // 2. PERSISTÊNCIA (Limpeza Cirúrgica)
        await prisma.$transaction([
          prisma.resourceBnccSkill.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceGrade.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceObjective.deleteMany({ where: { resourceId: resource.id } }),
          prisma.resourceStep.deleteMany({ where: { resourceId: resource.id } }),
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
