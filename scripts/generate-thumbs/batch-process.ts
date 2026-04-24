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
            images: { orderBy: { order: 'desc' }, take: 3 }
          },
          take: 1
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

      // SORTEIO DE LAYOUT E BACKGROUND
      const layout: CoverLayout = Math.random() > 0.5 ? 'booklet' : 'fan';
      const bgFile = availableBgs[Math.floor(Math.random() * availableBgs.length)];
      const bgSrc = `file://${path.join(BG_DIR, bgFile)}`;

      console.log(`${progress} 🎨 Gerando ${layout.toUpperCase()} para: ${resource.title}`);

      try {
        const images = resource.files[0]?.images
          .map(img => img.url)
          .filter((url): url is string => !!url) || [resource.thumbUrl || ''];

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
