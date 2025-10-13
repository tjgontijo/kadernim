import { PrismaClient } from '@prisma/client';
import { bnccSeed } from './data-bncc';

// Mapas para inferir disciplina pelos componentes dos códigos
const COMPONENT_TO_SUBJECT: Record<string, string> = {
  // Educação Infantil
  ET: 'matematica',
  EF: 'portugues',          // no EI é "Escuta, fala, pensamento e imaginação"
  EO: 'socioemocional',
  TS: 'artes',
  CG: 'educacao-fisica',
  // Fundamental
  MA: 'matematica',
  LP: 'portugues',
  CI: 'ciencias',
  HI: 'historia',
  GE: 'geografia',
  AR: 'artes',
  EF_FUND: 'educacao-fisica'
};

function inferEducationLevelSlug(code: string): 'infantil' | 'fundamental-i' | 'fundamental-ii' {
  if (code.startsWith('EI')) return 'infantil';
  if (code.startsWith('EF')) {
    const year = parseInt(code.slice(2, 4), 10); // EF01..EF09
    return year <= 5 ? 'fundamental-i' : 'fundamental-ii';
  }
  // fallback
  return 'fundamental-i';
}

function inferSubjectSlug(code: string): string {
  if (code.startsWith('EI')) {
    // EI03ET03 → componente = ET
    const comp = code.slice(4, 6);
    const slug = COMPONENT_TO_SUBJECT[comp];
    if (!slug) throw new Error(`Componente EI desconhecido no código ${code}`);
    return slug;
  }
  if (code.startsWith('EF')) {
    // EF01MA01 → componente = MA; EF01EF01 → EF do Fundamental
    const comp = code.slice(4, 6);
    if (comp === 'EF') return COMPONENT_TO_SUBJECT['EF_FUND'];
    const slug = COMPONENT_TO_SUBJECT[comp];
    if (!slug) throw new Error(`Componente EF desconhecido no código ${code}`);
    return slug;
  }
  throw new Error(`Prefixo de código BNCC desconhecido em ${code}`);
}

export async function seedBNCC(prisma: PrismaClient) {
  console.log('🌱 Populando códigos BNCC...');
  console.log(`Preparando ${bnccSeed.length} códigos BNCC...`);
  
  try {
    // Primeiro, buscar todos os níveis educacionais e disciplinas para evitar consultas repetidas
    const educationLevels = await prisma.educationLevel.findMany();
    const subjects = await prisma.subject.findMany();
    
    // Criar mapas para busca rápida por slug
    const educationLevelMap = new Map(
      educationLevels.map((level: { slug: string, id: string }) => [level.slug, level.id])
    );
    const subjectMap = new Map(
      subjects.map((subject: { slug: string, id: string }) => [subject.slug, subject.id])
    );
    
    // Preparar os dados para inserção em lote
    const bnccData = [];
    
    for (const item of bnccSeed) {
      const educationLevelSlug = inferEducationLevelSlug(item.code);
      const subjectSlug = inferSubjectSlug(item.code);
      
      const educationLevelId = educationLevelMap.get(educationLevelSlug);
      const subjectId = subjectMap.get(subjectSlug);
      
      if (!educationLevelId) {
        throw new Error(`Nível educacional não encontrado para slug: ${educationLevelSlug}`);
      }
      
      if (!subjectId) {
        throw new Error(`Disciplina não encontrada para slug: ${subjectSlug}`);
      }
      
      bnccData.push({
        code: item.code,
        description: item.description,
        educationLevelId,
        subjectId
      });
    }
    
    // Inserir em lotes de 100 para melhor performance
    const batchSize = 100;
    for (let i = 0; i < bnccData.length; i += batchSize) {
      const batch = bnccData.slice(i, i + batchSize);
      await prisma.bNCCCode.createMany({
        data: batch,
        skipDuplicates: true // Ignora duplicatas se houver
      });
      console.log(`Inseridos ${Math.min(i + batchSize, bnccData.length)} de ${bnccData.length} códigos BNCC`);
    }
    
    console.log('✅ Códigos BNCC populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular códigos BNCC:', error);
    throw error;
  }
}
