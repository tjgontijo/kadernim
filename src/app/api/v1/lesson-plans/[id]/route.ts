import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { LessonPlanService } from '@/services/lesson-plans/lesson-plan-service';

/**
 * GET /api/v1/lesson-plans/[id]
 * 
 * Retorna os detalhes de um plano específico
 * Inclui descrições completas das habilidades BNCC
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const plan = await LessonPlanService.getByIdWithBnccDescriptions(id, {
            userId: session.user.id,
            isAdmin: session.user.role === 'admin',
        });

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'LESSON_PLAN_NOT_FOUND') {
            return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
        }

        if (error instanceof Error && error.message === 'LESSON_PLAN_FORBIDDEN') {
            return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
        }

        console.error('[GET /api/v1/lesson-plans/[id]] Error:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar plano de aula' },
            { status: 500 }
        );
    }
}
