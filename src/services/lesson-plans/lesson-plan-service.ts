import { prisma } from '@/lib/db'
import { emitEvent } from '@/lib/inngest'
import { generateLessonPlanContent } from './generate-content'
import { incrementLessonPlanUsage } from './increment-usage'
import { canCreateLessonPlan } from './get-usage'
import { FullLessonPlanContentSchema, type BnccSkillDetail } from '@/schemas/lesson-plans/lesson-plan-schemas'

export class LessonPlanService {
    static async listByUser(userId: string) {
        return prisma.lessonPlan.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        })
    }

    static async getById(id: string, userId?: string) {
        const where: any = { id }
        if (userId) where.userId = userId

        return prisma.lessonPlan.findUnique({
            where,
        })
    }

    static async getByIdWithBnccDescriptions(
        id: string,
        params: { userId: string; isAdmin: boolean }
    ) {
        const plan = await prisma.lessonPlan.findUnique({
            where: { id },
        })

        if (!plan) {
            throw new Error('LESSON_PLAN_NOT_FOUND')
        }

        if (plan.userId !== params.userId && !params.isAdmin) {
            throw new Error('LESSON_PLAN_FORBIDDEN')
        }

        const bnccSkillDescriptions = await prisma.bnccSkill.findMany({
            where: {
                code: {
                    in: plan.bnccSkillCodes || [],
                },
            },
            select: {
                code: true,
                description: true,
            },
        })

        return {
            ...plan,
            bnccSkillDescriptions,
        }
    }

    static async create(userId: string, data: any) {
        // 1. Verificar limite
        const canCreate = await canCreateLessonPlan(userId)
        if (!canCreate) {
            throw new Error('LIMIT_EXCEEDED')
        }

        // 2. Buscar BNCC skills
        const uniqueCodes = Array.from(new Set(data.bnccSkillCodes as string[]))
        const bnccSkills = await prisma.bnccSkill.findMany({
            where: { code: { in: uniqueCodes } },
        })

        if (bnccSkills.length !== uniqueCodes.length) {
            throw new Error('BNCC_SKILLS_NOT_FOUND')
        }

        const skillDetails: BnccSkillDetail[] = bnccSkills.map(s => ({
            code: s.code,
            description: s.description,
            unitTheme: s.unitTheme || '',
            knowledgeObject: s.knowledgeObject || '',
            comments: s.comments || '',
            curriculumSuggestions: s.curriculumSuggestions || '',
        }) as any)

        // 3. Gerar conteúdo IA
        const aiGeneratedContent = await generateLessonPlanContent({
            userId,
            title: data.title || data.intentRaw || '',
            educationLevelSlug: data.educationLevelSlug,
            gradeSlug: data.gradeSlug,
            subjectSlug: data.subjectSlug,
            numberOfClasses: data.numberOfClasses,
            bnccSkills: skillDetails,
            intentRaw: data.intentRaw,
        })

        const content = FullLessonPlanContentSchema.parse(aiGeneratedContent)

        // 4. Determinar título final
        let finalTitle = data.title || data.intentRaw || content.title || skillDetails[0]?.knowledgeObject || `Plano de ${skillDetails[0]?.code}`

        // 5. Salvar
        const lessonPlan = await prisma.lessonPlan.create({
            data: {
                userId,
                title: finalTitle,
                numberOfClasses: data.numberOfClasses,
                duration: data.numberOfClasses * 50,
                educationLevelSlug: data.educationLevelSlug,
                gradeSlug: data.gradeSlug,
                subjectSlug: data.subjectSlug,
                bnccSkillCodes: data.bnccSkillCodes,
                content: content as any,
            },
        })

        // 6. Incrementar uso
        await incrementLessonPlanUsage(userId)

        // 7. Emitir evento
        await emitEvent('lesson-plan.created', {
            lessonPlanId: lessonPlan.id,
            userId: lessonPlan.userId,
            title: lessonPlan.title,
            subject: lessonPlan.subjectSlug || '',
            grade: lessonPlan.gradeSlug || '',
        })

        return { ...lessonPlan, content }
    }

    static async delete(id: string, userId: string) {
        return prisma.lessonPlan.delete({
            where: { id, userId }
        })
    }
}
