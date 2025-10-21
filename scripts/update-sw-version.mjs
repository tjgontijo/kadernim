// Script para atualizar automaticamente a versão do Service Worker
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo do service worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');

try {
  // Ler o conteúdo atual do service worker
  let swContent = fs.readFileSync(swPath, 'utf8');
  
  // Encontrar a linha com a versão atual
  const versionRegex = /const CACHE_VERSION = ['"](\d+)['"];/;
  const match = swContent.match(versionRegex);
  
  if (match) {
    // Incrementar a versão
    const currentVersion = parseInt(match[1], 10);
    const newVersion = currentVersion + 1;
    
    // Substituir a versão no arquivo
    swContent = swContent.replace(versionRegex, `const CACHE_VERSION = '${newVersion}';`);
    
    // Salvar o arquivo atualizado
    fs.writeFileSync(swPath, swContent);
    
    console.log(`✅ Service Worker atualizado para versão ${newVersion}`);
  } else {
    // Se não encontrar a linha de versão, adicionar no início do arquivo
    const newContent = `// Service Worker para Kadernim PWA
const CACHE_VERSION = '1';
const CACHE_NAME = \`kadernim-v\${CACHE_VERSION}\`;
${swContent.replace(/const CACHE_NAME = ['"]kadernim-v\d+['"];/, '')}`;
    
    fs.writeFileSync(swPath, newContent);
    console.log('✅ Versão do Service Worker inicializada como 1');
  }
} catch (error) {
  console.error('❌ Erro ao atualizar versão do Service Worker:', error);
  process.exit(1);
}