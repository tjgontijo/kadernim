import { PrismaClient } from '@prisma/client';

const educationLevels = [
  { name: 'Educação Infantil', slug: 'educacao-infantil', ageRange: '0-5 anos' },
  { name: 'Ensino Fundamental I', slug: 'fundamental-i', ageRange: '6-10 anos' },
  { name: 'Ensino Fundamental II', slug: 'fundamental-ii', ageRange: '11-14 anos' },
  { name: 'Docente', slug: 'docente', ageRange: null }
];

const subjects = [
  { name: 'Língua Portuguesa', slug: 'portugues' },
  { name: 'Matemática', slug: 'matematica' },
  { name: 'Ciências', slug: 'ciencias' },
  { name: 'História', slug: 'historia' },
  { name: 'Geografia', slug: 'geografia' },
  { name: 'Artes', slug: 'artes' },
  { name: 'Educação Física', slug: 'educacao-fisica' },
  { name: 'Inglês', slug: 'ingles' },
  { name: 'Socioemocional', slug: 'socioemocional' },
  { name: 'Administrativo', slug: 'administrativo' }
];

export async function seedBase(prisma: PrismaClient) {
  console.log('🌱 Populando dados base (níveis de ensino e disciplinas)...');
  
  // Criar níveis de ensino
  console.log('Criando níveis de ensino...');
  for (const level of educationLevels) {
    await prisma.educationLevel.upsert({
      where: { slug: level.slug },
      update: { name: level.name, ageRange: level.ageRange },
      create: level
    });
  }
  
  // Criar disciplinas
  console.log('Criando disciplinas...');
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name },
      create: subject
    });
  }
  
  console.log('✅ Dados base populados com sucesso!');
}
