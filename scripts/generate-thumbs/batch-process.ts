import 'dotenv/config';
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { prisma } from '../../src/lib/db';
import { uploadImage, deleteAsset } from '../../src/lib/storage/cloudinary';
import { buildResourceThumbPublicId } from '../../src/services/resources/storage-service';
import { generateCoverHtml, CoverLayout } from './cover-template';

const OUTPUT_DIR = path.join(process.cwd(), 'public/resources/covers');
const BG_DIR = path.join(process.cwd(), 'public/resources/background');
const BG_FILES = ['desk-bg-v1.png', 'desk-bg-v2.png', 'desk-bg-v3.png'];

type FileWithPreviewImages = {
  name: string
  fileType: string | null
  images: Array<{ url: string | null; order: number }>
}

function shuffle<T>(items: T[]): T[] {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function isPdfFile(file: Pick<FileWithPreviewImages, 'name' | 'fileType'>) {
  if (file.fileType?.toLowerCase().includes('pdf')) return true
  return file.name.toLowerCase().endsWith('.pdf')
}

function pickRandomPreviewImages(files: FileWithPreviewImages[], count: number) {
  const pdfFiles = files.filter((file) => isPdfFile(file))

  const preferredByFile = pdfFiles
    .map((file) => ({
      ...file,
      images: file.images
        .filter((image) => image.order >= 1 && Boolean(image.url))
        .map((image) => image.url as string),
    }))
    .filter((file) => file.images.length > 0)

  const fallbackPool = pdfFiles
    .flatMap((file) => file.images)
    .filter((image) => Boolean(image.url))
    .map((image) => image.url as string)

  const chosen: string[] = []
  const shuffledFiles = shuffle(preferredByFile)

  // Prioriza variedade: tenta pegar uma imagem por PDF aleatório antes de repetir.
  for (const file of shuffledFiles) {
    if (chosen.length >= count) break
    chosen.push(randomItem(file.images))
  }

  const preferredPool = preferredByFile.flatMap((file) => file.images)
  while (chosen.length < count) {
    if (preferredPool.length > 0) {
      chosen.push(randomItem(preferredPool))
      continue
    }
    if (fallbackPool.length > 0) {
      chosen.push(randomItem(fallbackPool))
      continue
    }
    break
  }

  return chosen
}

async function batchProcess() {
  console.log('🚀 Iniciando Processamento em Lote (Standalone HTML, sem servidor)...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Valida que todos os backgrounds existem
  const availableBgs = BG_FILES.filter(f => {
    const exists = fs.existsSync(path.join(BG_DIR, f));
    if (!exists) console.warn(`⚠️  Background não encontrado: ${f}`);
    return exists;
  });

  if (availableBgs.length === 0) {
    console.error('❌ Nenhum background encontrado em:', BG_DIR);
    return;
  }
  console.log(`🖼️  ${availableBgs.length} backgrounds disponíveis.`);

  try {
    const resources = await prisma.resource.findMany({
      where: { archivedAt: null },
      include: {
        subject: true,
        educationLevel: true,
        files: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 20
            }
          },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 Total de recursos: ${resources.length}`);

    const browser = await chromium.launch();

    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      const progress = `[${i + 1}/${resources.length}]`;

      // Se já tiver thumb do Cloudinary e não estivermos forçando, pula
      if (resource.thumbUrl?.includes('cloudinary.com') && !process.env.FORCE_REGENERATE) {
        console.log(`${progress} ⏩ Pulando (já tem thumb): ${resource.title}`);
        continue;
      }

      // LAYOUT FIXO (3 FOLHAS SOLTAS) E BACKGROUND FIXO
      const layout: CoverLayout = 'fan';
      const bgFile = 'desk-bg-v2.png';
      const bgSrc = `file://${path.join(BG_DIR, bgFile)}`;

      console.log(`${progress} 🎨 Gerando ${layout.toUpperCase()} para: ${resource.title}`);

      try {
        const images = pickRandomPreviewImages(resource.files as FileWithPreviewImages[], 3)

        if (images.length === 0 && resource.thumbUrl) {
          images.push(resource.thumbUrl)
        }

        if (images.length === 0) {
          console.warn(`${progress} ⚠️ Sem previews válidos para gerar capa: ${resource.title}`);
          continue
        }

        const html = generateCoverHtml({ layout, bgSrc, images });
        const tmpFile = path.join(os.tmpdir(), `kadernim-cover-${resource.slug}.html`);
        fs.writeFileSync(tmpFile, html);

        const context = await browser.newContext({ deviceScaleFactor: 3 });
        const page = await context.newPage();
        await page.setViewportSize({ width: 800, height: 800 });

        await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(1000); // 1s é suficiente para render local

        const element = await page.$('#cover');
        if (element) {
          // Captura como Buffer para upload direto
          const buffer = await element.screenshot({ type: 'png' });

          console.log(`   ☁️  Fazendo upload para Cloudinary...`);
          const oldPublicId = resource.thumbPublicId;
          const newPublicId = `resources/${resource.slug}/images/cover`;

          const upload = await uploadImage(buffer, {
            folder: `resources/${resource.slug}/images`,
            publicId: 'cover',
            tags: ['resource', 'cover', 'batch-generated', resource.slug as string],
            overwrite: true
          });

          // Se o ID antigo for diferente do novo, apaga o antigo da nuvem para não deixar lixo
          if (oldPublicId && oldPublicId !== upload.public_id) {
            try {
              await deleteAsset(oldPublicId);
              console.log(`   🗑️  Imagem antiga removida: ${oldPublicId}`);
            } catch (e: any) {
              console.warn(`   ⚠️  Não foi possível remover imagem antiga: ${e.message}`);
            }
          }

          // Atualiza o banco (Resource + ResourceImage order 0)
          await prisma.$transaction([
            prisma.resource.update({
              where: { id: resource.id },
              data: {
                thumbUrl: upload.secure_url,
                thumbPublicId: upload.public_id
              }
            }),
            prisma.resourceImage.upsert({
              where: {
                resourceId_order: { resourceId: resource.id, order: 0 }
              },
              update: {
                url: upload.secure_url,
                cloudinaryPublicId: upload.public_id,
                alt: resource.title,
              },
              create: {
                resourceId: resource.id,
                url: upload.secure_url,
                cloudinaryPublicId: upload.public_id,
                alt: resource.title,
                order: 0
              }
            })
          ]);

          console.log(`   ✅ Sucesso: ${upload.secure_url}`);
        }

        fs.unlinkSync(tmpFile);
        await context.close();
      } catch (err: any) {
        console.error(`   ❌ Erro em ${resource.title}:`, err.message);
      }
    }

    await browser.close();
    console.log('\n✨ Concluído! Capas geradas e salvas no Cloudinary/Prisma.');
  } catch (e) {
    console.error('❌ Erro fatal:', e);
  } finally {
    await prisma.$disconnect();
  }
}

batchProcess().catch(console.error);
