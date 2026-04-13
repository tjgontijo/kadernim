import type { PrismaClient } from '../generated/prisma/client'

export async function seedTaxonomy(prisma: PrismaClient) {
  console.log('🌱 Semeando Taxonomia (EI, EF I e EF II)...')

  const educationLevels = [
    { name: 'Educação Infantil', slug: 'educacao-infantil', order: 1 },
    { name: 'Ensino Fundamental I', slug: 'ensino-fundamental-1', order: 2 },
    { name: 'Ensino Fundamental II', slug: 'ensino-fundamental-2', order: 3 },
  ] as const

  /**
   * Subjects = Componentes Curriculares (EF/EM) + Campos de Experiência (EI)
   */
  const subjects = [
    // Componentes Curriculares (Ensino Fundamental)
    { name: 'Língua Portuguesa', slug: 'lingua-portuguesa' },
    { name: 'Matemática', slug: 'matematica' },
    { name: 'Ciências', slug: 'ciencias' },
    { name: 'História', slug: 'historia' },
    { name: 'Geografia', slug: 'geografia' },
    { name: 'Arte', slug: 'arte' },
    { name: 'Educação Física', slug: 'educacao-fisica' },
    { name: 'Língua Inglesa', slug: 'lingua-inglesa' },
    { name: 'Ensino Religioso', slug: 'ensino-religioso' },

    // Matérias Extra-Curriculares / Suporte
    { name: 'Planejamento', slug: 'planejamento' },
    { name: 'Datas Importantes', slug: 'data-importante' },

    // Campos de Experiência (Educação Infantil)
    { name: 'O eu, o outro e o nós', slug: 'eu-outro-nos' },
    { name: 'Corpo, gestos e movimentos', slug: 'corpo-gestos-movimentos' },
    { name: 'Traços, sons, cores e formas', slug: 'tracos-sons-cores-formas' },
    { name: 'Escuta, fala, pensamento e imaginação', slug: 'escuta-fala-pensamento' },
    { name: 'Espaços, tempos, quantidades, relações e transformações', slug: 'espacos-tempos-quantidades' },
  ] as const

  const gradesByLevelSlug = {
    'educacao-infantil': [
      { name: 'Bebês (zero a 1 ano e 6 meses)', slug: 'ei-bebes', order: 1 },
      { name: 'Crianças bem pequenas (1 ano e 7 meses a 3 anos e 11 meses)', slug: 'ei-criancas-bem-pequenas', order: 2 },
      { name: 'Crianças pequenas (4 anos a 5 anos e 11 meses)', slug: 'ei-criancas-pequenas', order: 3 },
    ],

    'ensino-fundamental-1': [
      { name: '1º ano', slug: 'ef1-1-ano', order: 1 },
      { name: '2º ano', slug: 'ef1-2-ano', order: 2 },
      { name: '3º ano', slug: 'ef1-3-ano', order: 3 },
      { name: '4º ano', slug: 'ef1-4-ano', order: 4 },
      { name: '5º ano', slug: 'ef1-5-ano', order: 5 },
    ],

    'ensino-fundamental-2': [
      { name: '6º ano', slug: 'ef2-6-ano', order: 1 },
      { name: '7º ano', slug: 'ef2-7-ano', order: 2 },
      { name: '8º ano', slug: 'ef2-8-ano', order: 3 },
      { name: '9º ano', slug: 'ef2-9-ano', order: 4 },
    ],
  } as const

  type LevelSlug = keyof typeof gradesByLevelSlug
  type EfLevelSlug = Exclude<LevelSlug, 'educacao-infantil'>

  /**
   * Regras de GradeSubject por nível (100% BNCC)
   *
   * EF1 (1º ao 5º ano): 8 componentes (sem Língua Inglesa)
   * EF2 (6º ao 9º ano): 9 componentes (com Língua Inglesa obrigatória)
   */
  const gradeSubjectRules: Record<EfLevelSlug, readonly string[]> = {
    'ensino-fundamental-1': [
      'lingua-portuguesa',
      'lingua-inglesa',
      'matematica',
      'ciencias',
      'historia',
      'geografia',
      'arte',
      'educacao-fisica',
      'ensino-religioso',
      'planejamento',
      'data-importante',
    ],
    'ensino-fundamental-2': [
      'lingua-portuguesa',
      'matematica',
      'ciencias',
      'historia',
      'geografia',
      'arte',
      'educacao-fisica',
      'lingua-inglesa', // ← Obrigatória apenas a partir do 6º ano
      'ensino-religioso',
      'planejamento',
      'data-importante',
    ],
  }

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

  const levelRows = await prisma.educationLevel.findMany({ select: { id: true, slug: true } })
  const subjectRows = await prisma.subject.findMany({ select: { id: true, slug: true } })

  const levelIdBySlug = new Map(levelRows.map(l => [l.slug, l.id]))
  const subjectIdBySlug = new Map(subjectRows.map(s => [s.slug, s.id]))

  for (const levelSlug of Object.keys(gradesByLevelSlug) as LevelSlug[]) {
    const educationLevelId = levelIdBySlug.get(levelSlug)
    if (!educationLevelId) throw new Error(`EducationLevel não encontrado: ${levelSlug}`)

    for (const grade of gradesByLevelSlug[levelSlug]) {
      await prisma.grade.upsert({
        where: { slug: grade.slug },
        update: { name: grade.name, order: grade.order, educationLevelId },
        create: { name: grade.name, slug: grade.slug, order: grade.order, educationLevelId },
      })
    }

    // EI: vincular Campos de Experiência
    if (levelSlug === 'educacao-infantil') {
      const fieldsOfExperience = [
        'eu-outro-nos',
        'corpo-gestos-movimentos',
        'tracos-sons-cores-formas',
        'escuta-fala-pensamento',
        'espacos-tempos-quantidades',
        'planejamento',
        'data-importante',
      ]

      const gradeRows = await prisma.grade.findMany({
        where: { educationLevelId },
        select: { id: true },
      })

      for (const gr of gradeRows) {
        for (const fieldSlug of fieldsOfExperience) {
          const subjectId = subjectIdBySlug.get(fieldSlug)
          if (!subjectId) throw new Error(`Campo de Experiência não encontrado: ${fieldSlug}`)

          await prisma.gradeSubject.upsert({
            where: { gradeId_subjectId: { gradeId: gr.id, subjectId } },
            update: {},
            create: { gradeId: gr.id, subjectId },
          })
        }
      }

      continue
    }

    // EF: vincular Componentes Curriculares
    const subjectSlugs = gradeSubjectRules[levelSlug as EfLevelSlug]

    const gradeRows = await prisma.grade.findMany({
      where: { educationLevelId },
      select: { id: true },
    })

    for (const gr of gradeRows) {
      for (const subjectSlug of subjectSlugs) {
        const subjectId = subjectIdBySlug.get(subjectSlug)
        if (!subjectId) throw new Error(`Subject não encontrado: ${subjectSlug}`)

        await prisma.gradeSubject.upsert({
          where: { gradeId_subjectId: { gradeId: gr.id, subjectId } },
          update: {},
          create: { gradeId: gr.id, subjectId },
        })
      }
    }
  }

  console.log('✅ Taxonomia semeada com sucesso (EI, EF I e EF II).')
}
