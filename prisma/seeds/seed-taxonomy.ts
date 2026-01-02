import type { PrismaClient } from '../generated/prisma/client'

export async function seedTaxonomy(prisma: PrismaClient) {
  console.log('🌱 Semeando Taxonomia BNCC (EI, EF I e EF II)...')

  const educationLevels = [
    { name: 'Educação Infantil', slug: 'educacao-infantil', order: 1 },
    { name: 'Ensino Fundamental I', slug: 'ensino-fundamental-1', order: 2 },
    { name: 'Ensino Fundamental II', slug: 'ensino-fundamental-2', order: 3 },
  ] as const

  const subjects = [
    // Educação Infantil – Campos de Experiências
    { name: 'O eu, o outro e o nós', slug: 'ei-o-eu-o-outro-e-o-nos' },
    { name: 'Corpo, gestos e movimentos', slug: 'ei-corpo-gestos-e-movimentos' },
    { name: 'Traços, sons, cores e formas', slug: 'ei-tracos-sons-cores-e-formas' },
    { name: 'Escuta, fala, pensamento e imaginação', slug: 'ei-escuta-fala-pensamento-e-imaginacao' },
    { name: 'Espaços, tempos, quantidades, relações e transformações', slug: 'ei-espacos-tempos-quantidades-relacoes-e-transformacoes' },

    // Ensino Fundamental – Componentes Curriculares
    { name: 'Língua Portuguesa', slug: 'lingua-portuguesa' },
    { name: 'Matemática', slug: 'matematica' },
    { name: 'Ciências', slug: 'ciencias' },
    { name: 'História', slug: 'historia' },
    { name: 'Geografia', slug: 'geografia' },
    { name: 'Arte', slug: 'arte' },
    { name: 'Educação Física', slug: 'educacao-fisica' },
    { name: 'Língua Inglesa', slug: 'lingua-inglesa' },
    { name: 'Ensino Religioso', slug: 'ensino-religioso' }
  ] as const

  /**
   * 3) Grades por EducationLevel
   */
  const gradesByLevelSlug = {
    // Educação Infantil – Faixas Etárias
    'educacao-infantil': [
      { name: 'Bebês (zero a 1 ano e 6 meses)', slug: 'ei-bebes', order: 1 },
      { name: 'Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)', slug: 'ei-criancas-bem-pequenas', order: 2 },
      { name: 'Crianças pequenas (4 anos a 5 anos e 11 meses)', slug: 'ei-criancas-pequenas', order: 3 },
    ],

    // Ensino Fundamental I
    'ensino-fundamental-1': [
      { name: '1º ano', slug: 'ef1-1-ano', order: 1 },
      { name: '2º ano', slug: 'ef1-2-ano', order: 2 },
      { name: '3º ano', slug: 'ef1-3-ano', order: 3 },
      { name: '4º ano', slug: 'ef1-4-ano', order: 4 },
      { name: '5º ano', slug: 'ef1-5-ano', order: 5 },
    ],

    // Ensino Fundamental II
    'ensino-fundamental-2': [
      { name: '6º ano', slug: 'ef2-6-ano', order: 1 },
      { name: '7º ano', slug: 'ef2-7-ano', order: 2 },
      { name: '8º ano', slug: 'ef2-8-ano', order: 3 },
      { name: '9º ano', slug: 'ef2-9-ano', order: 4 },
    ],
  } as const

  type LevelSlug = keyof typeof gradesByLevelSlug

  /**
   * 4) Regras de Subjects por nível
   */
  const gradeSubjectRules: Record<LevelSlug, readonly string[]> = {
    'educacao-infantil': [
      'ei-o-eu-o-outro-e-o-nos',
      'ei-corpo-gestos-e-movimentos',
      'ei-tracos-sons-cores-e-formas',
      'ei-escuta-fala-pensamento-e-imaginacao',
      'ei-espacos-tempos-quantidades-relacoes-e-transformacoes',
    ],

    'ensino-fundamental-1': [
      'lingua-portuguesa',
      'matematica',
      'ciencias',
      'historia',
      'geografia',
      'arte',
      'educacao-fisica',
      'lingua-inglesa',
      'ensino-religioso',
    ],

    'ensino-fundamental-2': [
      'lingua-portuguesa',
      'matematica',
      'ciencias',
      'historia',
      'geografia',
      'arte',
      'educacao-fisica',
      'lingua-inglesa',
      'ensino-religioso',
    ],
  }

  /**
   * ===== EXECUÇÃO =====
   */

  // EducationLevel
  for (const level of educationLevels) {
    await prisma.educationLevel.upsert({
      where: { slug: level.slug },
      update: { name: level.name, order: level.order },
      create: { name: level.name, slug: level.slug, order: level.order },
    })
  }

  // Subject
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name },
      create: { name: subject.name, slug: subject.slug },
    })
  }

  // Map IDs
  const levelRows = await prisma.educationLevel.findMany({
    select: { id: true, slug: true },
  })
  const subjectRows = await prisma.subject.findMany({
    select: { id: true, slug: true },
  })

  const levelIdBySlug = new Map(levelRows.map(l => [l.slug, l.id]))
  const subjectIdBySlug = new Map(subjectRows.map(s => [s.slug, s.id]))

  // Grades + GradeSubject
  for (const levelSlug of Object.keys(gradesByLevelSlug) as LevelSlug[]) {
    const educationLevelId = levelIdBySlug.get(levelSlug)
    if (!educationLevelId) {
      throw new Error(`EducationLevel não encontrado para slug: ${levelSlug}`)
    }

    const grades = gradesByLevelSlug[levelSlug]

    for (const grade of grades) {
      await prisma.grade.upsert({
        where: { slug: grade.slug },
        update: {
          name: grade.name,
          order: grade.order,
          educationLevelId,
        },
        create: {
          name: grade.name,
          slug: grade.slug,
          order: grade.order,
          educationLevelId,
        },
      })
    }

    const subjectSlugs = gradeSubjectRules[levelSlug]

    const gradeRows = await prisma.grade.findMany({
      where: { educationLevelId },
      select: { id: true },
    })

    for (const grade of gradeRows) {
      for (const subjectSlug of subjectSlugs) {
        const subjectId = subjectIdBySlug.get(subjectSlug)
        if (!subjectId) {
          throw new Error(`Subject não encontrado para slug: ${subjectSlug}`)
        }

        await prisma.gradeSubject.upsert({
          where: {
            gradeId_subjectId: {
              gradeId: grade.id,
              subjectId,
            },
          },
          update: {},
          create: {
            gradeId: grade.id,
            subjectId,
          },
        })
      }
    }
  }

  console.log('✅ Taxonomia BNCC semeada com sucesso (EI, EF I e EF II).')
}
