import { prisma } from '../src/lib/db'

async function migrate() {
  console.log('🔄 Iniciando migração de taxonomia para N:N...')

  // Buscamos todos os recursos e filtramos no JS para evitar problemas de tipos/query
  const allResources = await prisma.resource.findMany({
    select: {
      id: true,
      educationLevelId: true,
      subjectId: true,
      title: true
    }
  })

  const resources = allResources.filter(r => r.educationLevelId || r.subjectId)

  console.log(`📦 Encontrados ${resources.length} recursos para migrar.`)

  for (const resource of resources) {
    // Migrar Etapa de Ensino
    if (resource.educationLevelId) {
      await prisma.resourceEducationLevel.upsert({
        where: {
          resourceId_educationLevelId: {
            resourceId: resource.id,
            educationLevelId: resource.educationLevelId
          }
        },
        update: {},
        create: {
          resourceId: resource.id,
          educationLevelId: resource.educationLevelId
        }
      })
    }

    // Migrar Disciplina
    if (resource.subjectId) {
      await prisma.resourceSubject.upsert({
        where: {
          resourceId_subjectId: {
            resourceId: resource.id,
            subjectId: resource.subjectId
          }
        },
        update: {},
        create: {
          resourceId: resource.id,
          subjectId: resource.subjectId
        }
      })
    }
    
    console.log(`✅ Migrado: ${resource.title}`)
  }

  console.log('🏁 Migração concluída com sucesso!')
}

migrate()
  .catch(e => {
    console.error('❌ Erro na migração:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
