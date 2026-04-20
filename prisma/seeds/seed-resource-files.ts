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
  generatePreviewImagesFromPdf,
  buildResourcePdfObjectKey,
  buildResourceVideoPublicId
} from '../../src/services/resources/storage-service'

const CONCURRENCY_LIMIT = 5

async function logErrorToFile(message: string) {
  const timestamp = new Date().toISOString()
  await fs.appendFile(path.join(process.cwd(), 'seed-errors.txt'), `[${timestamp}] ${message}\n`).catch(() => { })
}

async function resetSeedDebugFiles() {
  await fs.unlink(path.join(process.cwd(), 'seed-errors.txt')).catch(() => { })
  await fs.unlink(path.join(process.cwd(), 'seed-manual-actions.md')).catch(() => { })
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
  await resetSeedDebugFiles()

  const extIdToSlug = new Map(RESOURCES.map(r => [r.externalId, slugifyText(r.title)]))
  const summary = {
    foldersConfigured: FILES.length,
    missingResourceMapping: 0,
    missingResourceInDb: 0,
    invalidFolderUrl: 0,
    emptyDriveFolder: 0,
    duplicatesSkipped: 0,
    uploadedPdfsToR2: 0,
    uploadedVideosToCloudinary: 0,
    generatedPreviewSets: 0,
    previewFailures: 0,
    downloadFailures: 0,
    folderFailures: 0,
  }

  const processResource = async (f: typeof FILES[0]) => {
    const resourceSlug = extIdToSlug.get(f.externalId)
    if (!resourceSlug) {
      summary.missingResourceMapping += 1
      console.warn(`⚠️ Sem mapeamento de resource para externalId=${f.externalId}`)
      return
    }

    const resource = await prisma.resource.findUnique({
      where: { slug: resourceSlug },
      select: { id: true }
    })
    if (!resource) {
      summary.missingResourceInDb += 1
      console.warn(`⚠️ Recurso slug=${resourceSlug} não encontrado no banco (externalId=${f.externalId})`)
      return
    }

    const folderId = f.url.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1]
    if (!folderId) {
      summary.invalidFolderUrl += 1
      console.warn(`⚠️ URL de pasta inválida para externalId=${f.externalId}: ${f.url}`)
      return
    }

    try {
      const driveFiles = await listDriveFileIds(folderId)
      if (driveFiles.length === 0) {
        summary.emptyDriveFolder += 1
        console.warn(`⚠️ Nenhum arquivo encontrado na pasta do Drive extId=${f.externalId}, folderId=${folderId}`)
        return
      }

      for (const { id: driveFileId, name: driveFileName } of driveFiles) {
        try {
          const downloaded = await downloadDriveFile(driveFileId)

          if (downloaded.mimeType.includes('video')) {
            const expectedVideoId = buildResourceVideoPublicId({
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName
            })

            const existingVideo = await prisma.resourceVideo.findUnique({
              where: { cloudinaryPublicId: expectedVideoId },
              select: { id: true, resourceId: true }
            })

            if (existingVideo) {
              summary.duplicatesSkipped += 1
              if (existingVideo.resourceId !== resource.id) {
                console.warn(`⚠️ Vídeo ${expectedVideoId} já pertence a outro recurso, pulando.`)
              } else {
                console.log(`⏩ Pulando vídeo já existente: ${driveFileName}`)
              }
              continue
            }

            const upload = await uploadVideoToCloudinary(downloaded.buffer, {
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName
            })
            await prisma.resourceVideo.create({
              data: {
                resourceId: resource.id,
                title: downloaded.fileName,
                cloudinaryPublicId: upload.public_id,
                url: upload.secure_url,
                thumbnail: upload.secure_url.replace(/\.[^.]+$/, '.jpg'),
                duration: Math.round(upload.duration || 0),
                order: 99
              }
            })
            summary.uploadedVideosToCloudinary += 1
            console.log(`✅ Vídeo: ${downloaded.fileName}`)
            continue
          }

          if (downloaded.mimeType.includes('pdf')) {
            const expectedPdfKey = buildResourcePdfObjectKey({
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName
            })

            const existingFile = await prisma.resourceFile.findUnique({
              where: { cloudinaryPublicId: expectedPdfKey },
              select: { id: true, resourceId: true }
            })

            if (existingFile) {
              summary.duplicatesSkipped += 1
              if (existingFile.resourceId !== resource.id) {
                console.warn(`⚠️ Arquivo ${expectedPdfKey} já pertence a outro recurso, pulando.`)
              } else {
                console.log(`⏩ Pulando PDF já existente: ${driveFileName}`)
              }
              continue
            }

            const upload = await uploadPdfToR2(downloaded.buffer, {
              resourceSlug,
              driveFileId,
              fileName: downloaded.fileName,
              mimeType: downloaded.mimeType
            })
            summary.uploadedPdfsToR2 += 1

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
              summary.generatedPreviewSets += 1
              console.log(`🖼️ Previews: ${f.name}`)
            } catch (e) {
              summary.previewFailures += 1
              await logErrorToFile(`Falha preview extId=${f.externalId}: ${e}`)
              console.error(`❌ Falha preview extId=${f.externalId}`, e)
            }
            continue
          }

          console.warn(`⚠️ Tipo de arquivo não suportado (${downloaded.mimeType}) para ${driveFileName}`)
        } catch (error) {
          summary.downloadFailures += 1
          const errMsg = error instanceof Error ? error.message : String(error)
          if (errMsg.includes('confirmação') || errMsg.includes('grande') || errMsg.includes('permissão') || errMsg.includes('100MB')) {
            await logManualAction({ resourceSlug, driveFileId, error: errMsg })
          } else {
            await logErrorToFile(`Erro extId=${f.externalId}: ${errMsg}`)
          }
          console.error(`❌ Erro ao processar arquivo extId=${f.externalId}, driveFileId=${driveFileId}: ${errMsg}`)
        }
      }
    } catch (error) {
      summary.folderFailures += 1
      await logErrorToFile(`Falha pasta extId=${f.externalId}: ${error}`)
      console.error(`❌ Falha ao processar pasta extId=${f.externalId}:`, error)
    }
  }

  const pool = new Set<Promise<void>>()
  for (const f of FILES) {
    if (pool.size >= CONCURRENCY_LIMIT) await Promise.race(pool)
    const p = processResource(f).finally(() => pool.delete(p))
    pool.add(p)
  }
  await Promise.all(pool)

  console.log('📊 Resumo seedResourceFiles:', summary)
}
