import type { PrismaClient } from '../generated/prisma/client'

export async function seedBnccAlignment(prisma: PrismaClient) {
  console.log('🌱 Semeando alinhamento BNCC (KnowledgeArea, componentCode, types)...')

  // 1. Create KnowledgeArea records
  const knowledgeAreas = [
    { code: 'linguagens', name: 'Linguagens', order: 1 },
    { code: 'matematica', name: 'Matemática', order: 2 },
    { code: 'ciencias_natureza', name: 'Ciências da Natureza', order: 3 },
    { code: 'ciencias_humanas', name: 'Ciências Humanas', order: 4 },
    { code: 'ensino_religioso', name: 'Ensino Religioso', order: 5 },
  ] as const

  for (const area of knowledgeAreas) {
    await prisma.knowledgeArea.upsert({
      where: { code: area.code },
      update: { name: area.name, order: area.order },
      create: { code: area.code, name: area.name, order: area.order },
    })
  }

  // 2. Get KnowledgeArea IDs by code
  const areasRows = await prisma.knowledgeArea.findMany({
    select: { id: true, code: true },
  })
  const areaIdByCode = new Map(areasRows.map(a => [a.code, a.id]))

  // 3. Map subjects to knowledge areas and component codes
  const subjectMappings: Record<
    string,
    { componentCode: string; knowledgeAreaCode: string; type?: string }
  > = {
    'lingua-portuguesa': {
      componentCode: 'LP',
      knowledgeAreaCode: 'linguagens',
      type: 'LINGUA_PORTUGUESA',
    },
    arte: {
      componentCode: 'AR',
      knowledgeAreaCode: 'linguagens',
      type: 'ARTE',
    },
    'educacao-fisica': {
      componentCode: 'EF',
      knowledgeAreaCode: 'linguagens',
      type: 'EDUCACAO_FISICA',
    },
    'lingua-inglesa': {
      componentCode: 'LI',
      knowledgeAreaCode: 'linguagens',
      type: 'LINGUA_INGLESA',
    },
    matematica: {
      componentCode: 'MA',
      knowledgeAreaCode: 'matematica',
      type: 'MATEMATICA',
    },
    ciencias: {
      componentCode: 'CI',
      knowledgeAreaCode: 'ciencias_natureza',
      type: 'CIENCIAS',
    },
    historia: {
      componentCode: 'HI',
      knowledgeAreaCode: 'ciencias_humanas',
      type: 'HISTORIA',
    },
    geografia: {
      componentCode: 'GE',
      knowledgeAreaCode: 'ciencias_humanas',
      type: 'GEOGRAFIA',
    },
    'ensino-religioso': {
      componentCode: 'ER',
      knowledgeAreaCode: 'ensino_religioso',
      type: 'ENSINO_RELIGIOSO',
    },
  }

  // 4. Update Subject records with componentCode and knowledgeAreaId
  const subjects = await prisma.subject.findMany({
    select: { id: true, slug: true },
  })

  for (const subject of subjects) {
    const mapping = subjectMappings[subject.slug]
    if (mapping) {
      const knowledgeAreaId = areaIdByCode.get(mapping.knowledgeAreaCode)
      if (!knowledgeAreaId) {
        console.warn(`⚠️  KnowledgeArea não encontrada: ${mapping.knowledgeAreaCode}`)
        continue
      }

      const updateData: Record<string, any> = {
        componentCode: mapping.componentCode,
        knowledgeAreaId,
      }

      if (mapping.type) {
        updateData.type = mapping.type
      }

      await prisma.subject.update({
        where: { id: subject.id },
        data: updateData,
      })
    }
  }

  // 5. Update EducationLevel records with type field
  // Only EF levels have a BNCC type (EF = Ensino Fundamental, EM = Ensino Médio)
  // For now, we map EF I and EF II to 'EF'
  await prisma.educationLevel.updateMany({
    where: { slug: { in: ['ensino-fundamental-1', 'ensino-fundamental-2'] } },
    data: { type: 'EF' },
  })

  // 6. Update Grade records with year values
  const gradeYearMappings: Record<string, number> = {
    'ef1-1-ano': 1,
    'ef1-2-ano': 2,
    'ef1-3-ano': 3,
    'ef1-4-ano': 4,
    'ef1-5-ano': 5,
    'ef2-6-ano': 6,
    'ef2-7-ano': 7,
    'ef2-8-ano': 8,
    'ef2-9-ano': 9,
  }

  const grades = await prisma.grade.findMany({
    select: { id: true, slug: true },
  })

  for (const grade of grades) {
    const year = gradeYearMappings[grade.slug]
    if (year) {
      await prisma.grade.update({
        where: { id: grade.id },
        data: { year },
      })
    }
  }

  console.log('✅ Alinhamento BNCC semeado com sucesso.')
}
