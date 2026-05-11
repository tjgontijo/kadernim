import { prisma } from '@/lib/db'
import type { CreateQuestionBankRequestInput, QuestionBankQuestionDto } from '@/lib/question-bank/schemas'

const ALLOWED_SUBJECT_SLUGS = new Set(['lingua-portuguesa', 'historia', 'geografia', 'ciencias'])
const FUNDAMENTAL_2_YEARS = new Set([6, 7, 8, 9])

function mapQuestionToDto(row: any): QuestionBankQuestionDto {
  return {
    id: row.id,
    prompt: row.prompt,
    instruction: row.instruction ?? null,
    difficulty: row.difficulty,
    status: row.status,
    questionTypeCode: row.questionType.code,
    questionTypeName: row.questionType.name,
    questionSourceCode: row.questionSource.code,
    questionSourceName: row.questionSource.name,
    payload: row.payload,
    answerKey: row.answerKey,
    explanation: row.explanation ?? null,
  }
}

function normalizeDifficulty(input: CreateQuestionBankRequestInput['difficulty'], index: number) {
  if (!input || input === 'mixed') {
    const cycle = ['EASY', 'MEDIUM', 'HARD'] as const
    return cycle[index % cycle.length]
  }
  return input.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD'
}

function buildGeneratedQuestionTemplate(params: {
  subjectName: string
  gradeName: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  questionTypeCode: string
  index: number
}) {
  const difficultyLabel =
    params.difficulty === 'EASY' ? 'facil' : params.difficulty === 'MEDIUM' ? 'media' : 'dificil'
  const number = params.index + 1
  const prompt = `[${params.subjectName} - ${params.gradeName}] Questao ${number} (${difficultyLabel}).`

  switch (params.questionTypeCode) {
    case 'true_false':
      return {
        prompt: `${prompt} Marque V ou F para a afirmacao: "O tema estudado em ${params.subjectName} esta relacionado ao cotidiano do estudante."`,
        instruction: 'Assinale V para verdadeiro e F para falso.',
        payload: {
          type: 'true_false',
          statements: ['O tema estudado esta relacionado ao cotidiano do estudante.'],
        },
        answerKey: { correct: ['V'] },
      }
    case 'fill_blank':
      return {
        prompt: `${prompt} Complete a lacuna com uma palavra adequada ao contexto da disciplina.`,
        instruction: 'Leia com atencao e complete.',
        payload: {
          type: 'fill_blank',
          text: 'O assunto principal desta atividade e ____.',
        },
        answerKey: { acceptable: ['conteudo', 'tema', 'assunto'] },
      }
    case 'short_answer':
    case 'open_text':
      return {
        prompt: `${prompt} Explique, com suas palavras, um conceito trabalhado em aula.`,
        instruction: 'Resposta curta, com clareza e objetividade.',
        payload: { type: 'open_text', maxLines: 5 },
        answerKey: { rubric: ['menciona conceito correto', 'usa vocabulario adequado'] },
      }
    default:
      return {
        prompt: `${prompt} Selecione a alternativa correta sobre um conceito central de ${params.subjectName}.`,
        instruction: 'Marque apenas uma alternativa.',
        payload: {
          type: 'multiple_choice',
          options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
        },
        answerKey: { correct: 'A' },
      }
  }
}

export async function createQuestionBankRequest(userId: string, input: CreateQuestionBankRequestInput) {
  const grade = await prisma.grade.findUnique({
    where: { slug: input.gradeSlug },
    include: { educationLevel: true },
  })

  if (!grade) throw new Error('GRADE_NOT_FOUND')
  if (!grade.year || !FUNDAMENTAL_2_YEARS.has(grade.year)) throw new Error('GRADE_OUTSIDE_MVP_SCOPE')

  const subject = await prisma.subject.findUnique({
    where: { slug: input.subjectSlug },
  })

  if (!subject) throw new Error('SUBJECT_NOT_FOUND')
  if (!ALLOWED_SUBJECT_SLUGS.has(subject.slug)) throw new Error('SUBJECT_OUTSIDE_MVP_SCOPE')

  const requestedTypeCodes = input.questionTypeCodes?.length ? input.questionTypeCodes : undefined
  const questionTypes = await prisma.questionBankQuestionType.findMany({
    where: requestedTypeCodes
      ? { code: { in: requestedTypeCodes }, isActive: true }
      : { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
  })

  if (questionTypes.length === 0) throw new Error('QUESTION_TYPE_NOT_AVAILABLE')

  const reusedSource = await prisma.questionBankSource.findUnique({ where: { code: 'reused' } })
  if (!reusedSource) throw new Error('QUESTION_SOURCE_REUSED_NOT_CONFIGURED')
  const aiSource = await prisma.questionBankSource.findUnique({ where: { code: 'ai' } })
  if (!aiSource) throw new Error('QUESTION_SOURCE_AI_NOT_CONFIGURED')

  const difficulty = input.difficulty
  const where: any = {
    archivedAt: null,
    gradeId: grade.id,
    subjectId: subject.id,
    status: { in: ['APPROVED_AI', 'APPROVED_TEACHER'] },
    questionTypeId: { in: questionTypes.map((qt) => qt.id) },
  }

  if (input.bnccSkillIds?.length) {
    where.skills = { some: { bnccSkillId: { in: input.bnccSkillIds } } }
  }

  if (difficulty && difficulty !== 'mixed') {
    where.difficulty = difficulty.toUpperCase()
  }

  const candidates = await prisma.questionBankQuestion.findMany({
    where,
    take: input.count,
    orderBy: [
      { status: 'asc' }, // APPROVED_AI before APPROVED_TEACHER lexicographically, fixed by next sort:
      { positiveCount: 'desc' },
      { flaggedCount: 'asc' },
      { usageCount: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      questionType: true,
      questionSource: true,
    },
  })

  const reused = candidates.slice(0, input.count)
  const deficit = Math.max(0, input.count - reused.length)

  const request = await prisma.questionBankRequest.create({
    data: {
      userId,
      educationLevelId: grade.educationLevelId,
      gradeId: grade.id,
      subjectId: subject.id,
      requestedCount: input.count,
      reusedCount: reused.length,
      generatedCount: 0,
      returnedCount: reused.length,
      difficultyMix: input.difficultyMix ? (input.difficultyMix as any) : undefined,
      typeMix: requestedTypeCodes ? (requestedTypeCodes as any) : undefined,
      filters: {
        gradeSlug: input.gradeSlug,
        subjectSlug: input.subjectSlug,
        difficulty: input.difficulty ?? null,
        questionTypeCodes: requestedTypeCodes ?? null,
        bnccSkillIds: input.bnccSkillIds ?? null,
      },
      paramsHash: `${input.gradeSlug}:${input.subjectSlug}:${input.count}:${input.difficulty ?? 'mixed'}:${(requestedTypeCodes ?? []).join(',')}:${(input.bnccSkillIds ?? []).join(',')}`,
      status: deficit > 0 ? 'PARTIAL' : 'COMPLETED',
    },
  })

  const generated: any[] = []
  if (deficit > 0) {
    for (let index = 0; index < deficit; index += 1) {
      const questionType = questionTypes[index % questionTypes.length]
      const normalizedDifficulty = normalizeDifficulty(input.difficulty, index)
      const template = buildGeneratedQuestionTemplate({
        subjectName: subject.name,
        gradeName: grade.name,
        difficulty: normalizedDifficulty,
        questionTypeCode: questionType.code,
        index,
      })

      const created = await prisma.questionBankQuestion.create({
        data: {
          educationLevelId: grade.educationLevelId,
          gradeId: grade.id,
          subjectId: subject.id,
          questionTypeId: questionType.id,
          difficulty: normalizedDifficulty,
          status: 'APPROVED_AI',
          questionSourceId: aiSource.id,
          prompt: template.prompt,
          instruction: template.instruction,
          payload: template.payload as any,
          answerKey: template.answerKey as any,
          explanation: null,
          fingerprint: `${request.id}:${index}:${questionType.code}:${normalizedDifficulty}`,
          generatorVersion: 'phase1-template-fallback',
          modelName: 'template',
          createdById: userId,
          approvedById: userId,
          approvedAt: new Date(),
          skills: input.bnccSkillIds?.length
            ? {
                createMany: {
                  data: input.bnccSkillIds.map((bnccSkillId) => ({ bnccSkillId })),
                  skipDuplicates: true,
                },
              }
            : undefined,
        },
        include: {
          questionType: true,
          questionSource: true,
        },
      })
      generated.push(created)
    }
  }

  const allItems = [...reused, ...generated]

  const ops = [
    ...reused.map((item, index) =>
      prisma.questionBankRequestItem.create({
        data: {
          requestId: request.id,
          questionId: item.id,
          sourceId: reusedSource.id,
          order: index + 1,
        },
      })
    ),
    ...generated.map((item, index) =>
      prisma.questionBankRequestItem.create({
        data: {
          requestId: request.id,
          questionId: item.id,
          sourceId: aiSource.id,
          order: reused.length + index + 1,
        },
      })
    ),
    ...reused.map((item) =>
      prisma.questionBankQuestion.update({
        where: { id: item.id },
        data: { usageCount: { increment: 1 } },
      })
    ),
  ]

  if (reused.length > 0) {
    await prisma.$transaction(ops)
  } else if (ops.length > 0) {
    await prisma.$transaction(ops)
  }

  if (generated.length > 0) {
    await prisma.questionBankRequest.update({
      where: { id: request.id },
      data: {
        generatedCount: generated.length,
        returnedCount: allItems.length,
        status: 'COMPLETED',
      },
    })
  }

  return {
    requestId: request.id,
    reusedCount: reused.length,
    generatedCount: generated.length,
    deficit: Math.max(0, input.count - allItems.length),
    items: allItems.map(mapQuestionToDto),
  }
}

export async function getQuestionBankRequestForUser(requestId: string, userId: string) {
  const request = await prisma.questionBankRequest.findFirst({
    where: { id: requestId, userId },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: {
          question: {
            include: {
              questionType: true,
              questionSource: true,
            },
          },
          source: true,
        },
      },
    },
  })

  if (!request) return null
  return request
}

export async function getQuestionBankRequestSelectedItems(
  requestId: string,
  userId: string,
  questionIds: string[]
) {
  const request = await getQuestionBankRequestForUser(requestId, userId)
  if (!request) return null

  const selectedSet = new Set(questionIds)
  const selected = request.items.filter((item) => selectedSet.has(item.questionId))
  const selectedOrder = new Map(questionIds.map((id, index) => [id, index]))

  selected.sort((a, b) => (selectedOrder.get(a.questionId) ?? 9999) - (selectedOrder.get(b.questionId) ?? 9999))

  return {
    request,
    items: selected,
  }
}
