import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/lib/db';
import { CreateLessonPlanSchema, FullLessonPlanContentSchema, type BnccSkillDetail } from '@/lib/schemas/lesson-plan';
import { canCreateLessonPlan } from '@/services/lesson-plans/get-usage';
import { incrementLessonPlanUsage } from '@/services/lesson-plans/increment-usage';
import { generateLessonPlanContent } from '@/services/lesson-plans/generate-content';
import { emitEvent } from '@/lib/inngest';

/**
 * GET /api/v1/lesson-plans
 *
 * Lista planos do usuário (ordenados por criação DESC)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: await (async () => {
        const h = new Headers();
        const { headers } = await import('next/headers');
        const headersList = await headers();
        headersList.forEach((value, key) => {
          h.append(key, value);
        });
        return h;
      })(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      );
    }

    // 2. Buscar planos do banco
    const plans = await prisma.lessonPlan.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('[GET /api/v1/lesson-plans] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao listar planos de aula',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/lesson-plans
 *
 * Cria um novo plano de aula com geração por IA
 *
 * Requisitos:
 * - Usuário autenticado
 * - Role: subscriber ou admin
 * - Dentro do limite mensal (30 planos/mês)
 *
 * Body:
 * {
 *   title: string,
 *   numberOfClasses: number,
 *   educationLevelSlug: string,
 *   gradeSlug?: string,
 *   subjectSlug?: string,
 *   ageRange?: string,
 *   fieldOfExperience?: string,
 *   bnccSkillCodes: string[]
 * }
 *
 * Resposta:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     title: string,
 *     content: {...},
 *     ...
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth.api.getSession({
      headers: await (async () => {
        const h = new Headers();
        const { headers } = await import('next/headers');
        const headersList = await headers();
        headersList.forEach((value, key) => {
          h.append(key, value);
        });
        return h;
      })(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não autenticado',
        },
        { status: 401 }
      );
    }

    // 2. Validar role (subscriber ou admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'subscriber' && user.role !== 'admin')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Apenas assinantes podem gerar planos de aula',
        },
        { status: 403 }
      );
    }

    // 3. Validar body
    const body = await request.json();
    const validation = CreateLessonPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Verificar limite mensal
    const canCreate = await canCreateLessonPlan(session.user.id);

    if (!canCreate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite mensal de planos atingido (30 planos/mês)',
        },
        { status: 429 }
      );
    }

    // 5. Buscar habilidades BNCC completas do banco (com contexto enriquecido)
    // Deduplicar códigos para evitar erro de contagem se o usuário selecionar a mesma habilidade
    const uniqueCodes = Array.from(new Set(data.bnccSkillCodes));

    console.log('[POST /api/v1/lesson-plans] Códigos recebidos do frontend:', data.bnccSkillCodes);
    console.log('[POST /api/v1/lesson-plans] Códigos únicos para busca:', uniqueCodes);

    const bnccSkills = await prisma.bnccSkill.findMany({
      where: {
        code: {
          in: uniqueCodes,
        },
      },
      select: {
        code: true,
        description: true,
        unitTheme: true,
        knowledgeObject: true,
        comments: true,
        curriculumSuggestions: true,
      },
    });

    console.log('[POST /api/v1/lesson-plans] Total de registros retornados:', bnccSkills.length);
    console.log('[POST /api/v1/lesson-plans] Códigos encontrados:', bnccSkills.map(s => s.code));

    // Verificar se todos os códigos únicos foram encontrados
    const foundCodes = new Set(bnccSkills.map(s => s.code));
    const missingCodes = uniqueCodes.filter(code => !foundCodes.has(code));

    if (missingCodes.length > 0) {
      console.error('[POST /api/v1/lesson-plans] Habilidades não encontradas:', missingCodes);
      return NextResponse.json(
        {
          success: false,
          error: 'Algumas habilidades BNCC não foram encontradas',
          details: { missingCodes },
        },
        { status: 400 }
      );
    }

    // Mapear para BnccSkillDetail (enriquecido), garantindo apenas um por código
    const skillMap = new Map<string, BnccSkillDetail>();
    bnccSkills.forEach((skill) => {
      if (!skillMap.has(skill.code)) {
        skillMap.set(skill.code, {
          code: skill.code,
          description: skill.description,
          unitTheme: skill.unitTheme || '',
          knowledgeObject: skill.knowledgeObject || '',
          comments: skill.comments || '',
          curriculumSuggestions: skill.curriculumSuggestions || '',
        } as any);
      }
    });

    const skillDetails: BnccSkillDetail[] = Array.from(skillMap.values());

    // 6. Gerar conteúdo com IA
    console.log('[POST /api/v1/lesson-plans] Gerando plano com IA...');

    const aiGeneratedContent = await generateLessonPlanContent({
      userId: session.user.id,
      title: data.title || data.intentRaw || '', // IA vai gerar título se vazio
      educationLevelSlug: data.educationLevelSlug,
      gradeSlug: data.gradeSlug,
      subjectSlug: data.subjectSlug,
      numberOfClasses: data.numberOfClasses,
      bnccSkills: skillDetails,
      intentRaw: data.intentRaw,
    });

    // Expandir conteúdo para o schema completo (garantir campos legados vazios)
    const content = FullLessonPlanContentSchema.parse(aiGeneratedContent);

    console.log('[POST /api/v1/lesson-plans] Plano gerado com sucesso');

    // 7. Gerar título se não fornecido
    // Prioridade: título do usuário > intentRaw > título gerado pela IA > knowledgeObject > fallback
    let finalTitle = data.title;

    if (!finalTitle) {
      // Tentar usar o intentRaw
      if (data.intentRaw && data.intentRaw.length >= 5) {
        finalTitle = data.intentRaw;
      }
      // Tentar usar o título gerado pela IA
      else if (content.title && content.title.length >= 5) {
        finalTitle = content.title;
      }
      // Tentar usar o knowledgeObject
      else if (content.knowledgeObject) {
        finalTitle = content.knowledgeObject;
      }
      // Fallback: usar knowledgeObject da primeira habilidade
      else if (skillDetails[0]?.knowledgeObject) {
        finalTitle = skillDetails[0].knowledgeObject;
      }
      // Fallback final
      else {
        finalTitle = `Plano de ${skillDetails[0]?.code || 'Aula'}`;
      }
    }

    // 8. Salvar no banco
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        userId: session.user.id,
        title: finalTitle,
        numberOfClasses: data.numberOfClasses,
        duration: data.numberOfClasses * 50, // 50 min por aula
        educationLevelSlug: data.educationLevelSlug,
        gradeSlug: data.gradeSlug,
        subjectSlug: data.subjectSlug,
        bnccSkillCodes: data.bnccSkillCodes,
        content: content as any, // JSON field
      },
    });

    console.log('[POST /api/v1/lesson-plans] Plano salvo:', lessonPlan.id);

    // 9. Incrementar uso mensal
    await incrementLessonPlanUsage(session.user.id);

    console.log('[POST /api/v1/lesson-plans] Uso incrementado');

    // 10. Retornar plano completo com URLs de download
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrls = {
      docx: `${baseUrl}/api/v1/lesson-plans/${lessonPlan.id}/export/docx`,
      pdf: `${baseUrl}/api/v1/lesson-plans/${lessonPlan.id}/export/pdf`,
    };

    // Emit event
    await emitEvent('lesson-plan.created', {
      lessonPlanId: lessonPlan.id,
      userId: lessonPlan.userId,
      title: lessonPlan.title,
      subject: lessonPlan.subjectSlug || '',
      grade: lessonPlan.gradeSlug || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: lessonPlan.id,
          userId: lessonPlan.userId,
          title: lessonPlan.title,
          numberOfClasses: lessonPlan.numberOfClasses,
          duration: lessonPlan.duration,
          educationLevelSlug: lessonPlan.educationLevelSlug,
          gradeSlug: lessonPlan.gradeSlug,
          subjectSlug: lessonPlan.subjectSlug,
          ageRange: lessonPlan.ageRange,
          fieldOfExperience: lessonPlan.fieldOfExperience,
          bnccSkillCodes: lessonPlan.bnccSkillCodes,
          content,
          createdAt: lessonPlan.createdAt,
          updatedAt: lessonPlan.updatedAt,
          downloadUrls,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/v1/lesson-plans] Error:', error);

    // Tratar erros específicos da geração de IA
    if (error instanceof Error) {
      // Se é erro da nossa função generateLessonPlanContent, já vem formatado
      if (error.message.includes('Limite de requisições') || error.message.includes('Plano muito complexo')) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 503 } // Service Unavailable
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao criar plano de aula',
      },
      { status: 500 }
    );
  }
}
