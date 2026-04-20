import type { PrismaClient } from '../generated/prisma/client'
import { RESOURCES } from './data/resources'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export async function seedResources(prisma: PrismaClient) {
  console.log('🌱 Populando resources...')

  for (const res of RESOURCES) {
    const [level, sub] = await Promise.all([
      prisma.educationLevel.findUnique({ where: { slug: res.educationLevel } }),
      prisma.subject.findUnique({ where: { slug: res.subject } }),
    ])

    if (!level || !sub) {
      console.warn(`⚠️  Level ou Subject não encontrado para: ${res.title}`)
      continue
    }

    const slug = slugify(res.title)

    try {
      const resource = await prisma.resource.upsert({
        where: { slug: slug },
        update: {
          title: res.title,
          externalId: res.externalId,
          educationLevelId: level.id,
          subjectId: sub.id,
        },
        create: {
          title: res.title,
          slug: slug,
          externalId: res.externalId,
          description: `Recurso pedagógico: ${res.title}`,
          educationLevelId: level.id,
          subjectId: sub.id,
        },
      })

      // Imagem principal (order 0)
      await prisma.resourceImage.upsert({
        where: { 
          resourceId_order: { resourceId: resource.id, order: 0 } 
        },
        update: { url: res.imageUrl },
        create: {
          resourceId: resource.id,
          url: res.imageUrl,
          cloudinaryPublicId: `seed-thumb-${slug}`,
          alt: res.title,
          order: 0
        }
      })
      
      console.log(`✅ ${res.title}`)
    } catch (error) {
      console.error(`❌ Falha no recurso ${res.title}:`, error)
    }
  }
}
