import type { PrismaClient } from '../generated/prisma/client'
import { RESOURCES } from './data/resources'
import { FILES } from './data/resource-files'
import fs from 'node:fs/promises'
import path from 'node:path'

// Importando nossos novos serviços padrão do sistema
import { listDriveFileIds, downloadDriveFile } from '../../src/services/resources/drive-service'
import {
  uploadPdfToR2,
  uploadVideoToCloudinary,
  generatePreviewImagesFromPdf
} from '../../src/services/resources/storage-service'

const CONCURRENCY_LIMIT = 5

async function logErrorToFile(message: string) {
  const timestamp = new Date().toISOString()
  await fs.appendFile(path.join(process.cwd(), 'seed-errors.txt'), `[${timestamp}] ${message}\n`).catch(() => { })
}

async function logManualAction(info: { resourceSlug: string; driveFileId: string; error: string }) {
  const timestamp = new Date().toLocaleTimeString()
  const driveLink = `https://drive.google.com/file/d/${info.driveFileId}/view`
  const logLine = `| ${timestamp} | **${info.resourceSlug}** | [Abrir Drive](${driveLink}) | ${info.error} |\n`
  const filePath = path.join(process.cwd(), 'seed-manual-actions.md')

  const exists = await fs.access(filePath).then(() => true).catch(() => false)
  if (!exists) {
    await fs.writeFile(filePath, '# 🛠️ Ações Manuais Necessárias\n\n| Hora | Recurso (Slug) | Link Drive | Motivo/Erro |\n| :--- | :--- | :--- | :--- |\n')
  }
  await fs.appendFile(filePath, logLine).catch(() => { })
}

function slugifyText(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function seedResourceFiles(prisma: PrismaClient) {
  console.log('🌱 Populando resource files com arquitetura de serviços...')

  const extIdToSlug = new Map(RESOURCES.map(r => [r.externalId, slugifyText(r.title)]))

  const processResource = async (f: typeof FILES[0]) => {
    const resourceSlug = extIdToSlug.get(f.externalId)
    if (!resourceSlug) return

    const resource = await prisma.resource.findUnique({
      where: { slug: resourceSlug },
      select: { id: true }
    })
    if (!resource) return

    const folderId = f.url.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1]
    if (!folderId) return

    try {
      const driveFiles = await listDriveFileIds(folderId)

      for (const { id: driveFileId, name: driveFileName } of driveFiles) {
        const expectedPublicId = `shared/files/${driveFileId}/file.pdf`
        
        // Refazer a checa de nome de forma mais precisa e case-insensitive
        const allFiles = await prisma.resourceFile.findMany({ where: { resourceId: resource.id } })
        
        const isDuplicate = allFiles.some(f => 
          f.name.trim().toLowerCase() === driveFileName.trim().toLowerCase() || 
          f.cloudinaryPublicId === expectedPublicId
        )

        if (isDuplicate) {
          console.log(`⏩ Pulando ${driveFileName} (já existe no recurso)`)
          continue
        }

        try {
          const downloaded = await downloadDriveFile(driveFileId)

          // 2. Checar se este arquivo já foi subido por outro recurso (Reaproveitamento R2)
          const sharedFile = await prisma.resourceFile.findFirst({
            where: { cloudinaryPublicId: expectedPublicId }
          })

          if (sharedFile) {
            console.log(`♻️  Reaproveitando arquivo R2: ${downloaded.fileName}`)
            const created = await prisma.resourceFile.create({
              data: {
                resourceId: resource.id,
                name: sharedFile.name,
                url: sharedFile.url,
                cloudinaryPublicId: sharedFile.cloudinaryPublicId,
                fileType: sharedFile.fileType,
                sizeBytes: sharedFile.sizeBytes
              }
            })
            // Copiar previews também
            const previews = await prisma.resourceFileImage.findMany({ where: { fileId: sharedFile.id } })
            if (previews.length > 0) {
              await prisma.resourceFileImage.createMany({
                data: previews.map(p => ({
                  fileId: created.id,
                  url: p.url,
                  cloudinaryPublicId: p.cloudinaryPublicId,
                  alt: p.alt,
                  order: p.order
                }))
              })
            }
            continue
          }

          if (downloaded.mimeType.includes('video')) {
            const expectedVideoId = `shared/videos/${driveFileId}`
            
            // 1. Checar se este recurso já tem este vídeo
            const hasVideo = await prisma.resourceVideo.findFirst({
              where: { resourceId: resource.id, cloudinaryPublicId: expectedVideoId }
            })

            if (hasVideo) {
              console.log(`⏩ Vídeo já existe neste recurso: ${downloaded.fileName}`)
              continue
            }

            // 2. Checar se este vídeo já foi subido por outro recurso (Reaproveitamento)
            const sharedVideo = await prisma.resourceVideo.findFirst({
              where: { cloudinaryPublicId: expectedVideoId }
            })

            if (sharedVideo) {
              console.log(`♻️  Reaproveitando vídeo já subido: ${downloaded.fileName}`)
              await prisma.resourceVideo.create({
                data: {
                  resourceId: resource.id,
                  title: sharedVideo.title,
                  cloudinaryPublicId: sharedVideo.cloudinaryPublicId,
                  url: sharedVideo.url,
                  thumbnail: sharedVideo.thumbnail,
                  duration: sharedVideo.duration,
                  order: 99
                }
              })
              continue
            }

            const upload = await uploadVideoToCloudinary(downloaded.buffer, {
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName
            })
            await prisma.resourceVideo.upsert({
              where: { cloudinaryPublicId: upload.public_id },
              update: {},
              create: {
                resourceId: resource.id,
                title: downloaded.fileName,
                cloudinaryPublicId: upload.public_id,
                url: upload.secure_url,
                thumbnail: upload.secure_url.replace(/\.[^.]+$/, '.jpg'),
                duration: Math.round(upload.duration || 0),
                order: 99
              }
            })
            console.log(`✅ Vídeo: ${downloaded.fileName}`)
            continue
          }

          if (downloaded.mimeType.includes('pdf')) {
            const upload = await uploadPdfToR2(downloaded.buffer, {
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName,
              mimeType: downloaded.mimeType
            })

            const created = await prisma.resourceFile.create({
              data: {
                name: downloaded.fileName,
                cloudinaryPublicId: upload.key,
                url: upload.url,
                fileType: downloaded.mimeType,
                sizeBytes: upload.sizeBytes,
                resourceId: resource.id
              }
            })

            try {
              const images = await generatePreviewImagesFromPdf({
                resourceSlug,
                resourceTitle: f.name,
                driveFileId,
                pdfFileName: downloaded.fileName,
                pdfBuffer: downloaded.buffer,
                fileDisplayName: downloaded.fileName
              })

              await prisma.resourceFileImage.deleteMany({ where: { fileId: created.id } })
              await prisma.resourceFileImage.createMany({
                data: images.map((img, i) => ({
                  fileId: created.id,
                  cloudinaryPublicId: img.cloudinaryPublicId,
                  url: img.url,
                  alt: img.alt,
                  order: i
                }))
              })
              console.log(`🖼️ Previews: ${f.name}`)
            } catch (e) {
              await logErrorToFile(`Falha preview extId=${f.externalId}: ${e}`)
            }
          }
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error)
          if (errMsg.includes('confirmação') || errMsg.includes('grande') || errMsg.includes('permissão') || errMsg.includes('100MB')) {
            await logManualAction({ resourceSlug, driveFileId, error: errMsg })
          } else {
            await logErrorToFile(`Erro extId=${f.externalId}: ${errMsg}`)
          }
        }
      }
    } catch (error) {
      await logErrorToFile(`Falha pasta extId=${f.externalId}: ${error}`)
    }
  }

  const pool = new Set<Promise<void>>()
  for (const f of FILES) {
    if (pool.size >= CONCURRENCY_LIMIT) await Promise.race(pool)
    const p = processResource(f).finally(() => pool.delete(p))
    pool.add(p)
  }
  await Promise.all(pool)
}
