import type { PrismaClient } from '../generated/prisma/client'

export async function seedTaxonomy(prisma: PrismaClient) {
    console.log('🌱 Semeando Taxonomia (Níveis e Matérias)...')

    const educationLevels = [
        { name: 'Educação Infantil', slug: 'EARLY_CHILDHOOD_EDUCATION', order: 1 },
        { name: 'Ensino Fundamental I', slug: 'ELEMENTARY_SCHOOL_I', order: 2 },
        { name: 'Ensino Fundamental II', slug: 'ELEMENTARY_SCHOOL_II', order: 3 },
        { name: 'Ensino Médio', slug: 'HIGH_SCHOOL', order: 4 },
    ]

    const subjects = [
        { name: 'Língua Portuguesa', slug: 'PORTUGUESE' },
        { name: 'Matemática', slug: 'MATHEMATICS' },
        { name: 'Ciências', slug: 'SCIENCE' },
        { name: 'História', slug: 'HISTORY' },
        { name: 'Geografia', slug: 'GEOGRAPHY' },
        { name: 'Língua Inglesa', slug: 'ENGLISH' },
        { name: 'Arte', slug: 'ART' },
        { name: 'Educação Física', slug: 'PHYSICAL_EDUCATION' },
        { name: 'Filosofia', slug: 'PHILOSOPHY' },
        { name: 'Sociologia', slug: 'SOCIOLOGY' },
        { name: 'Biologia', slug: 'BIOLOGY' },
        { name: 'Química', slug: 'CHEMISTRY' },
        { name: 'Física', slug: 'PHYSICS' },
        { name: 'Data Importante', slug: 'IMPORTANT_DATE' },
        { name: 'Planejamento', slug: 'PLANNING' },
    ]

    for (const level of educationLevels) {
        await prisma.educationLevel.upsert({
            where: { slug: level.slug },
            update: level,
            create: level,
        })
    }

    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { slug: subject.slug },
            update: subject,
            create: subject,
        })
    }

    console.log('✅ Taxonomia semeada.')
}
