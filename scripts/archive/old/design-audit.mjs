import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AUDIT_DIR = 'tests/color-audit';
const RESULTS_FILE = 'audit-results.json';
const NODE_BIN = '/usr/local/bin/node';
const PLAYWRIGHT_BIN = './node_modules/.bin/playwright';

console.log('🚀 Iniciando Auditoria do Design System...');

try {
  // Run Playwright with JSON reporter
  const cmd = `PATH=$PATH:/usr/local/bin ${PLAYWRIGHT_BIN} test ${AUDIT_DIR} --reporter=json`;
  let output;
  try {
    output = execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (e) {
    // Playwright returns exit code > 0 if tests fail, we still want the JSON
    output = e.stdout.toString();
  }

  const results = JSON.parse(output);
  const specs = [];
  
  const collectSpecs = (suite) => {
    if (suite.specs) specs.push(...suite.specs);
    if (suite.suites) suite.suites.forEach(collectSpecs);
  };
  results.suites.forEach(collectSpecs);

  const totalTests = specs.length;
  let passedTests = 0;
  const violations = [];

  specs.forEach(spec => {
    const status = spec.tests[0]?.results[0]?.status;
    if (status === 'passed') passedTests++;
    else if (status !== 'skipped') {
      violations.push({
        title: spec.title,
        error: spec.tests[0].results[0].error?.message || 'Erro desconhecido'
      });
    }
  });

  const score = totalTests > 0 ? (passedTests / (passedTests + violations.length)) * 100 : 0;

  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO DE CONFORMIDADE KADERNIM');
  console.log('='.repeat(50));
  console.log(`PROJETO: Kadernim SaaS`);
  console.log(`DATA:    ${new Date().toLocaleString()}`);
  console.log(`SCORE:   ${score.toFixed(1)}% de conformidade`);
  console.log('-'.repeat(50));
  console.log(`✅ Sucessos: ${passedTests}`);
  console.log(`❌ Falhas:   ${totalTests - passedTests}`);
  console.log('='.repeat(50));

  if (violations.length > 0) {
    console.log('\n🚨 DETALHES DAS VIOLAÇÕES:');
    violations.forEach((v, i) => {
      console.log(`\n[${i + 1}] ${v.title}`);
      console.log(`   └─ ${v.error.split('\n')[0]}`);
    });
  }

  if (score >= 95) {
    console.log('\n💎 EXCELENTE: Seu sistema está em alta fidelidade!');
  } else if (score >= 80) {
    console.log('\n⚠️ ATENÇÃO: Desvios detectados. Verifique se os tokens estão corretos.');
  } else {
    console.log('\n❌ CRÍTICO: Muitas inconsistências detectadas.');
  }

} catch (error) {
  console.error('❌ Falha ao rodar auditoria:', error.message);
}
