import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { prisma } from '@/lib/db';
import { LessonPlanService } from '@/services/lesson-plans/lesson-plan-service';
import { CreateLessonPlanSchema } from '@/schemas/lesson-plans/lesson-plan-schemas';

/**
 * GET /api/v1/lesson-plans
 */
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    const plans = await LessonPlanService.listByUser(session.user.id);

    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao listar planos de aula' }, { status: 500 });
  }
}

/**
 * POST /api/v1/lesson-plans
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    }

    // Validar role (assinante ou admin)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'subscriber' && user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Apenas assinantes podem gerar planos de aula' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = CreateLessonPlanSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: validation.error.issues },
        { status: 400 }
      );
    }

    const lessonPlan = await LessonPlanService.create(session.user.id, validation.data);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrls = {
      docx: `${baseUrl}/api/v1/lesson-plans/${lessonPlan.id}/export/docx`,
      pdf: `${baseUrl}/api/v1/lesson-plans/${lessonPlan.id}/export/pdf`,
    };

    return NextResponse.json(
      { success: true, data: { ...lessonPlan, downloadUrls } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'LIMIT_EXCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Limite mensal de planos atingido (30 planos/mês)' },
        { status: 429 }
      );
    }
    if (error.message === 'BNCC_SKILLS_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Algumas habilidades BNCC não foram encontradas' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: 'Erro ao criar plano de aula' }, { status: 500 });
  }
}
