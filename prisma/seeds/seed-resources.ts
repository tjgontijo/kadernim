import type { PrismaClient } from '../generated/prisma/client'
import { RESOURCES } from './data/resources'
import { uploadImageFromUrlToCloudinary } from '../../src/services/resources/storage-service'

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

  const summary = {
    total: RESOURCES.length,
    seeded: 0,
    skippedTaxonomy: 0,
    imageUploadsOk: 0,
    imageUploadsFailed: 0,
    errors: 0,
  }

  for (const res of RESOURCES) {
    const [level, sub] = await Promise.all([
      prisma.educationLevel.findUnique({ where: { slug: res.educationLevel } }),
      prisma.subject.findUnique({ where: { slug: res.subject } }),
    ])

    if (!level || !sub) {
      console.warn(`⚠️  Level ou Subject não encontrado para: ${res.title}`)
      summary.skippedTaxonomy += 1
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

      let coverUrl = res.imageUrl
      let coverPublicId = `seed-thumb-${slug}`

      try {
        const upload = await uploadImageFromUrlToCloudinary({
          imageUrl: res.imageUrl,
          resourceId: resource.id,
          resourceSlug: slug,
          publicId: 'cover',
          altText: res.title,
        })
        coverUrl = upload.url
        coverPublicId = upload.publicId
        summary.imageUploadsOk += 1
      } catch (error) {
        summary.imageUploadsFailed += 1
        console.error(`⚠️ Falha upload capa para "${res.title}", mantendo URL original.`, error)
      }

      // Atualiza o recurso com os campos de thumb
      await prisma.resource.update({
        where: { id: resource.id },
        data: {
          thumbUrl: coverUrl,
          thumbPublicId: coverPublicId,
        },
      })

      // Imagem principal (order 0) no banco
      await prisma.resourceImage.upsert({
        where: { 
          resourceId_order: { resourceId: resource.id, order: 0 } 
        },
        update: {
          url: coverUrl,
          cloudinaryPublicId: coverPublicId,
          alt: res.title,
        },
        create: {
          resourceId: resource.id,
          url: coverUrl,
          cloudinaryPublicId: coverPublicId,
          alt: res.title,
          order: 0
        }
      })
      
      summary.seeded += 1
      console.log(`✅ ${res.title}`)
    } catch (error) {
      summary.errors += 1
      console.error(`❌ Falha no recurso ${res.title}:`, error)
    }
  }

  console.log('📊 Resumo seedResources:', summary)
}
