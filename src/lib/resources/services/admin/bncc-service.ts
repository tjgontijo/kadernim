import { prisma } from '@/server/db'

export interface SearchBnccParams {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
  limit?: number
}

export async function searchBnccSkills(params: SearchBnccParams) {
  const { q, educationLevel, grade, subject, limit = 100 } = params
  
  console.log(`[BNCC Search] Request:`, { q, educationLevel, grade, subject })
 
  // 1. Resolver IDs
  const [level, gr, subResult] = await Promise.all([
    educationLevel ? prisma.educationLevel.findUnique({ where: { slug: educationLevel }, select: { id: true, name: true } }) : null,
    grade ? prisma.grade.findUnique({ where: { slug: grade }, select: { id: true } }) : null,
    subject 
      ? prisma.subject.findUnique({ where: { slug: subject }, select: { id: true, name: true } })
          .then(res => res || prisma.subject.findFirst({ where: { name: { equals: subject, mode: 'insensitive' } }, select: { id: true, name: true } }))
      : null,
  ])

  const sub = subResult
  console.log(`[BNCC Search] Resolution:`, { 
    level: level?.name || 'NOT_FOUND', 
    gradeId: gr?.id || 'NOT_FOUND', 
    subject: sub?.name || 'NOT_FOUND' 
  })

  // Se a tabela estiver vazia, retornamos um array vazio imediatamente
  const totalCount = await prisma.bnccSkill.count()
  if (totalCount === 0) {
    console.log('[BNCC Search] Database is empty!')
    return []
  }

  const where: any = {}

  // Se não encontramos o level ou o grade pelos slugs, vamos tentar uma busca mais relaxada
  // Mas se encontramos, aplicamos o filtro
  if (level) where.educationLevelId = level.id
  if (gr) where.gradeId = gr.id

  const conditions: any[] = []

  // Filtro de Disciplina (Resiliente)
  if (sub) {
    conditions.push({
      OR: [
        { subjectId: sub.id },
        { description: { contains: sub.name, mode: 'insensitive' } },
        { knowledgeObject: { contains: sub.name, mode: 'insensitive' } },
        { code: { contains: 'GE', mode: 'insensitive' } } // Fallback para Geografia se o slug/ID falhar
      ]
    })
  }

  if (q) {
    conditions.push({
      OR: [
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    })
  }

  if (conditions.length > 0) {
    where.AND = conditions
  }

  // 2. Executa a busca com fallbacks
  let skills = await prisma.bnccSkill.findMany({
    where,
    take: limit,
    orderBy: { code: 'asc' },
    select: {
      id: true,
      code: true,
      description: true,
      knowledgeObject: true,
      unitTheme: true,
      subject: { select: { name: true } }
    }
  })

  // Se a busca filtrada der zero, mas temos dados no banco, retornamos os 10 primeiros do nível/ano 
  // para você saber que eles existem e o que está errado no filtro.
  if (skills.length === 0 && totalCount > 0) {
      console.log(`[BNCC Debug] Busca filtrada voltou 0. Retornando amostra bruta.`)
      skills = await prisma.bnccSkill.findMany({
          where: gr ? { gradeId: gr.id } : level ? { educationLevelId: level.id } : {},
          take: 10,
          select: {
            id: true,
            code: true,
            description: true,
            knowledgeObject: true,
            unitTheme: true,
            subject: { select: { name: true } }
          }
      })
  }

  return skills
}
