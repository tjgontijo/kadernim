import 'dotenv/config';
import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { prisma } from '../../src/lib/db';

const BASE_URL = 'http://localhost:3000/render/cover';
const OUTPUT_PATH = path.join(process.cwd(), 'public/resources/test-fan-cover.png');
const BG_PATH = path.join(process.cwd(), 'public/resources/background/v3.png'); // Mogno Africano para o teste

async function testGenerate() {
  console.log('🧪 Gerando Mockup Lifestyle - MODO LEQUE (3 FOLHAS)...');

  try {
    const resource = await prisma.resource.findFirst({
      where: { archivedAt: null },
      include: {
        subject: true,
        educationLevel: true,
        files: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 3 }
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!resource) return;

    const browser = await chromium.launch();
    const context = await browser.newContext({ deviceScaleFactor: 3 });
    const page = await context.newPage();
    await page.setViewportSize({ width: 800, height: 800 });

    const images = resource.files[0]?.images.map(img => img.url) || [resource.thumbUrl || ''];
    
    const params = new URLSearchParams({
      title: resource.title,
      subject: resource.subject?.name || 'Geral',
      color: resource.subject?.color || '#D97757',
      grade: resource.educationLevel?.name || 'Geral',
      layout: 'fan',
      images: images.join(',')
    });

    await page.goto(`${BASE_URL}?${params.toString()}`, { waitUntil: 'networkidle' });

    // Injeção do Mogno Africano (v3)
    if (fs.existsSync(BG_PATH)) {
      const bgBase64 = fs.readFileSync(BG_PATH).toString('base64');
      await page.evaluate((base64) => {
        const bgImg = document.querySelector('img[src*="/resources/background/v1.png"]') as HTMLImageElement;
        if (bgImg) bgImg.src = `data:image/png;base64,${base64}`;
      }, bgBase64);
    }

    await page.waitForTimeout(5000); 

    const element = await page.$('#kadernim-cover-capture');
    if (element) {
      await element.screenshot({ path: OUTPUT_PATH });
      console.log(`✅ Capa LEQUE gerada em: ${OUTPUT_PATH}`);
    }
    
    await browser.close();
  } catch (e) {
    console.error('❌ Erro:', e);
  }
}

testGenerate().catch(console.error);
