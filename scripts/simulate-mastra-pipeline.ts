import { chromium } from 'playwright'
import { generateResourceContent } from '../src/mastra/agents/generate-resource/orchestrators/generate-resource-content'
import { AdaptiveLayoutEngine } from '../src/lib/resource/adaptive-layout-engine'
import { parseBnccCode, yearToPhase, getSubjectSlug } from '../src/lib/resource/bncc-parser'
import fs from 'fs'
import path from 'path'

const BNCC_CODE = process.argv[2] || 'EF05HI04';
const QUESTION_COUNT = parseInt(process.argv[3] || '4', 10);
const OUT_DIR = path.join(process.cwd(), 'scripts/output');

async function main() {
  console.log('====================================================');
  console.log('   SIMULAÇÃO COMPLETA: PIPELINE MASTRA + ADAPTIVE   ');
  console.log('====================================================');
  console.log(`Habilidade: ${BNCC_CODE}`);
  console.log(`Questões:   ${QUESTION_COUNT}`);
  console.log('----------------------------------------------------\n');

  // Infer phase and subject from code
  const bnccMeta = parseBnccCode(BNCC_CODE);
  const phase = yearToPhase(bnccMeta.year);
  const subjectSlug = getSubjectSlug(bnccMeta.component);

  // Dados Mockados da BNCC para evitar erro de conexão com o banco
  const mockBnccData = {
    code: BNCC_CODE,
    description: 'Associar a noção de cidadania com os princípios de respeito à diversidade, à pluralidade e aos direitos humanos.',
    subject: { name: 'História' },
    grade: { name: '5º ano' }
  };

  try {
    console.log(`[1/3] Iniciando Processamento Mastra (Agents: GPT-4o)...`);
    console.log(`      Config: Phase=${phase}, Subject=${subjectSlug}`);
    
    const finalPlan = await generateResourceContent(BNCC_CODE, QUESTION_COUNT, undefined, mockBnccData);

    console.log('\n[2/3] Processamento Mastra Concluído. Iniciando análise de Layout...');
    const result = await AdaptiveLayoutEngine.process(finalPlan, {
      phase: phase,
      subject: subjectSlug
    });

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const htmlPath = path.join(OUT_DIR, `simulation_${BNCC_CODE}.html`);
    const jsonPath = path.join(OUT_DIR, `simulation_${BNCC_CODE}.json`);

    fs.writeFileSync(htmlPath, result.html, 'utf-8');
    fs.writeFileSync(jsonPath, JSON.stringify(result.plan, null, 2), 'utf-8');

    console.log('\n[3/3] Capturando screenshots das páginas...');
    const browser = await chromium.launch();
    const browserPage = await browser.newPage();
    await browserPage.setViewportSize({ width: 900, height: 1200 });
    await browserPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

    const pages = await browserPage.locator('.resource-page').all();
    for (let i = 0; i < pages.length; i++) {
      const outPath = path.join(OUT_DIR, `simulation_${BNCC_CODE}_page${i + 1}.png`);
      await pages[i].screenshot({ path: outPath });
      console.log(`  Screenshot página ${i + 1}: ${outPath}`);
    }
    await browser.close();

    console.log('\n====================================================');
    console.log('              RELATÓRIO DE COMPOSIÇÃO               ');
    console.log('====================================================');
    console.log(`  Score de Layout:  ${result.report.score}/100`);
    console.log(`  Perfil de Densidade: ${result.report.profile.toUpperCase()}`);
    console.log(`  Páginas Alvo:    ${result.report.targetPages}`);
    console.log(`  Páginas Reais:   ${result.report.totalPages}`);
    console.log('----------------------------------------------------');
    console.log(`  HTML: ${htmlPath}`);
    console.log(`  JSON: ${jsonPath}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ Erro no Pipeline:', error);
    process.exit(1);
  }
}

main();
