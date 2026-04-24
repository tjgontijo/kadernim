import 'dotenv/config';
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { prisma } from '../../src/lib/db';
import { generateCoverHtml, CoverLayout } from './cover-template';

const OUTPUT_PATH = path.join(process.cwd(), 'public/resources/test-random-final.png');
const BG_DIR = path.join(process.cwd(), 'public/resources/background');

async function testRandom() {
  // Sorteio
  const layout: CoverLayout = 'fan';
  const bgFile = ['desk-bg-v1.png', 'desk-bg-v2.png', 'desk-bg-v3.png'][Math.floor(Math.random() * 3)];
  
  console.log(`🎲 Sorteado: Layout ${layout.toUpperCase()} com fundo ${bgFile}`);

  const bgPath = path.join(BG_DIR, bgFile);
  const bgSrc = `file://${bgPath}`;

  // Busca o recurso e suas imagens
  const resource = await prisma.resource.findFirst({
    where: { archivedAt: null },
    include: {
      files: {
        include: { images: { orderBy: { order: 'desc' }, take: 3 } },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!resource) { console.error('Nenhum recurso encontrado'); return; }

  const images = resource.files[0]?.images
    .map(i => i.url)
    .filter((url): url is string => !!url) || [resource.thumbUrl || ''];
  console.log(`📄 Imagens: ${images.length} páginas do recurso "${resource.title}"`);

  // Gera o HTML e grava em arquivo temporário para navegação via file://
  const html = generateCoverHtml({ layout, bgSrc, images });
  const tmpFile = path.join(os.tmpdir(), `kadernim-cover-${Date.now()}.html`);
  fs.writeFileSync(tmpFile, html);

  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.setViewportSize({ width: 800, height: 800 });

  await page.goto(`file://${tmpFile}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const element = await page.$('#cover');
  if (element) {
    await element.screenshot({ path: OUTPUT_PATH });
    console.log(`✅ Capa gerada em: ${OUTPUT_PATH}`);
  }

  fs.unlinkSync(tmpFile); // limpa o tmp
  await browser.close();
  await prisma.$disconnect();
}

testRandom().catch(console.error);
